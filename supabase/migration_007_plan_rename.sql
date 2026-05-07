-- Migration 007 — Rename pricing tiers to match new structure.
--
-- New tier names: basic ($10), operator ($89), scale ($249)
-- Old tier names: starter ($250), growth ($500), scale ($1,500)
--
-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor).
-- Safe: migrates existing data first, then swaps the constraint atomically.

begin;

-- 1. Migrate any existing data from old → new names.
update public.profiles set plan = 'basic'    where plan = 'starter';
update public.profiles set plan = 'operator' where plan = 'growth';
-- 'scale' stays the same — no migration needed.

-- 2. Drop the old check constraint.
-- (Postgres auto-names constraints as "<table>_<column>_check" when defined inline.)
alter table public.profiles
  drop constraint if exists profiles_plan_check;

-- 3. Add the new check constraint with the new tier names.
--    Includes 'trial' for the 7-day free trial period on Basic.
alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('trial', 'basic', 'operator', 'scale'));

commit;

-- Verification queries (optional — run separately to confirm):
-- select plan, count(*) from public.profiles group by plan;
-- select pg_get_constraintdef(oid) from pg_constraint where conname = 'profiles_plan_check';
