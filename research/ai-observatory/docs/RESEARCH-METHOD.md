# Research method v1

## Coverage

Track frontier and compact models; open weights and licenses; inference cost and latency; agents and tool reliability; image, video and audio; enterprise adoption; ecommerce; infrastructure and compute; research methods; governance and security; and creator/distribution practices. Use the 36-source registry as a starting panel, not an exhaustive list.

Source classes have different jobs. Provider announcements establish release and access facts. Papers supply methods and findings, with preprint status preserved. Independent evaluations are interpreted within their harness. Datasets can establish trends only within their measured population. News provides context. Forums expose practical questions and reported failures. Expert newsletters help discover arguments; they are not additional independent confirmations of a vendor announcement.

Every source has a retrieval method, cadence, access status and rights policy. Default storage is metadata, links and original concise paraphrases. Store full documents only when licensed or otherwise permitted. No paywall bypass, indiscriminate social scraping or private community ingestion.

## Data model

| Layer | Tables | Purpose |
|---|---|---|
| Operations | runs, sources, source_checks | Cutoff, method, coverage, health and failure history |
| Evidence | documents, document_versions | Stable URL identity, dates, versioned summaries and hashes |
| Claims | claims, claim_evidence | Atomic propositions, supporting/contrary evidence, epistemic status |
| Measurements | observations | Value, unit, conditions, basis, observation/effective dates |
| Forecasts | forecasts, forecast_updates | Original probability, dated revisions, resolution and calibration |
| Editorial | reports, report_claims, social_drafts | Cited reports, limitations, draft assets and publication status |
| Outcomes | performance_snapshots | Actual owned-channel analytics at fixed post ages |

## Metrics that are defensible

1. Source coverage = successfully checked due sources / all due sources. Keep blocked and skipped in the denominator. Report source-class coverage separately.
2. Primary-evidence rate = claims supported by at least one primary document / all claims in the report. This measures provenance, not factual certainty.
3. Model price changes = percentage change in published price for the same model/metric/conditions. Keep caching, batch, time tier, resolution and token direction separate. Report provider date and observed date.
4. Release frequency = deduplicated model/product release events per window. Distinguish an announcement, preview, general release and updated availability.
5. Topic coverage = topic documents / eligible documents in a fixed source cohort. Compare adjacent equal windows with a fixed method and cutoff. Use origin groups to collapse syndication. Eligibility and topic rules must be set before seeing results.
6. Source-balanced topic change = mean of each matched source's share change, in percentage points. Require at least three matched source domains, five eligible documents per domain per window, twenty documents per window, five topic matches per window and 70% retained coverage. These are screening rules, not statistical power. Hold direction claims when pooled and balanced measures reverse.
7. Benchmark comparisons require identical benchmark version, task set, scoring, tool budget and comparable sampling. Publish separate panels when methods differ. Never average unrelated leaderboard scores into a single capability index.
8. Forum themes are anecdotal counts within an explicitly sampled cohort. Stars, downloads, votes and mentions are proxies with distinct meanings; none is revenue or adoption.
9. Content results use actual platform exports at 24 hours, 72 hours and seven days. Store missing values as null. Saves/1,000 impressions, shares/1,000 impressions, follows/1,000 impressions and qualified inquiries/1,000 impressions are useful within-platform measures. Do not compare a TikTok view with a LinkedIn impression as if they were equivalent.
10. Cost per accepted research item includes inference, search, hosting and human correction. Record measured costs when available; unknown cost is not zero.

## Forecasting protocol

Start with falsifiable event forecasts and transparent scenarios, not an invented adoption curve. Before recording a probability, specify the exact event, baseline evidence, competing explanation, assumptions, deadline and authoritative resolution source. Label it as an analyst probability judgment. Store the initial probability permanently; revisions append to `forecast_updates` with a reason. Do not retrospectively change the original forecast to improve results.

Resolve binary outcomes only when the predeclared criteria are met. Record the actual resolution date, source and outcome. A missing result is unresolved or void, not automatically false. Brier score = mean((probability − outcome)^2), lower is better. Score the initial forecast and separately the last forecast made before the event; show sample size. Do not claim calibration with a handful of outcomes.

Quantitative time-series projections require a documented series, enough stable observations for the chosen method, missingness checks, a naive baseline, rolling out-of-sample backtesting and uncertainty intervals. Freeze training cutoffs to prevent leakage. Until this exists, publish conditional scenarios with explicit assumptions. The initial database deliberately contains no fabricated history or forecasts.

## Report and release gate

A report must have a supported original argument, dated links behind material claims, reproducible numbers, an exact cohort, methods, counter-evidence, uncertainty and an operator decision. Separate what happened, what is inferred and what is forecast. Keep automated-authorship disclosure honest. A report can be useful even when its conclusion is that a direction cannot yet be established.

Corrections append new evidence and identify the superseded claim. Keep material revisions visible. Social posts remain drafts until the intended account and publication authorization are established. Website publication uses the existing MarketplaceBeta editorial checks.
