-- Add mobile support for onboarding and login
-- Run this migration in Supabase SQL editor (or your migration pipeline).

alter table if exists public.signup_requests
  add column if not exists mobile text;

alter table if exists public.profiles
  add column if not exists mobile text;

-- Normalize existing values to digits-only where possible
update public.signup_requests
set mobile = regexp_replace(coalesce(mobile, ''), '\\D', '', 'g')
where mobile is not null;

update public.profiles
set mobile = regexp_replace(coalesce(mobile, ''), '\\D', '', 'g')
where mobile is not null;

-- Keep mobile unique on profiles so login lookup is deterministic
create unique index if not exists profiles_mobile_unique_idx
  on public.profiles (mobile)
  where mobile is not null and mobile <> '';

-- Speed up pending-request checks by mobile
create index if not exists signup_requests_mobile_idx
  on public.signup_requests (mobile);
