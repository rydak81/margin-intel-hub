# Dossier-to-newsletter growth foundation

## Scope shipped in this draft

- Add home, overview, methodology, and signup navigation to the standalone October dossier, plus a closing signup/coverage panel. The report remains ungated.
- Move title/styles into a valid document head and add a description. Keep the existing dossier-overview canonical rather than creating competing indexable copies.
- Match the newsletter offer to the report and link back to the full edition. Add a newsletter title, description, and canonical.
- Pass the fixed `dossier_2026_10` source through an allowlist to the existing subscription API and existing `newsletter_signup` event. Unrecognized or repeated source parameters use `newsletter_page`. No arbitrary URL text or personal fields enter analytics.
- Leave report findings, forecasts, PDF, subscriber consent, unsubscribe behavior, email delivery, infrastructure, and SDKs unchanged.

## Measurement contract

The existing React layout contains Vercel Web Analytics with URL query/hash stripping. The existing newsletter event is emitted after a successful subscription API response. That is a client-observed signup success, not verified email ownership, inbox delivery, revenue, or a deduplicated end-to-end conversion funnel. The subscription API can succeed when its welcome email fails.

The standalone HTML report does not execute the React layout and has no analytics script. Its reads, source clicks, scroll completion, and HTML-to-signup click-through denominator remain unmeasured. Do not label an absent analytics row as zero readers. PDF downloads also need independent measurement before being treated as reads.

The new source label provides bounded attribution on successful newsletter submissions from the report or overview. It is not cross-session or person-level attribution. Refresh/retry and browser/ad-blocking effects mean event totals are not a replacement for aggregate subscriber records.

Before interpreting growth, compare a fixed window of production pageviews and events with aggregate newly created subscriber records, without exporting emails. Use the API's returned window boundaries. Do not sum unique visitors across paths. Never publish private analytics counts in this public repository.

## Seven-day implementation sequence

Day 1: Review the draft changes and run the full build, type check, repository tests, and mobile/desktop visual checks in a complete checkout. Verify the source label and inspect the existing subscriber flow with mocked responses for success, duplicate, failure, retry, and invalid input. Publish only after approval.

Day 2: Record the approved release time and baseline. Verify production metadata, report links, fragment navigation, newsletter canonical, and fixed-source handling. Confirm analytics is available; document remaining measurement gaps rather than adding an unreviewed tracker.

Day 3: Review a source-backed REA article for marketplace operators, distinguishing the demonstrated project from capabilities not verified. Keep draft article, short posts, and video script in editorial review until publication/distribution is approved. Link the article to a relevant owned guide and the newsletter offer.

Day 4: Review a follow-up brief on creative-tool alternatives using official product evidence, clear licensing/pricing dates, and an operator use case. No unsupported comparison, savings, performance, or revenue claims.

Day 5: Audit the highest-value dossier citations and replace publisher-only references with exact verified source links in a separate reviewed change. Prioritize claims that affect decisions. Keep the existing uncertainty labels and forecast ledger intact.

Day 6: Prepare the next evidence-backed topic from observed demand: AI referral contribution margin, Merchant Center AI-performance benchmark caveats, or actual Shopify agentic-storefront fees and controls. Verify primary sources before drafting; avoid copying an old fee assumption.

Day 7: Complete release QA and schedule the experiment readout for seven full days after approved publication, not seven days after drafting. Compare comparable windows and denominator definitions. With sparse data, report counts and uncertainty; do not declare a winning conversion rate. Decide whether to improve distribution, the offer, or measurement based on the observed bottleneck.

## Verification and release gates

Passed locally: four Node regression tests covering source allowlisting, metadata placement/canonical, report fragment targets and next-step links, and reuse of the existing success event; Python HTML parser check for unique IDs and fragment targets. Original twelve report sections are unchanged.

Not run: full Next build, TypeScript project check, full repository tests, and lint. Only task-relevant files could be materialized through the connector; a full dependency-installed checkout was unavailable. Local headless browser startup failed due to sandbox restrictions, so visual/interactive QA is outstanding. Existing historical PRs also report a pre-existing lint configuration problem; this change has not revalidated that diagnosis.

Release gates: complete the checks above, approve and merge explicitly, then verify the deployed commit and production links. This draft does not authorize a merge, deployment, signup, email blast, or social publication.
