-- Sponsor inquiries submitted through the form on /sponsor and /pricing
-- (app/api/sponsor-inquiry). Idempotent.
-- The offer values match lib/sponsor-offers.ts. If an earlier version of this script was already
-- run, the block at the bottom replaces its offer check.
-- Server-only: RLS enabled with no policies, accessed via the service role.
create table if not exists public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  offer text not null check (offer in ('founding_sponsor', 'single_slot', 'dossier_sponsor', 'other')),
  message text not null,
  source_page text,
  created_at timestamptz not null default now()
);
create index if not exists idx_sponsor_inquiries_created_at on public.sponsor_inquiries (created_at desc);
alter table public.sponsor_inquiries enable row level security;

-- Explicit permissions also work when automatic Data API grants are disabled.
revoke all on public.sponsor_inquiries from public, anon, authenticated;
grant select, insert, update on public.sponsor_inquiries to service_role;

-- Acceptance by the email provider is NOT proof of inbox delivery. Null means
-- pending or unconfirmed; these rows remain available for operator follow-up.
alter table public.sponsor_inquiries add column if not exists notification_email_id text;
alter table public.sponsor_inquiries add column if not exists notification_accepted_at timestamptz;

-- Replace the offer check on a table created by an earlier version of this script (safe to re-run).
alter table public.sponsor_inquiries drop constraint if exists sponsor_inquiries_offer_check;
alter table public.sponsor_inquiries add constraint sponsor_inquiries_offer_check
  check (offer in ('founding_sponsor', 'single_slot', 'dossier_sponsor', 'other')) not valid;  -- not valid: old rows are left alone, new inserts are checked
