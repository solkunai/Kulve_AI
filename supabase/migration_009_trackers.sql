-- Migration 009 — Business Trackers: Inventory, Sales Log, Client List
--
-- Basic, fixed-schema native trackers so businesses can keep their SKU list,
-- a log of individual sales, and a client roster inside Kulvé instead of
-- juggling Excel/QuickBooks/a separate CRM. Deliberately NOT a generic
-- no-code table builder — three purpose-built tables covering the most
-- common small-business data, following the same "connections" provenance
-- pattern established in migration_008 (CSV imports link back to a
-- `connections` row so re-imports can upsert instead of duplicating).
--
-- Run in Supabase SQL Editor (supabase.com > your project > SQL Editor).
-- Safe to re-run — uses IF NOT EXISTS / wrapped in a transaction.

begin;

-- ── inventory_items ──────────────────────────────────────────────────────
create table if not exists public.inventory_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  sku            text,
  category       text,
  quantity       numeric not null default 0,
  unit_price     numeric,
  reorder_point  numeric,
  notes          text,
  connection_id  uuid references public.connections(id) on delete set null,
  metadata       jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Lets CSV re-imports upsert by SKU instead of duplicating. Rows with no SKU
  -- are never deduped (Postgres treats NULLs as distinct in a unique constraint),
  -- which is fine — items without a SKU always insert as new.
  unique (user_id, sku)
);

create index if not exists inventory_items_user_idx on public.inventory_items(user_id);

alter table public.inventory_items enable row level security;

drop policy if exists "Users manage own inventory_items" on public.inventory_items;
create policy "Users manage own inventory_items" on public.inventory_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── sales_log ────────────────────────────────────────────────────────────
-- No unique constraint here on purpose: a sales log is an append-only event
-- stream (two real sales can legitimately share the same date/amount), so CSV
-- imports always insert new rows rather than trying to upsert/dedupe.
create table if not exists public.sales_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  sale_date       date not null,
  item_name       text,
  quantity        numeric not null default 1,
  amount          numeric not null,
  customer_name   text,
  payment_method  text,
  notes           text,
  connection_id   uuid references public.connections(id) on delete set null,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists sales_log_user_idx on public.sales_log(user_id);
create index if not exists sales_log_user_date_idx on public.sales_log(user_id, sale_date);

alter table public.sales_log enable row level security;

drop policy if exists "Users manage own sales_log" on public.sales_log;
create policy "Users manage own sales_log" on public.sales_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── clients ──────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  email               text,
  phone               text,
  company             text,
  status              text not null default 'active' check (status in ('active', 'lead', 'inactive')),
  last_contacted_at   timestamptz,
  notes               text,
  connection_id       uuid references public.connections(id) on delete set null,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Lets CSV re-imports upsert by email instead of duplicating. Rows with no
  -- email are never deduped (NULLs are distinct in a unique constraint).
  unique (user_id, email)
);

create index if not exists clients_user_idx on public.clients(user_id);

alter table public.clients enable row level security;

drop policy if exists "Users manage own clients" on public.clients;
create policy "Users manage own clients" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;

-- Verification (run separately):
-- select table_name from information_schema.tables where table_name in ('inventory_items','sales_log','clients');
