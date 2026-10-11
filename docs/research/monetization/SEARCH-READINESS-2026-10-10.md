# MarketplaceBeta: indexing readiness and content quality

Audit date: October 10, 2026. Baseline production commit: 93dc79b5fd0172eea73a944772bf1721d4ee1d00.

## Verified public baseline

- robots.txt returned HTTP 200, allowed public crawling and named the root sitemap. API, admin, and preview paths were disallowed.
- sitemap.xml returned HTTP 200 with 1,081 URL entries. This is a submitted/discoverable URL inventory, **not a count of Google-indexed pages**.
- Homepage, /articles, /tools, /guides/product-profitability, and /news/art_o4yg69 returned 200. The first three lacked a canonical URL; archive and tools inherited the generic homepage title. The sampled guide and news article already had self-canonicals and distinct titles.
- The code emitted the current generation time as lastmod for unchanged static pages and category fee pages.
- The briefing selected stories by desk score and supplied no publication dates to its AI synthesis. It could attach a cached narrative to a newly fetched article set. The preceding monitor saw an October 7 event described as ending “tonight” on October 10.
- The feed included unrelated corporate hardware/community stories and near-duplicate Walmart California facility opening reports.
- Search Console redirected to its public landing page in the available browser session. Property verification, actual index coverage, Google-selected canonicals, manual actions, impressions, clicks, and Core Web Vitals are **unavailable**, not zero or confirmed healthy. No indexing requests were submitted.

This is a public technical and editorial audit with sampled pages and source review, not an exhaustive crawl or a Search Console performance audit.

## Changes

1. Unique search titles, descriptions, and self-canonicals for home, archive, tools, and events. Preserve existing guide URLs rather than creating competing near-duplicates.
2. Remove fabricated regeneration dates from static sitemap entries. Use real dataset verification dates for fee categories and valid publication dates for articles. Keep guide publication on October 9 and mark the substantive guide update October 10.
3. Apply the operator relevance policy consistently to feeds/sitemap and add noindex,follow to excluded individual article pages. Stored articles remain intact. These rules filter known off-topic content; they do not establish factual correctness.
4. Homepage uses a 14-day publication window, newest first. Briefing uses up to 120 curated reports from the last seven days, with visible source publication dates, factual coverage counts, and clearly labeled decision prompts. No new AI request is made to manufacture a current-day narrative. Empty coverage is labeled unavailable, not a quiet market.
5. Withhold stale summaries containing relative time assertions (for example “tonight”) after 36 hours and provide the source date. This conservative display safeguard is not a complete verification of every summary or original report. The dashboard uses labeled decision prompts rather than undated stored AI action instructions.
6. Narrow duplicate matching for equivalent facility openings, retaining distinct locations. Keep the broader archive searchable.
7. Correct the Amazon appliance category’s compact/full-size mix-up against Amazon’s official pricing page. Do not advance the entire marketplace schedule’s verification date based on this single check. A comprehensive fee dataset/calculator reconciliation remains follow-up work.

## Three search destinations

| URL | Search intent | Distinct utility |
| --- | --- | --- |
| /guides/product-profitability | Ecommerce profit margin and marketplace profitability | Per-order contribution and monthly cost scenario, margin vs markup FAQ, worksheet, downside worked example |
| /guides/break-even-advertising | Break-even ACoS, target ROAS, allowable CPC | Adjustable contribution-retention model, zero-budget handling, attribution caveats, worked example |
| /guides/adding-a-marketplace | Multichannel ecommerce costs and launch checklist | Incremental-order break-even plus displaced-channel contribution model, pilot checklist, inventory and returns workflow |

Each guide has substantial server-rendered educational content, source links, original hypothetical examples, an interactive calculator, three relevant FAQs, related-guide links, Article and BreadcrumbList structured data. Inputs stay in the browser. No keyword-volume, ranking, first-hand seller-result, or advertising-approval claims are made. No FAQ rich-result eligibility is implied.

## Remaining search work

Once the owner opens the verified Search Console property:

1. Review Pages, Sitemaps, Manual actions, and Security issues. Confirm sitemap.xml has been read and inspect the homepage and all three guide URLs.
2. Compare the declared canonical with Google's selected canonical and check rendered content. Request indexing for these updated guides if appropriate; submission is not a guarantee.
3. Record a 28-day baseline of impressions, clicks, search queries, and landing pages. Review useful impressions and clicks weekly; prioritize genuine query/intent mismatches over generating more pages.
4. Check the sitemap's existing 1,000-article query cap against archive size before expanding coverage. Inclusion should follow relevance and content quality, not an attempt to index every stored item.
5. Audit all marketplace fee schedules and the separate legacy calculator against current official sources before promoting them as fully current fee intelligence.

## References

- Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap — accurate lastmod and canonical URLs; sitemap submission does not guarantee crawling/indexing.
- Google: https://developers.google.com/search/docs/fundamentals/creating-helpful-content — useful original value and transparent authorship/methodology.
- Amazon: https://sell.amazon.com/pricing — fee categories and compact versus full-size appliances (checked October 10).
- Amazon Ads: https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales — ACoS and ROAS definitions.
- Shopify: https://help.shopify.com/en/manual/inventory-and-locations — inventory/location context for the launch guide.

## Verification

- 20 automated tests passed: date windows, stale language, source-date preservation, unavailable briefing behavior, relevance filtering, duplicate/distinct facility stories, calculator examples and invalid/overflow inputs, and existing dashboard filtering.
- TypeScript check passed.
- Local production build passed using webpack (the local dependency symlink is incompatible with the default Turbopack build sandbox).
- Browser and deployed response checks are recorded with the release evidence after completion.
