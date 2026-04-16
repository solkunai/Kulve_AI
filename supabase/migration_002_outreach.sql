-- Run this in Supabase SQL Editor AFTER the first migration

-- Add outreach email to brand kits
alter table public.brand_kits add column outreach_email text unique;

-- Outreach campaigns table
create table public.outreach_campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  status text default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  channel text not null check (channel in ('email', 'linkedin', 'dm')),
  total_sent int default 0,
  total_opened int default 0,
  total_replied int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Outreach messages table
create table public.outreach_messages (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.outreach_campaigns(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_email text not null,
  to_email text not null,
  to_name text,
  subject text not null,
  body text not null,
  status text default 'queued' check (status in ('queued', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed')),
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz default now()
);

-- Inbound replies table
create table public.outreach_replies (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.outreach_messages(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_email text not null,
  from_name text,
  subject text,
  body text not null,
  is_forwarded boolean default false,
  forwarded_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.outreach_campaigns enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.outreach_replies enable row level security;

-- Campaigns: users can CRUD their own
create policy "Users can view own campaigns" on public.outreach_campaigns for select using (auth.uid() = user_id);
create policy "Users can insert own campaigns" on public.outreach_campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own campaigns" on public.outreach_campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own campaigns" on public.outreach_campaigns for delete using (auth.uid() = user_id);

-- Messages: users can view their own
create policy "Users can view own messages" on public.outreach_messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.outreach_messages for insert with check (auth.uid() = user_id);
create policy "Users can update own messages" on public.outreach_messages for update using (auth.uid() = user_id);

-- Replies: users can view their own
create policy "Users can view own replies" on public.outreach_replies for select using (auth.uid() = user_id);
create policy "Users can update own replies" on public.outreach_replies for update using (auth.uid() = user_id);
