-- Signal AI Research v1. Additive, private evidence store; existing application tables are untouched.
create schema ai_research;
revoke all on schema ai_research from public, anon, authenticated;
grant usage on schema ai_research to service_role;

create table ai_research.runs (
 id text primary key, started_at timestamptz not null default now(), cutoff timestamptz not null,
 finished_at timestamptz, status text not null check(status in ('running','complete','partial','failed')),
 method_version text not null, counts jsonb not null default '{}', notes text not null default ''
);
create table ai_research.sources (
 id text primary key, name text not null, url text not null unique check(url ~ '^https://'),
 domain text not null, kind text not null check(kind in ('primary','paper','benchmark','dataset','forum','news','expert','code','platform')),
 access_method text not null check(access_method in ('web','rss','api','manual')),
 priority int not null check(priority between 1 and 3), cadence_days int not null check(cadence_days>0),
 status text not null default 'candidate' check(status in ('candidate','active','blocked','paused')),
 rights_policy text not null default 'Links, metadata and original paraphrases only; full text requires permission.',
 notes text not null default '', created_at timestamptz not null default now()
);
create table ai_research.source_checks (
 run_id text not null references ai_research.runs(id), source_id text not null references ai_research.sources(id),
 checked_at timestamptz not null, outcome text not null check(outcome in ('ok','no_change','blocked','error','skipped')),
 documents_found int not null default 0 check(documents_found>=0), detail text not null default '',
 primary key(run_id,source_id)
);
create table ai_research.documents (
 id text primary key, source_id text not null references ai_research.sources(id),
 canonical_url text not null unique check(canonical_url ~ '^https://'), title text not null,
 published_at timestamptz, date_precision text not null check(date_precision in ('timestamp','day','unknown')),
 first_seen_at timestamptz not null, last_seen_at timestamptz not null,
 topics text[] not null default '{}', origin_group text not null,
 check(last_seen_at>=first_seen_at),check((published_at is null)=(date_precision='unknown'))
);
create index source_checks_source_date on ai_research.source_checks(source_id,checked_at desc);
create index documents_source_date on ai_research.documents(source_id,published_at);
create index documents_topics on ai_research.documents using gin(topics);
create table ai_research.document_versions (
 id text primary key, document_id text not null references ai_research.documents(id),
 run_id text not null references ai_research.runs(id), retrieved_at timestamptz not null,
 summary text not null check(length(summary)<=6000), content_sha256 text not null check(content_sha256 ~ '^[a-f0-9]{64}$'),
 hash_scope text not null default 'original_summary' check(hash_scope in ('original_summary','licensed_fulltext')),
 access_status text not null check(access_status in ('read','metadata_only')),
 unique(document_id,content_sha256)
);
create index versions_run on ai_research.document_versions(run_id);
create table ai_research.claims (
 id text primary key, statement text not null, topic text not null, entity text not null,
 epistemic_status text not null check(epistemic_status in ('vendor_claim','documented_fact','independent_test','anecdote','inference','disputed')),
 availability text not null check(availability in ('general','preview','invitation','announced','unknown','not_applicable')),
 created_at timestamptz not null, supersedes_id text references ai_research.claims(id), rationale text not null
);
create index claims_supersedes on ai_research.claims(supersedes_id);
create table ai_research.claim_evidence (
 claim_id text not null references ai_research.claims(id), version_id text not null references ai_research.document_versions(id),
 relation text not null check(relation in ('supports','contradicts','context')),
 locator text not null, primary key(claim_id,version_id,relation)
);
create index evidence_version on ai_research.claim_evidence(version_id);
create table ai_research.observations (
 id text primary key, version_id text not null references ai_research.document_versions(id),
 entity text not null, metric text not null, value numeric not null check(value::text not in ('NaN','Infinity','-Infinity')),
 unit text not null, observed_at timestamptz not null, effective_at timestamptz,
 basis text not null check(basis in ('published_price','vendor_reported','independent_measurement','own_measurement')),
 comparison_key text not null, conditions jsonb not null, method_version text not null,
 numerator numeric, denominator numeric check(denominator is null or denominator>0)
);
create index observations_series on ai_research.observations(entity,metric,comparison_key,observed_at desc);
create index observations_version on ai_research.observations(version_id);
create table ai_research.forecasts (
 id text primary key, question text not null, created_at timestamptz not null, resolve_by timestamptz not null,
 initial_probability numeric not null check(initial_probability between 0 and 1),
 resolution_criteria text not null, rationale text not null, assumptions jsonb not null,
 status text not null default 'open' check(status in ('open','resolved','void')),
 outcome smallint check(outcome in (0,1)), resolved_at timestamptz, resolution_url text,
 check(resolve_by>created_at), check((status='resolved')=(outcome is not null)),
 check(status<>'resolved' or (resolved_at is not null and resolution_url is not null))
);
create table ai_research.forecast_updates (
 id text primary key, forecast_id text not null references ai_research.forecasts(id),
 recorded_at timestamptz not null, probability numeric not null check(probability between 0 and 1),
 reason text not null, evidence_version_ids text[] not null default '{}'
);
create index forecast_updates_series on ai_research.forecast_updates(forecast_id,recorded_at);
create table ai_research.reports (
 id text primary key, run_id text not null references ai_research.runs(id), title text not null,
 body_md text not null, method_version text not null, cutoff timestamptz not null,
 status text not null default 'draft' check(status in ('draft','ready','held','published','corrected')),
 disclosure text not null, limitations text not null, created_at timestamptz not null default now(),
 published_url text, check(status not in ('published','corrected') or published_url is not null)
);
create index reports_run on ai_research.reports(run_id);
create table ai_research.report_claims (
 report_id text not null references ai_research.reports(id), claim_id text not null references ai_research.claims(id),
 primary key(report_id,claim_id)
);
create index report_claims_claim on ai_research.report_claims(claim_id);
create table ai_research.social_drafts (
 id text primary key, report_id text not null references ai_research.reports(id), platform text not null,
 persona text not null, format text not null, hook text not null, body text not null,
 hypothesis text not null, status text not null default 'draft' check(status in ('draft','approved','published','held')),
 created_at timestamptz not null default now(), published_url text,
 check(status<>'published' or published_url is not null)
);
create index drafts_report on ai_research.social_drafts(report_id);
create table ai_research.performance_snapshots (
 id text primary key, draft_id text not null references ai_research.social_drafts(id), observed_at timestamptz not null,
 window_hours int not null check(window_hours>0), impressions bigint check(impressions>=0),
 views bigint check(views>=0), saves bigint check(saves>=0), shares bigint check(shares>=0),
 clicks bigint check(clicks>=0), follows bigint check(follows>=0), qualified_leads bigint check(qualified_leads>=0),
 retention_pct numeric check(retention_pct between 0 and 100), evidence_url text not null,
 notes text not null default '', unique(draft_id,window_hours)
);

create view ai_research.latest_observations with(security_invoker=true) as
 select distinct on(entity,metric,comparison_key) * from ai_research.observations
 order by entity,metric,comparison_key,observed_at desc,id;
create view ai_research.forecast_scorecard with(security_invoker=true) as
 select id,question,initial_probability,outcome,power(initial_probability-outcome,2) as initial_brier_score
 from ai_research.forecasts where status='resolved';
create view ai_research.source_health with(security_invoker=true) as
 select s.id,s.name,s.status,s.cadence_days,max(c.checked_at) as last_check,
 max(c.checked_at) filter(where c.outcome in ('ok','no_change')) as last_success
 from ai_research.sources s left join ai_research.source_checks c on c.source_id=s.id group by s.id;

do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='ai_research' loop
  execute format('alter table ai_research.%I enable row level security',r.tablename);
 end loop;
end $$;
revoke all on all tables in schema ai_research from public,anon,authenticated;
revoke all on all functions in schema ai_research from public,anon,authenticated;
grant select,insert,update on all tables in schema ai_research to service_role;
alter default privileges in schema ai_research revoke all on tables from public,anon,authenticated;
alter default privileges in schema ai_research revoke execute on functions from public;
