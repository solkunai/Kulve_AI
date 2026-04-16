-- Run this in Supabase SQL Editor

-- Add Stripe fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_kit_purchased boolean DEFAULT false;

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
