import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.VITE_RESEND_API_KEY || '');

// Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Price ID to plan mapping
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_TRIAL!]: 'trial',
  [process.env.STRIPE_PRICE_STARTER!]: 'starter',
  [process.env.STRIPE_PRICE_GROWTH!]: 'growth',
  [process.env.STRIPE_PRICE_SCALE!]: 'scale',
};

// ============================================================
// STRIPE WEBHOOK — Must come BEFORE express.json() middleware
// Needs raw body for signature verification
// ============================================================
app.post('/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('No STRIPE_WEBHOOK_SECRET set — skipping signature verification (dev mode)');
      // In dev without webhook secret, parse the body manually
      try {
        const event = JSON.parse(req.body.toString());
        await handleStripeEvent(event);
        return res.json({ received: true });
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await handleStripeEvent(event);
    res.json({ received: true });
  }
);

async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const planType = session.metadata?.plan_type;

      if (session.mode === 'subscription' && userId && planType) {
        await supabaseAdmin.from('profiles').update({
          plan: planType,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
        console.log(`✓ Subscription activated: ${planType} for user ${userId}`);
      }

      if (session.mode === 'payment' && userId) {
        await supabaseAdmin.from('profiles').update({
          brand_kit_purchased: true,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
        console.log(`✓ Brand kit purchased for user ${userId}`);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const { data: profile } = await supabaseAdmin.from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        // Reset monthly usage counters
        await supabaseAdmin.from('profiles').update({
          usage_counts: { marketing_plans: 0, graphics: 0, social_posts: 0, outreach_emails: 0, newsletters: 0 },
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        console.log(`✓ Usage reset for user ${profile.id} (invoice paid)`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.warn(`✗ Payment failed for customer ${invoice.customer}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0]?.price.id;
      const newPlan = PRICE_TO_PLAN[priceId];

      if (newPlan) {
        await supabaseAdmin.from('profiles').update({
          plan: newPlan,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId);
        console.log(`✓ Plan updated to ${newPlan} for customer ${customerId}`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      await supabaseAdmin.from('profiles').update({
        plan: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId);
      console.log(`✓ Subscription cancelled for customer ${customerId}`);
      break;
    }
  }
}

// ============================================================
// JSON PARSING — After webhook route
// ============================================================
app.use(express.json());

// ============================================================
// AUTH MIDDLEWARE — Verify Supabase JWT
// ============================================================
async function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }

  (req as any).user = user;
  next();
}

// ============================================================
// STRIPE CHECKOUT SESSION
// ============================================================
app.post('/api/checkout/session', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const { priceId, mode } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin.from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || 'subscription',
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        plan_type: PRICE_TO_PLAN[priceId] || 'brand_kit',
      },
      ...(mode !== 'payment' && {
        subscription_data: {
          metadata: { supabase_user_id: user.id },
        },
      }),
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// STRIPE CUSTOMER PORTAL
// ============================================================
app.post('/api/checkout/portal', authenticateUser, async (req, res) => {
  const user = (req as any).user;

  const { data: profile } = await supabaseAdmin.from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: 'No subscription found' });
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PRICE IDS ENDPOINT — Frontend needs these to create sessions
// ============================================================
app.get('/api/stripe/prices', (_req, res) => {
  res.json({
    trial: process.env.STRIPE_PRICE_TRIAL,
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    scale: process.env.STRIPE_PRICE_SCALE,
    brandKit: process.env.STRIPE_PRICE_BRAND_KIT,
  });
});

// ============================================================
// EMAIL SENDING (Resend)
// ============================================================
app.post('/api/send-email', async (req, res) => {
  const { from, to, subject, html, text } = req.body;

  if (!from || !to || !subject) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from, to, subject,
      html: html || text,
      text: text || '',
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, id: data?.id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// HEALTH CHECK (for uptime monitoring + keep-alive)
// ============================================================
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// SERVE FRONTEND (production only — Vite handles this in dev)
// ============================================================
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// All non-API routes serve the React app (SPA client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Kulvé API running on http://localhost:${PORT}`);
  console.log(`  - Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ configured' : '✗ missing key'}`);
  console.log(`  - Resend: ${process.env.VITE_RESEND_API_KEY ? '✓ configured' : '✗ missing key'}`);
  console.log(`  - Supabase: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ configured' : '✗ missing key'}`);

  // Keep-alive: ping ourselves every 14 minutes to prevent cold starts on free tier
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    setInterval(() => {
      fetch(`${APP_URL}/api/health`).catch(() => {});
    }, 14 * 60 * 1000); // 14 minutes
    console.log(`  - Keep-alive: ✓ pinging ${APP_URL}/api/health every 14 min`);
  }
});
