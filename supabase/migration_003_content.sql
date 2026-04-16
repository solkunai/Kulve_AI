-- Run this in Supabase SQL Editor

-- Generated content storage
create table public.generated_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('marketing_plan', 'social_post', 'outreach_email', 'newsletter', 'tagline', 'website_copy')),
  title text not null,
  content jsonb not null,
  status text default 'draft' check (status in ('draft', 'approved', 'posted', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.generated_content enable row level security;

create policy "Users can view own content" on public.generated_content for select using (auth.uid() = user_id);
create policy "Users can insert own content" on public.generated_content for insert with check (auth.uid() = user_id);
create policy "Users can update own content" on public.generated_content for update using (auth.uid() = user_id);
create policy "Users can delete own content" on public.generated_content for delete using (auth.uid() = user_id);
