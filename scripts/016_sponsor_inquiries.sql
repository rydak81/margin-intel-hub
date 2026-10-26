-- Sponsor inquiries submitted through the form on /sponsor and /pricing
-- (app/api/sponsor-inquiry). Idempotent.
-- Server-only: RLS enabled with no policies, accessed via the service role.
create table if not exists public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  offer text not null check (offer in ('newsletter_slot', 'tool_listing', 'dossier_sponsor', 'other')),
  message text not null,
  source_page text,
  created_at timestamptz not null default now()
);
create index if not exists idx_sponsor_inquiries_created_at on public.sponsor_inquiries (created_at desc);
alter table public.sponsor_inquiries enable row level security;
