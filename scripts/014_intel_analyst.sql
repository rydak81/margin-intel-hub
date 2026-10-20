-- Intelligence ledger + resident analyst agent schema.
-- Applied to production via Supabase migration on 2026-10-20; kept here so a
-- clean or staging environment can be provisioned from the repo's scripts.
-- Idempotent: safe to re-run.

-- The public forecast ledger (created in production alongside the October 2026
-- dossier; included here for clean environments). Probabilities are internal
-- and never selected by the app.
create table if not exists intel_forecasts (
  id bigint primary key,
  made_on date,
  horizon text check (horizon in ('0-3m', '3-6m', '6-12m', '12-24m')),
  statement text not null,
  probability numeric check (probability > 0 and probability < 1),
  confirming_indicators text,
  invalidating_indicators text,
  resolve_by date,
  resolved_on date,
  outcome text check (outcome in ('correct', 'partially_correct', 'incorrect', 'unresolvable')),
  outcome_notes text,
  dossier_edition text,
  created_at timestamptz not null default now()
);
alter table intel_forecasts enable row level security;

-- Live indicator status per forecast, written by the analyst agent's daily run.
alter table intel_forecasts
  add column if not exists indicator_signal text check (indicator_signal in ('confirming', 'invalidating', 'mixed', 'none')),
  add column if not exists indicator_note text,
  add column if not exists indicators_checked_at timestamptz;

-- Persistent memory for the resident analyst agent: observations, hypotheses,
-- corrections of its own earlier conclusions, and forecast post-mortems.
-- Server-only: RLS enabled with no policies, accessed via the service role.
create table if not exists intel_memory (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('observation', 'hypothesis', 'correction', 'post_mortem')),
  title text not null,
  body text not null,
  confidence text check (confidence in ('low', 'medium', 'high')),
  sources jsonb,
  related_forecasts bigint[],
  run_id uuid,
  superseded_by uuid references intel_memory(id)
);
alter table intel_memory enable row level security;

-- One row per analyst run: the day's assessment, watchlist, and which forecast
-- indicators were checked. The public analyst log reads from here.
create table if not exists intel_analyst_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  created_at timestamptz not null default now(),
  assessment text not null,
  watchlist jsonb,
  forecast_checks jsonb,
  articles_considered int,
  memory_written int,
  provider text,
  model text
);
alter table intel_analyst_runs enable row level security;

create index if not exists intel_analyst_runs_date_idx on intel_analyst_runs (run_date desc, created_at desc);
create index if not exists intel_memory_created_idx on intel_memory (created_at desc);

-- Seed: the 12 Edition 1 forecasts with the resolve-by dates committed in
-- the published dossier (lib/forecasts.ts is the canonical copy). Probabilities are
-- internal-only and deliberately not stored in the repository, so they are
-- left null here. Idempotent via on conflict do nothing.
insert into intel_forecasts (id, made_on, horizon, statement, confirming_indicators, invalidating_indicators, resolve_by, dossier_edition) values
  (1, '2026-10-14', '0-3m', 'US online holiday sales (Nov 1-Dec 31, 2026) grow >=6% YoY', 'Adobe/Salesforce holiday trackers; Census Q4 e-commerce report', 'UMich sentiment <44 plus parcel network disruption; growth prints <6%', '2027-01-31', '2026-10 Edition 1'),
  (2, '2026-10-14', '0-3m', 'Effective Q4 2026 residential parcel cost inflation for DTC sellers lands >=8% despite 5.9% headline GRIs', 'Carrier surcharge tables; shipper invoice analyses', 'Surcharge rollbacks or peak-fee waivers', '2027-01-31', '2026-10 Edition 1'),
  (3, '2026-10-14', '0-3m', 'AI-referred retail traffic at least doubles YoY during Cyber Week 2026 and its conversion premium stays >=25%', 'Adobe Analytics holiday telemetry', 'Premium compresses below 25% as volume scales; traffic growth <100%', '2027-01-31', '2026-10 Edition 1'),
  (4, '2026-10-14', '0-3m', 'TikTok Shop US full-year 2026 GMV >= $20B', 'Momentum Works / eMarketer full-year updates', 'Post-divestiture operational disruption; estimates land <$20B', '2027-01-31', '2026-10 Edition 1'),
  (5, '2026-10-14', '3-6m', 'Amazon 2027 US fee announcement contains no headline referral increase but raises net seller cost via surcharge/restructure layering', 'Seller Central fee notice (expected Dec 2026-Jan 2027)', 'A flat, surcharge-free 2027 schedule or headline referral increase', '2027-04-30', '2026-10 Edition 1'),
  (6, '2026-10-14', '3-6m', 'Walmart extends fee-cut or WFS-incentive playbook to additional categories to sustain >40% marketplace growth', 'Seller Center policy updates; Q3/Q4 FY27 earnings', 'Walmart raises marketplace fees instead', '2027-04-30', '2026-10 Edition 1'),
  (7, '2026-10-14', '3-6m', 'At least one additional top-10 US marketplace (excluding Amazon) signs a formal AI-agent access integration', 'Platform announcements (UCP, ACP successor, or equivalent)', 'Industry-wide agent blocking following Amazon precedent', '2027-04-30', '2026-10 Edition 1'),
  (8, '2026-10-14', '6-12m', 'US average effective tariff rate moves >=2 points in either direction from ~10.9% within 12 months', 'Yale Budget Lab effective-rate series; Federal Register actions', 'Twelve months of rate stability within +/-2 points', '2027-10-14', '2026-10 Edition 1'),
  (9, '2026-10-14', '6-12m', 'Used/refurbished smartphone unit growth outpaces new-unit growth in full-year 2026 data', 'IDC / Counterpoint annual used-smartphone reports', 'New-unit resurgence on an upgrade supercycle', '2027-10-31', '2026-10 Edition 1'),
  (10, '2026-10-14', '12-24m', 'De minimis is not restored before the statutory repeal (July 2027) takes effect', 'Federal Register / CBP rulemaking record', 'Congressional reversal restoring the exemption', '2027-07-01', '2026-10 Edition 1'),
  (11, '2026-10-14', '12-24m', 'Consolidated multichannel operation (one console + one fulfillment network serving >=3 channels) becomes the default stack for new multichannel sellers, with Amazon a top-2 provider', 'Seller surveys; MCF adoption disclosures; console market share data', 'Antitrust action or broad seller refusal of cross-channel data sharing', '2028-10-31', '2026-10 Edition 1'),
  (12, '2026-10-14', '12-24m', 'Agentic commerce exceeds 2% of US e-commerce sessions by October 2027', 'Adobe / Contentsquare session-share measurements', 'Platform-wide agent blocking or stalled consumer adoption', '2027-10-31', '2026-10 Edition 1')
on conflict (id) do nothing;
