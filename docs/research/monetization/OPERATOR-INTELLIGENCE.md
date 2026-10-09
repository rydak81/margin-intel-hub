# Operator intelligence release — 2026-10-09

## Product and measurement

MarketplaceBeta remains an ecommerce operator resource. This release adds a news intelligence dashboard, three original educational guides with hypothetical calculations, two printable worksheets, and transparent About/editorial pages. MeshNomics remains a separate product and the owner's priority. No paid advertising, AdSense activation, source purchase, new newsletter send, or new recurring task is part of this release.

Dashboard: newest 500 eligible articles published in the preceding 90 days (relevant=true, relevance score>=40), followed by the shared relevance and topic-similarity filter. Five-minute cached server read. It is a coverage sample, not a comprehensive historical series. Platform, audience, topic, search, and 1/7/30/90-day filters operate within that sample; the cap is disclosed when reached. Publication dates are used, not ingestion dates. Future and invalid dates are excluded. Headline counts are not demand, market share, or product sales. High impact is an automated tag, not a verified severity assessment. No new AI calls are made for the dashboard.

Alibaba and AliExpress are available dashboard filters and future classifier tags. Existing historical rows are not retroactively tagged or backfilled. A missing result means missing coverage, not no market activity. Logistics perspective selects the logistics category; technology combines technology topics and SaaS tags; other perspectives use stored audience tags. Legacy brands/brand_sellers map to sellers; general platform maps to cross-platform. Broad legacy topic labels use explicit headline rules with visible provenance or fall back to Commerce context; stored rows are not changed.

Traffic measurement: existing Vercel page analytics plus fixed-name resource_download_click, guide_tool_click, guide_newsletter_click and newsletter_signup events. Download clicks do not prove a completed download. Signup events fire only after successful new subscription responses. No emails, account data, search terms, or calculator inputs are sent in event properties. Analytics URLs omit query strings and hashes. Custom events require the appropriate Vercel analytics plan; collection and dashboard availability still need confirmation. Do not infer returning-reader retention from aggregate page views.

Use a 90-day organic discovery test: assess Search Console impressions/clicks and index coverage, guide and dashboard visits, download clicks and successful signup events (where available). Record monthly operating costs ($150–$200 estimated by owner). Do not buy traffic to earn display-ad revenue without measured acquisition cost and revenue per visitor. No revenue forecast or AdSense approval is established by this release. Compare published content usefulness and actual reader response before investing in volume.

## MeshNomics data integration — design, not connected

Preferred flow: MeshNomics server -> authenticated read-only aggregate export -> MarketplaceBeta server cache -> approved public charts. Keep vendor credentials and private merchant records on the originating backend. Do not share database service-role keys with browsers. Use scoped service authentication, an allowlist of public fields, freshness/expiry checks, rate limits and a kill switch; no new vendor requests until their token/cost budget is agreed.

Evidence inspected: local MeshNomics-Analyze-Implementation checkout, not verified current production. Its Keepa parser defines price, sales-rank and offer-history series. Its engineering contract explicitly says there is no EverBee API access or developer credentials; Etsy enrichment uses a connector-driven routine delivered through import-everbee-json. Do not propose a server-side EverBee API or cron workaround. Existing import coverage and freshness must be checked before sharing anything.

Every metric must carry platform, locale, category, product/cohort identity, unit, time window, source-observed date, computed date, evidence basis (observed/rank-derived/estimated), method version, sample size, missing-data policy and redistribution approval. Missing values remain missing. Downloads, offers, rankings and estimated sales are different measurements.

Potential first modules after verification:
- Amazon category product leaders by current, 30-day and 90-day average sales rank; clearly labeled product rankings, not merchant rankings or verified sales totals.
- Seven-day price/rank changes for a consistent tracked cohort, calculated from sufficiently complete licensed history. Keepa's best-sellers endpoint does not offer a native 7-day range.
- Etsy category/listing observations from permitted imports, with source dates and estimate labels; no claim to cover the entire Etsy marketplace.
- News context linked to affected categories, with an optional MeshNomics research CTA once the appropriate destination and attribution are confirmed.

Before implementation: confirm deployed MeshNomics source/API and available series, vendor redistribution/display rights, merchant consent where applicable, cohort coverage, refresh/cost limits and permitted derived metrics. Ownership of both websites does not itself establish vendor-data redistribution rights. This release does not add a speculative feed endpoint or publish imported data.

Official references checked 2026-10-09:
- https://keepa.com/api-docs/best-sellers.html — current and 30/90/180-day rank lists, category/locale scope, caching, variation behavior.
- https://developers.etsy.com/documentation/ — app access models and OAuth scope. Does not establish the owner's existing EverBee data rights.
- https://vercel.com/docs/analytics/custom-events — custom event support and plan requirements.

## Verification and limitations

Run native unit tests with Node 25+: node --import ./tests/register-ts.mjs --test tests/*.test.ts
Run TypeScript checking and production webpack build. Check preview content, mobile/desktop layout, source links, dashboard filters, empty state, download responses, canonical metadata and sitemap. Do not submit newsletter forms during verification.

Shared display gate removes known off-topic/promotional patterns while preserving stored records. It is a conservative relevance filter, not fact-checking. It does not repair ingestion timeouts or email deliverability. The separate scheduled email sender is outside this release; its source query is unchanged. Archive result totals and facets retain existing bounded-window behavior and are not represented as exact full-archive counts.
