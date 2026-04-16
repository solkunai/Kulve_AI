-- Run this in Supabase SQL Editor

-- Referral codes and tracking
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referral_code text unique not null,
  referred_id uuid references public.profiles(id) on delete set null,
  referred_email text,
  status text default 'pending' check (status in ('pending', 'signed_up', 'paid', 'active')),
  commission_percent numeric default 10,
  discount_percent numeric default 15,
  created_at timestamptz default now(),
  converted_at timestamptz,
  first_paid_at timestamptz
);

-- Add referral fields to profiles
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id);
alter table public.profiles add column if not exists referral_earnings numeric default 0;

-- Enable RLS
alter table public.referrals enable row level security;

-- Users can view their own referrals
create policy "Users can view own referrals" on public.referrals for select using (auth.uid() = referrer_id);
create policy "Users can insert own referrals" on public.referrals for insert with check (auth.uid() = referrer_id);
create policy "Users can view referrals they used" on public.referrals for select using (auth.uid() = referred_id);

-- Allow update for system (when someone signs up with a code)
create policy "System can update referrals" on public.referrals for update using (true);
