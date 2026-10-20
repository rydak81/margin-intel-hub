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
