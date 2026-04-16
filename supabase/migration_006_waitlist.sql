-- Run this in Supabase SQL Editor

create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  interested_plan text,
  source text default 'plans_page',
  created_at timestamptz default now()
);

-- Public insert (anyone can join waitlist, no auth needed)
alter table public.waitlist enable row level security;
create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);
create policy "Only admins can read waitlist" on public.waitlist for select using (false);
