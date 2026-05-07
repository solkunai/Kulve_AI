import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// Resend key — accept both names while migrating away from VITE_ prefix.
const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '');
// Anthropic — server-only.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || '',
});

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
// AI GENERATION (Anthropic) — proxy keeps API key off the client
// ============================================================
app.post('/api/ai/generate', authenticateUser, async (req, res) => {
  const { prompt, systemPrompt } = req.body ?? {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system:
        typeof systemPrompt === 'string' && systemPrompt.length > 0
          ? systemPrompt
          : 'You are a marketing expert helping local businesses create compelling content.',
      messages: [{ role: 'user', content: prompt }],
    });
    const block = message.content[0];
    const text = block && block.type === 'text' ? block.text : '';
    res.json({ text });
  } catch (err: any) {
    console.error('AI generate error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'AI generation failed' });
  }
});

// ============================================================
// LEAD-GEN PROXIES — Google Places, Apollo, Serper
// All require auth so unauth'd visitors can't drain paid API quotas.
// ============================================================

// Google Places (text search)
app.post('/api/leads/places-search', authenticateUser, async (req, res) => {
  const { query, pageToken } = req.body ?? {};
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!key) return res.status(503).json({ error: 'Google Places not configured' });
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const body: Record<string, unknown> = {
      textQuery: query,
      pageSize: 20,
      languageCode: 'en',
      regionCode: 'us',
    };
    if (pageToken) body.pageToken = pageToken;

    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.types,places.googleMapsUri,nextPageToken',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('Google Places error:', r.status, text);
      return res.status(r.status).json({ error: 'Places API error' });
    }
    res.json(await r.json());
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Places lookup failed' });
  }
});

// Apollo — find decision-maker emails by domain
app.post('/api/leads/apollo-find-email', authenticateUser, async (req, res) => {
  const { domain } = req.body ?? {};
  const key = process.env.APOLLO_API_KEY || process.env.VITE_APOLLO_API_KEY;
  if (!key) return res.status(503).json({ error: 'Apollo not configured' });
  if (!domain) return res.status(400).json({ error: 'Missing domain' });

  try {
    const r = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({
        q_organization_domains: domain,
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director', 'manager'],
        per_page: 3,
        page: 1,
      }),
    });
    if (!r.ok) return res.json({ people: [] });
    res.json(await r.json());
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Apollo lookup failed' });
  }
});

// Serper — Google search proxy (used to scrape contact emails from a site)
app.post('/api/leads/serper-search', authenticateUser, async (req, res) => {
  const { q, num } = req.body ?? {};
  const key = process.env.SERPER_API_KEY || process.env.VITE_SERPER_API_KEY;
  if (!key) return res.status(503).json({ error: 'Serper not configured' });
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, num: num || 5 }),
    });
    if (!r.ok) return res.json({ organic: [] });
    res.json(await r.json());
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Serper search failed' });
  }
});

// ============================================================
// ADMIN AUTH — server-side password check (no leak to client)
// ============================================================
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body ?? {};
  const expected = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
  if (!expected) {
    return res.status(503).json({ ok: false, error: 'Admin not configured' });
  }
  if (typeof password !== 'string' || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Wrong password' });
  }
  res.json({ ok: true });
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
  const hasResend = !!(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);
  const hasAnthropic = !!(process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY);
  console.log(`  - Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ configured' : '✗ missing key'}`);
  console.log(`  - Resend: ${hasResend ? '✓ configured' : '✗ missing key'}`);
  console.log(`  - Anthropic: ${hasAnthropic ? '✓ configured' : '✗ missing key'}`);
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
