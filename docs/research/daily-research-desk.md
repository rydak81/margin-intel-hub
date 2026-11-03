# Daily original-research desk

Status: research measurement layer; no deployment, publication, database writes, paid model calls or email sends. Reuse the existing analyst and editorial pages. This tool supplies reproducible evidence for a writer; it does not replace source review.

## Run

Requires Node 24. Use the existing connected database to export the bounded query below as a JSON object, then run:

```sh
node --import ./tests/register-ts.mjs scripts/research-desk.mjs INPUT.json OUTPUT.json
node --import ./tests/register-ts.mjs --test tests/research-desk.test.ts tests/operator-editorial-policy.test.ts
```

The output file must not exist. Output records include original source URLs and article IDs. Keep exports private; never commit source text, credentials, subscriber data or vendor records. The export is a read-only operation. No schema migration or new provider is needed.

Use a fixed cutoff at the start of the latest complete UTC day, with two adjacent equal windows. Replace the example cutoff before each new run. The query reads all matching rows: do not set `complete: true` on a capped or interrupted export. If the connector truncates output, use consistent keyset pagination or hold the run.

```sql
with params as (
  select '2026-11-03T00:00:00Z'::timestamptz as cutoff, 14 as days
)
select jsonb_build_object(
  'asOf', to_char(p.cutoff at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'days', p.days, 'complete', true,
  'rows', coalesce((select jsonb_agg(jsonb_build_object(
    'id', a.id, 'title', a.title, 'source_url', a.source_url,
    'source_name', a.source_name, 'published_at', a.published_at,
    'relevant', a.relevant, 'relevance_score', a.relevance_score,
    'category', a.category) order by a.published_at, a.id)
    from public.articles a
    where a.published_at >= p.cutoff - make_interval(days => 2 * p.days)
      and a.published_at < p.cutoff), '[]'::jsonb)
) as research_input from params p;
```

## Measurement contract

- Eligible records: stored relevant=true, finite relevance score >=40 and the existing operator editorial filter. No reclassification or paid inference.
- Unit: an eligible, deduplicated news headline. ID, normalized headline and canonical URL links are collapsed as connected duplicate groups; earliest deterministic representative wins. Paraphrased syndication may remain.
- Domains must contribute at least five eligible headlines in each window. A candidate needs at least three matched domains, twenty articles per window, seventy percent retention in matched domains, a recent eligible publication, and five topic matches per window.
- These thresholds are editorial screening rules, not a statistical-power calculation. `candidate` means worth reviewing, never publication approval.
- Report numerator, denominator, dates and both pooled and equally weighted per-source percentage-point changes. Hold a direction that reverses when sources receive equal weight.
- Fixed, deliberately narrow headline rules cover agentic commerce, fees/margins, fulfillment/returns and advertising. Record the method version when changing the dictionary. Review missed synonyms; never tune a rule after seeing the result merely to obtain a stronger headline.
- Do not call headline mentions adoption, demand, market share, revenue or causal effects. Do not present a purposive news sample as a representative survey.

## Editorial loop

1. Research: verify current source freshness; run the evidence export and calculator; examine existing articles for duplication; retain one run ID and a cutoff.
2. Write: choose a supported angle with a useful operator decision. Open primary source pages for material external claims. Draft original analysis with method, exclusions, counter-explanations and a practical action. A workflow case study must distinguish tested behavior from a prototype.
3. Review: recheck every number, link and unit; inspect sources behind the strongest finding. Hold weak or stale stories and record why. Do not invent an article to fill a daily quota.
4. Stage: use the existing `AnalysisArticle` format and repository review workflow. Reuse the site's date, source, disclosure, imagery, SEO and newsletter-source conventions. A scheduled research run is not evidence of a live publication.
5. Measure: track qualified inquiries and paid pilots from articles, not only output volume. Do not claim time saved, client revenue or conversion lift without a measured baseline and comparable outcome.

Aim for daily evidence checks and an original publishable piece when the evidence supports it. Weekly deeper reports can reuse a stable cohort and a clearly dated method. Never treat a successful research calculation as proof that a publishing endpoint, analytics integration or deployment works.

## Verification

Tests exercise window boundaries, incomplete/stale inputs, duplicate chains, source churn, thin samples and a Simpson reversal. No production route or scheduler is changed by this addition. A full application build is still required for a later change that wires this into a deployed route or publishes new site content.
