-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Profiles table (auto-created on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  business_name text,
  plan text check (plan in ('starter', 'growth', 'scale')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Brand kits table
create table public.brand_kits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logo_url text,
  primary_color text default '#3b6dca',
  secondary_color text default '#1a1f36',
  accent_color text default '#10b981',
  heading_font text default 'Inter',
  body_font text default 'Inter',
  business_name text not null,
  industry text not null,
  description text not null,
  target_customer text not null,
  tone_of_voice text default 'Professional',
  social_instagram text,
  social_facebook text,
  social_linkedin text,
  social_x text,
  social_tiktok text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.brand_kits enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Brand kits: users can CRUD their own
create policy "Users can view own brand kit" on public.brand_kits for select using (auth.uid() = user_id);
create policy "Users can insert own brand kit" on public.brand_kits for insert with check (auth.uid() = user_id);
create policy "Users can update own brand kit" on public.brand_kits for update using (auth.uid() = user_id);
create policy "Users can delete own brand kit" on public.brand_kits for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
