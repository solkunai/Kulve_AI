-- Migration 007 — Rename pricing tiers to match new structure.
--
-- New tier names: basic ($10), operator ($89), scale ($249)
-- Old tier names: starter ($250), growth ($500), scale ($1,500)
--
-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor).
-- Safe: drops the old constraint first, migrates data, then adds the new
-- constraint — all atomic in one transaction.

begin;

-- 1. Drop any existing check constraint on the plan column FIRST.
--    Doing this before the UPDATEs lets us migrate to the new tier names
--    (operator/basic) without violating the old constraint.
--    Defensive: finds it by definition pattern, not by hardcoded name.
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%plan%'
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

-- 2. Migrate any existing data from old → new names.
update public.profiles set plan = 'basic'    where plan = 'starter';
update public.profiles set plan = 'operator' where plan = 'growth';
-- 'scale', 'free', 'trial' stay the same — no migration needed.

-- 3. Add the new check constraint with the new tier names.
--    Keeps 'free' and 'trial' allowed — those are still used in code
--    (free tier defaults, 7-day trial period on Basic).
alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'trial', 'basic', 'operator', 'scale'));

commit;

-- Verification queries (optional — run separately to confirm):
-- select plan, count(*) from public.profiles group by plan;
-- select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.profiles'::regclass and contype = 'c';
