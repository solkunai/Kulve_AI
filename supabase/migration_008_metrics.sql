-- Migration 008 — Business Cockpit: connections + normalized metrics
--
-- Phase 1 of the all-in-one business dashboard. Establishes two tables:
--   • connections — one row per data source a user links
--                   ('csv' | 'manual' | 'stripe' | 'quickbooks' | 'xero' | 'excel' | 'microsoft' ...)
--   • metrics     — normalized time-series KPI values. The cockpit reads ONLY from here,
--                   no matter which source produced the number. Every future integration
--                   is just a new translator that writes rows into this table.
--
-- Run in Supabase SQL Editor (supabase.com > your project > SQL Editor).
-- Safe to re-run — uses IF NOT EXISTS / wrapped in a transaction.

begin;

-- ── connections ──────────────────────────────────────────────────────────
create table if not exists public.connections (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  provider       text not null,                       -- 'csv' | 'manual' | 'stripe' | 'quickbooks' | 'xero' | 'excel' | 'microsoft'
  display_name   text,                                -- friendly label, e.g. "Stripe — Acme LLC"
  status         text not null default 'connected',   -- 'connected' | 'error' | 'disconnected'
  -- OAuth tokens are written ONLY by the server (service role) for API providers.
  -- For 'csv' / 'manual' sources these stay null. Once real OAuth lands we'll move
  -- token storage fully server-side (Supabase Vault) and stop returning them to clients.
  access_token   text,
  refresh_token  text,
  expires_at     timestamptz,
  metadata       jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists connections_user_idx on public.connections(user_id);

alter table public.connections enable row level security;

drop policy if exists "Users manage own connections" on public.connections;
create policy "Users manage own connections" on public.connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── metrics ──────────────────────────────────────────────────────────────
create table if not exists public.metrics (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  metric_key    text not null,        -- 'mrr' | 'revenue' | 'sales' | 'new_customers' | 'active_customers' | 'churn_rate'
  value         numeric not null,
  period_start  date not null,        -- the day this value represents (month-start for monthly grain)
  period_grain  text not null default 'month',  -- 'day' | 'week' | 'month'
  source        text not null default 'manual', -- which provider produced it
  connection_id uuid references public.connections(id) on delete set null,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  -- One value per metric per period per grain — re-imports replace rather than duplicate.
  unique (user_id, metric_key, period_start, period_grain)
);

create index if not exists metrics_user_key_idx on public.metrics(user_id, metric_key, period_start);

alter table public.metrics enable row level security;

drop policy if exists "Users view own metrics" on public.metrics;
drop policy if exists "Users insert own metrics" on public.metrics;
drop policy if exists "Users update own metrics" on public.metrics;
drop policy if exists "Users delete own metrics" on public.metrics;
create policy "Users view own metrics"  on public.metrics for select using (auth.uid() = user_id);
create policy "Users insert own metrics" on public.metrics for insert with check (auth.uid() = user_id);
create policy "Users update own metrics" on public.metrics for update using (auth.uid() = user_id);
create policy "Users delete own metrics" on public.metrics for delete using (auth.uid() = user_id);

commit;

-- Verification (run separately):
-- select table_name from information_schema.tables where table_name in ('metrics','connections');
-- select metric_key, count(*) from public.metrics group by metric_key;
