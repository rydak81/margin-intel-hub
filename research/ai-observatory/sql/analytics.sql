-- Run individually through the authorized connector. Read-only, private research.

-- 1. What needs attention? Registered candidates are not silently treated as healthy.
select id,name,status,last_success,cadence_days
from ai_research.source_health
where status<>'paused' and (last_success is null or last_success<now()-make_interval(days=>cadence_days))
order by last_success nulls first limit 50;

-- 2. Latest comparable observations. No cross-benchmark composite score.
select o.entity,o.metric,o.value,o.unit,o.comparison_key,o.conditions,o.observed_at,d.canonical_url
from ai_research.latest_observations o
join ai_research.document_versions v on v.id=o.version_id
join ai_research.documents d on d.id=v.document_id
order by o.entity,o.metric limit 100;

-- 3. Changes within the same measurement conditions. Zero baselines remain undefined.
with history as (
 select *,lag(value) over(partition by entity,metric,comparison_key order by observed_at,id) as previous_value
 from ai_research.observations
)
select entity,metric,value,previous_value,unit,comparison_key,observed_at,
 100*(value-previous_value)/nullif(previous_value,0) as change_pct
from history where previous_value is not null order by observed_at desc limit 100;

-- 4. Forecast calibration: an empty set returns n=0 and a null score, never perfect accuracy.
select count(*) as resolved_forecasts,avg(initial_brier_score) as mean_initial_brier_score
from ai_research.forecast_scorecard;

-- 5. Coverage for a run. Replace the run id with the current run's recorded identity.
select outcome,count(*) as source_checks,sum(documents_found) as documents_found
from ai_research.source_checks where run_id='signal-bootstrap-2026-11-07' group by outcome;

-- 6. Evidence for a report: provides exact URLs for the publication editor.
select c.statement,c.epistemic_status,c.availability,e.relation,e.locator,d.canonical_url,v.retrieved_at
from ai_research.report_claims rc join ai_research.claims c on c.id=rc.claim_id
join ai_research.claim_evidence e on e.claim_id=c.id
join ai_research.document_versions v on v.id=e.version_id
join ai_research.documents d on d.id=v.document_id
where rc.report_id='signal-brief-2026-11-07' order by c.id,e.relation;

-- 7. First-party social metrics only, with null/missing denominators preserved.
select s.platform,s.format,p.window_hours,p.impressions,
 1000.0*p.saves/nullif(p.impressions,0) as saves_per_1000_impressions,
 1000.0*p.qualified_leads/nullif(p.impressions,0) as leads_per_1000_impressions
from ai_research.performance_snapshots p join ai_research.social_drafts s on s.id=p.draft_id
order by p.observed_at desc limit 100;
