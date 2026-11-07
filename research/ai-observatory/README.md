# Signal — AI Research Observatory

Owner and public analyst: Ryan Dacus. Working editorial identity: **The AI Operator**.
Signal is the disclosed AI research assistant, not a fictional human expert.

## What v1 does

A scheduled research agent reads current primary sources and selected research, benchmark, community and news sources; stores dated original evidence summaries in a private Postgres schema; compares like-for-like observations; produces a cited research brief and platform-specific drafts. The daily run is hosted by ChatGPT Automations and uses the authorized GitHub, web and Supabase connections. It does not depend on a local computer being awake or on a new model API subscription.

This extends MarketplaceBeta's established research operation. GitHub versions code, methods and editorial instructions. Supabase stores evidence and history. MarketplaceBeta's existing Vercel application remains the publication surface, through its existing reviewed editorial workflow. No second database service, duplicate cron, autonomous social posting, or paid data subscription is needed for this first version.

## Assets

- `agent/INSTRUCTIONS.md`: executable operating instructions and failure behavior.
- `docs/PERSONA.md`: profile copy, character, voice, series and initial post concepts.
- `docs/RESEARCH-METHOD.md`: collection, evidence, metrics and forecasting contract.
- `docs/AUDIENCE-RESEARCH.md`: qualitative creator-pattern study and measured growth experiment.
- `data/sources.json`: 36 discovery targets, with verified active sources distinguished from candidates.
- `sql/schema.sql`: additive private `ai_research` schema and analytics views.
- `sql/analytics.sql`: bounded operational and analytic queries.
- `scripts/evidence.py`: validation, safe SQL compilation, source-balanced changes and forecast scoring.
- `tests/test_evidence.py`: meaningful failure, injection, cohort and arithmetic checks.
- `data/bootstrap.json`: nine reviewed primary-source documents, nine claims, seven numeric observations, a first brief and a social draft. This is a small baseline, not a historical industry dataset.

## Run locally

Python 3.10 or later, standard library only:

```sh
python3 -m unittest discover -s research/ai-observatory/tests -v
python3 research/ai-observatory/scripts/evidence.py INPUT.json --sql OUTPUT.sql
```

Send the validated SQL through the authorized Supabase connector for the MarketplaceBeta project. The compiler only writes the `ai_research` schema and cannot approve or publish reports. It uses one transaction and stable identities. Replay the same packet safely; changed summaries require new version IDs. Do not rerun `bootstrap.py` as a daily collector: it is a reproducible initial seed builder, not a live web scraper.

## Storage boundaries

Private schema: `ai_research` in the existing MarketplaceBeta database. No anonymous or signed-in public-client access is granted. RLS is enabled on every table. Existing articles, subscribers, leads and application settings are untouched. The connector accesses the private schema with the existing authorized database role. Production websites do not query these private tables directly.

Store URLs, dates, original paraphrases, claim lineage, numeric observations and derived analysis. Do not commit third-party full text, private forum content, customer records or credentials. If licensed full documents become necessary, add private object storage with a retention policy; avoid buying that infrastructure before there is a need.

## Publication and ownership

The agent creates evidence-backed drafts. Ryan's current website publishing desk retains its existing authorization and verification requirements. Social accounts, biographies, posts and comments are not modified by this implementation. The persona package is ready for Ryan to use on his accounts; no new account or handle has been registered.

## Verification and limits

Source registration does not mean every feed is connected. An active source has had a linked primary document read; each scheduled run still logs successful, blocked and skipped checks. Community sources are discovery leads, not representative surveys. Forecast tables and scoring are ready, but the seed contains no fabricated historical probabilities, performance tests or audience metrics.

The daily operation requires the connected services to remain authorized. If a run cannot reach them, it must report the exact failure and preserve the useful draft; it must not say that collection or publication succeeded. Pause the daily Signal automation to stop collection. Preserve evidence and corrections rather than deleting the schema as a routine rollback.
