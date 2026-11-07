# Verification record — November 7, 2026

- Supabase additive migrations `signal_ai_research_observatory_v1` and `signal_source_checks_index` succeeded.
- Fourteen private tables have RLS enabled. Anonymous and authenticated public-client roles have no schema usage.
- Database read-back: 36 registered sources; 7 active sources with reviewed linked documents; 9 documents; 9 versions; 9 claims; 7 numeric observations; 1 report; 1 social draft.
- Replayed the same initial packet: documents, versions and observations remained 9, 9 and 7. No claims lacked evidence links.
- Twelve Python unit tests passed: URL semantics, credential rejection, SQL quoting, allowlist, nonfinite values, forecast arithmetic, sparse samples, source churn, comparable cohorts and a Simpson reversal.
- Security advisor notices for this schema were informational RLS-without-policy notices. This is intentional deny-by-default behavior for a private connector-operated store. Public access is not granted to silence the notice. See https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.
- Added the source-check foreign-key index identified by the performance advisor. Newly created indexes naturally have no usage history yet.
- No existing application table was altered. The existing article table contained 10,022 rows at verification; those records were not imported as independently verified evidence.
- This v1 uses the current ChatGPT agent runtime and authorized connectors. No new Vercel runtime or model API service was deployed. Website and social publication are separate from database writes.
- The local environment had Python but no Node/npm, and direct GitHub DNS resolution failed. Repository writes use the authorized GitHub connector. No Next.js application source or dependency is changed by this standalone research package; no application build is claimed.
