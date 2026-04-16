import { supabase } from './supabase';

/**
 * Get the current user's auth token for API requests.
 */
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token;
}

/**
 * Fetch Stripe price IDs from the server.
 */
export async function getStripePrices(): Promise<{
  trial: string;
  starter: string;
  growth: string;
  scale: string;
  brandKit: string;
}> {
  const res = await fetch('/api/stripe/prices');
  return res.json();
}

/**
 * Create a Stripe Checkout session and redirect to payment.
 */
export async function createCheckoutSession(
  priceId: string,
  mode: 'subscription' | 'payment' = 'subscription'
): Promise<void> {
  const token = await getAuthToken();

  const res = await fetch('/api/checkout/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ priceId, mode }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

/**
 * Open the Stripe Customer Portal for managing subscriptions.
 */
export async function openCustomerPortal(): Promise<void> {
  const token = await getAuthToken();

  const res = await fetch('/api/checkout/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  window.location.href = data.url;
}

/**
 * Subscribe to a plan.
 */
export async function subscribeToPlan(plan: 'trial' | 'starter' | 'growth' | 'scale'): Promise<void> {
  const prices = await getStripePrices();
  const priceId = prices[plan];
  if (!priceId) throw new Error(`Unknown plan: ${plan}`);
  await createCheckoutSession(priceId, 'subscription');
}

/**
 * Purchase the standalone brand kit.
 */
export async function purchaseBrandKit(): Promise<void> {
  const prices = await getStripePrices();
  await createCheckoutSession(prices.brandKit, 'payment');
}
