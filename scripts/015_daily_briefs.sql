-- Daily brief archive, written by app/api/news/daily-brief before each send.
-- Applied to production via Supabase migration; kept here so clean and staging
-- databases can be provisioned from the repo's scripts. Idempotent.
-- Server-only: RLS enabled with no policies, accessed via the service role.
create table if not exists daily_briefs (
  id text primary key,
  brief_date date not null,
  content text not null,
  article_count integer,
  article_ids text[],
  provider text,
  model text,
  created_at timestamptz default now()
);
alter table daily_briefs enable row level security;
