import type { AnalysisArticle } from '@/lib/analysis'

const evidence = '/research/headline-coverage-2026-11-02.json'
const source = `[dated evidence summary](${evidence})`

export const RESEARCH_ARTICLES: AnalysisArticle[] = [{
  slug: 'ai-commerce-headlines-are-not-adoption-data',
  seoTitle: 'AI Commerce Headlines Are Not Adoption Data',
  metaDescription: 'Original analysis of a matched news sample: what AI-agent headline counts measure, where comparisons fail, and how to build a useful research workflow.',
  headline: 'Why more AI headlines do not prove more AI adoption',
  dek: 'A comparison of MarketplaceBeta’s news archive shows how source mix, denominators and small samples can change a story. Here is the evidence, the method, and a practical framework for evaluating an AI research agent.',
  publishedOn: '2026-11-02', updatedOn: '2026-11-02',
  author: 'MarketplaceBeta Research', reviewMode: 'automated', readTime: '7 min',
  tags: ['AI agents', 'original research', 'ecommerce strategy', 'research methods'],
  takeaway: 'Use news coverage to find questions and primary sources. Require merchant usage, transactions or another directly relevant measure before making an adoption claim. A useful AI analyst should preserve the denominator and be able to hold an unsupported conclusion.',
  forecastIds: [], newsletterSource: 'campaign_ai_research_methods',
  sections: [
    { id: 'finding', title: 'The finding: this sample cannot support an AI adoption claim', paragraphs: [
      `Our narrow AI-agent headline rule matched 5 of 209 comparable articles in the earlier period and 4 of 280 in the later period, according to the ${source}. The publication windows were October 6–19 and October 20–November 2, 2026 UTC. These are counts of matching news headlines, not merchants, shoppers or transactions.`,
      'Those fractions could be turned into a dramatic claim about falling interest. We did not do that. The later match count was below the checker’s declared editorial screening threshold, and the underlying measure would not establish adoption even with a larger sample.',
      'The result is useful for another reason: it demonstrates the questions an operator should ask before relying on an AI-generated market report. What was counted? What was left out? Did the sources change? Does the language describe the measured quantity, or quietly substitute a more commercially exciting one?',
    ] },
    { id: 'sample', title: 'What went into the comparison', paragraphs: [
      `The ${source} starts with 717 stored news records in the combined publication window. Relevance filtering and deduplication left 520 eligible records. Nine matched source domains contributed 489 comparable records, retaining 94.0% of the eligible sample. These totals describe this export, not the size of the ecommerce news market.`,
      'We used publication timestamps rather than ingestion timestamps. A late import of an old article should not make an old event look like a new surge. Future-dated and invalid records are excluded. Eligibility also uses stored relevance labels and the existing operator relevance filter; those decisions can change over time.',
      'The comparison retains source domains that contribute enough eligible coverage to both periods. That reduces the effect of adding a new publisher halfway through the analysis. It does not make the sample representative: publisher output, story selection and repeated coverage can still influence the result.',
    ] },
    { id: 'results', title: 'The denominator changes the reading', paragraphs: [
      `The following table is calculated from the ${source}. Shares are rounded to one decimal place. Topic rules are headline-only and deliberately narrow; topics can overlap. A hold means the proposed directional comparison needs more evidence, not that the topic is unimportant.`,
    ], table: {
      caption: 'MarketplaceBeta matched-source news sample · earlier: Oct 6–19; later: Oct 20–Nov 2, 2026 UTC · source: downloadable evidence summary',
      headings: ['Headline topic', 'Earlier matches / articles', 'Later matches / articles', 'Earlier → later share', 'Screening result'],
      rows: [
        ['AI agents / agentic commerce', '5 / 209', '4 / 280', '2.4% → 1.4%', 'Hold: thin match count'],
        ['Fees / margins', '4 / 209', '5 / 280', '1.9% → 1.8%', 'Hold: thin match count'],
        ['Fulfillment / returns', '24 / 209', '23 / 280', '11.5% → 8.2%', 'Candidate for source review'],
        ['Advertising / acquisition', '5 / 209', '5 / 280', '2.4% → 1.8%', 'Candidate for source review'],
      ],
    } },
    { id: 'interpretation', title: 'More mentions and a lower share can coexist', paragraphs: [
      'The fees row is a useful example. Its matching headline count increased, while its share of the larger later sample decreased. Neither statement describes a change in seller fees themselves. The advertising row has the same match count in both periods, but a lower share in the later period because the denominator grew.',
      'A report that displays only a percentage or only a raw count can therefore leave out the information needed to interpret it. The practical correction is simple: keep the numerator, denominator, dates and scope beside every comparison.',
      'The fulfillment result is eligible for primary-source review under this method. That is a place to start reading the underlying announcements, not a finding that logistics risk has fallen. The screening label does not certify significance, causation, market coverage or business impact.',
    ] },
    { id: 'source-balance', title: 'Check whether a prolific publisher controls the result', paragraphs: [
      'Alongside the pooled share, the calculator compares each matched source’s topic share and weights those source changes equally. This asks whether the direction survives when a high-volume publisher stops dominating the total. A disagreement holds the proposed directional finding for review.',
      `For fulfillment and returns, the pooled change was approximately −3.3 percentage points and the equally weighted source change approximately −3.2 percentage points in the ${source}. Agreement is a useful robustness check within this sample. It does not remove selection bias or establish a market-wide trend.`,
      'The evidence file includes the source-level counts so another analyst can inspect the calculation. Different weighting choices answer different questions; the method should be stated before choosing the most attention-grabbing result.',
    ] },
    { id: 'workflow', title: 'A practical contract for an AI research agent', paragraphs: [
      'Separate measurement from interpretation. The research step should retrieve authorized records and compute the figures in code. The writing step should explain those figures, inspect their sources and connect them to a decision. A fluent paragraph is not a substitute for a reproducible calculation.',
      'For an ecommerce team, the workflow can support competitor briefings, platform-change monitoring or a product-research queue. Its value comes from helping a person decide what to inspect or do next, with the limits visible. Any claim about saved hours or improved revenue needs a measured baseline and an operational trial.',
    ], bullets: [
      'Define the decision: the question must specify whose behavior or which operational condition matters.',
      'Bind each figure to its unit, source, observation window, sample and denominator.',
      'Check duplicates and changes in source coverage before comparing periods.',
      'Keep a counter-explanation: seasonality, source mix, design age or reporting changes may explain an apparent pattern.',
      'Hold weak evidence and record why; do not generate a new trend merely to fill a publishing slot.',
      'After publication, preserve the dated evidence and make material corrections traceable.',
    ] },
    { id: 'methods', title: 'Method, reproducibility and limits', paragraphs: [
      `The method is marketplacebeta-headline-coverage-v1. The ${source} records the cutoff at November 3, 2026 00:00 UTC, both half-open windows, exclusions, source-level counts, original source links and screening outcomes. The research code is available in [the MarketplaceBeta repository](https://github.com/rydak81/margin-intel-hub/blob/791170fe1817d49c48c9e97c98d3aa712917e0dd/lib/research-desk.ts).`,
      'The fixed eligibility rules require a stored relevant classification and a finite relevance score of at least forty. Matched domains must contribute at least five eligible headlines per period. A directional candidate also requires at least three matched domains, twenty comparable articles per period, seventy percent retention, recent eligible coverage and five matches per topic per period. These are editorial screening rules, not a statistical-power calculation.',
      'Duplicate groups connect records sharing an ID, canonicalized URL or normalized headline. The earliest deterministic representative is retained. This can remove exact syndicated copies, but paraphrased repetitions can remain. Headline-only matching misses synonyms and information appearing only in article bodies; the dictionary is not a comprehensive topic classifier.',
      'The source sample is purposive. No population estimate, statistical significance test, causal conclusion or adoption rate is claimed. Source-level weighting reduces one kind of sensitivity without removing all others. A later run may use changed records or source coverage, so reproduce this dated snapshot before comparing editions.',
    ] },
    { id: 'cite', title: 'How to cite and reuse the finding', paragraphs: [
      'Suggested attribution: MarketplaceBeta Research, “Why more AI headlines do not prove more AI adoption,” published November 2, 2026, with the article URL and the evidence-summary link. When reusing a figure, include its topic definition, publication windows and matched-source sample. Cite the original publisher when making a claim about the event described by an underlying news story.',
      'For a broader research workflow, use the [Intelligence dashboard](/intelligence) to find source-linked context and the [forecast ledger](/intelligence/forecasts) to distinguish a dated forecast from a current observation. This report is a descriptive methods example, not a forecast.',
    ] },
  ],
  sources: [
    { label: 'MarketplaceBeta: dated headline evidence summary (JSON)', href: evidence, context: 'Own archive metadata, fixed UTC cutoff, matched-source counts and calculations. Includes observation scope, exclusions and original source URLs; no article bodies or private customer data.' },
    { label: 'MarketplaceBeta research calculator', href: 'https://github.com/rydak81/margin-intel-hub/blob/791170fe1817d49c48c9e97c98d3aa712917e0dd/lib/research-desk.ts', context: 'Versioned measurement implementation. Editorial screening thresholds do not establish statistical significance.' },
  ],
},
{
  "slug": "shopify-ai-channel-fees-chatgpt-checkout-2026",
  "seoTitle": "Shopify AI Checkout: A Practical Compatibility Audit",
  "metaDescription": "Compare Shopify AI purchase paths and use a repeatable worksheet to test product eligibility, required checkout fields and order attribution.",
  "headline": "The Shopify AI-channel decision is a checkout audit, not just a fee comparison",
  "dek": "Shopify’s current documentation separates ChatGPT referrals from direct checkout on Google, Copilot and Meta. A practical worksheet helps merchants test the differences that matter to their store.",
  "publishedOn": "2026-11-04",
  "updatedOn": "2026-11-04",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "5 min",
  "tags": [
    "AI agents",
    "Shopify",
    "checkout",
    "research methods"
  ],
  "takeaway": "Evaluate the purchase path for a specific product, buyer location and checkout dependency. A channel's availability and fee policy do not prove that your intended order can be completed correctly.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_checkout_audit",
  "sections": [
    {
      "id": "finding",
      "title": "The finding: the channel name does not define the purchase path",
      "paragraphs": [
        "Shopify’s [ChatGPT documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt), read November 4, 2026, describes a referral to the merchant’s online-store checkout, inside an in-app browser or a new tab. It says standard payment processing applies without an additional selling fee. There is no ChatGPT direct-checkout toggle. The important operational distinction is that the purchase uses the store’s existing checkout.",
        "Our interpretation: an AI-channel launch should be evaluated as a specific purchase path. A fee comparison alone cannot tell you whether the right product, required information and usable attribution survive that path. This report supplies an audit method; it does not measure conversion, adoption or revenue."
      ]
    },
    {
      "id": "comparison",
      "title": "Compare the documented paths before testing",
      "paragraphs": [
        "Scope: four Shopify Help Center channel pages read November 4, 2026. This is a documentation snapshot, not an inspection of any merchant’s admin or a live transaction test. Each page states no additional channel selling fee beyond standard payment processing; that does not make operating a store cost-free."
      ],
      "table": {
        "caption": "Documented Shopify purchase paths · sources: channel pages linked below · checked November 4, 2026",
        "headings": [
          "Channel",
          "Purchase path",
          "Important boundary"
        ],
        "rows": [
          [
            "ChatGPT",
            "Merchant online-store checkout",
            "Referral path; no direct-checkout setting"
          ],
          [
            "Google AI Mode / Gemini",
            "Direct checkout where available; store redirect otherwise",
            "Gradual rollout; requires eligible Merchant Center products"
          ],
          [
            "Microsoft Copilot",
            "Direct checkout or merchant-selected store redirect",
            "Direct checkout shown to US customers"
          ],
          [
            "Meta",
            "Direct checkout on supported Meta surfaces",
            "Availability varies; Muse is conditional"
          ]
        ]
      }
    },
    {
      "id": "product",
      "title": "Separate product exclusion from checkout presentation",
      "paragraphs": [
        "The [Google page](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/google) says subscription-only products, bundles, customizable products and B2B-only products are unsupported in direct checkout. A product offered both once and by subscription can still be bought once. Some checkout blocks might not display, while Shopify Functions and discounts are supported. Google’s rollout means an eligible configuration does not establish that a particular shopper can use direct checkout today.",
        "Those are different failure categories. An unavailable product needs an alternative purchase path. An absent field needs investigation into whether the intended order remains valid. A functioning discount should not be reported as lost merely because another checkout customization is absent. Test the actual dependency instead of treating the entire checkout as one feature."
      ]
    },
    {
      "id": "measurement",
      "title": "Test the order record as well as the screen",
      "paragraphs": [
        "For [Copilot](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/microsoft), Shopify documents server-to-server checkout-started and checkout-completed events, while Google Analytics and custom client-side pixels do not fire in direct checkout. Only checkout customizations that support blocking and have blocking enabled are eligible to load; eligibility still does not guarantee display. Deactivating direct checkout sends buyers to the online store while retaining discovery eligibility.",
        "The [Meta documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/meta) takes a different position on presentation: checkout blocks are unsupported. Shopify Functions and discounts remain supported. If required information cannot be collected on the Meta surface, the documented fallback preserves the cart and sends the buyer to the store. Meta orders carry channel attribution in Shopify admin. Verify the actual route taken before diagnosing an analytics discrepancy.",
        "Recommended audit: retain the channel, entry point, buyer country, product variant, selected purchase option and final order identifier in a private test log. Compare the resulting order and required information against a written acceptance criterion. Reconcile available channel events with orders rather than assuming a missing browser event means a missing order. Follow the platform’s supported testing process; do not generate artificial sales to inflate results."
      ]
    },
    {
      "id": "worksheet",
      "title": "A repeatable operator worksheet",
      "paragraphs": [
        "The [downloadable worksheet and source map](/research/shopify-checkout-audit-2026-11-04.json) includes empty fields for this audit. It contains no merchant results. Complete it separately for each consequential purchase path; record unavailable tests as unknown rather than passed.",
        "Illustrative example, not a measured client outcome: a merchant offers the same product as a one-time purchase and a subscription. A successful one-time order cannot establish subscription compatibility. Record the purchase option explicitly, then decide which path serves the intended offer."
      ],
      "bullets": [
        "State the required behavior: what product option, customer input, delivery method or discount must survive checkout?",
        "Record the documented limitation and dated source. Keep documentation evidence separate from an observed test result.",
        "Inspect the rendered checkout and resulting order. Record pass, fail or unknown, with a private evidence reference and accountable owner.",
        "If a required dependency fails, assess the online-store path for that channel. Avoid disabling unrelated paths based on an untested assumption.",
        "Set a review trigger: a channel update, product change, checkout-app change or an unexplained order/event mismatch."
      ]
    },
    {
      "id": "methods",
      "title": "Methods, limitations and reuse",
      "paragraphs": [
        "This is an original operator workflow based on a purposive sample of four primary documentation pages. There is no merchant cohort, transaction denominator or performance estimate. Missing information includes store-specific eligibility, installed-app behavior and real purchase outcomes. November 4 is the retrieval date, not the launch date of every documented feature.",
        "MarketplaceBeta’s news archive is used to find research questions; headline coverage cannot establish merchant adoption or buyer demand. No directional archive comparison is made here. The source map paraphrases only the details needed for this audit and links to the originals, which may change.",
        "Prepared and reviewed by an automated research and editorial process. No individual human review or client result is claimed. Suggested citation: MarketplaceBeta Research, this article’s title, November 4, 2026, with the canonical article URL and dated worksheet. Attribute platform rules to Shopify and recheck them before implementation.",
        "Use the [Intelligence dashboard](/intelligence) to monitor source-linked changes. For an AI implementation brief, make the deliverable concrete: a maintained compatibility matrix, evidence-backed exceptions and a decision owner. That is a testable scope; promised revenue or hours saved would require a separate measured evaluation."
      ]
    }
  ],
  "sources": [
    {
      "label": "Shopify: ChatGPT — read November 4, 2026",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt",
      "context": "Primary documentation snapshot; eligibility and behavior may change. No merchant transaction test performed."
    },
    {
      "label": "Shopify: Google AI Mode and Gemini — read November 4, 2026",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/google",
      "context": "Primary documentation snapshot; eligibility and behavior may change. No merchant transaction test performed."
    },
    {
      "label": "Shopify: Microsoft Copilot — read November 4, 2026",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/microsoft",
      "context": "Primary documentation snapshot; eligibility and behavior may change. No merchant transaction test performed."
    },
    {
      "label": "Shopify: Meta — read November 4, 2026",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/meta",
      "context": "Primary documentation snapshot; eligibility and behavior may change. No merchant transaction test performed."
    },
    {
      "label": "Dated source map and blank audit worksheet",
      "href": "/research/shopify-checkout-audit-2026-11-04.json",
      "context": "Original public-safe paraphrases and an empty operator worksheet; no private data or measured merchant results."
    }
  ]
},
{
  "slug": "amazon-holiday-peak-fees-2026-fba-surcharge",
  "seoTitle": "Amazon Peak Fees: Audit Three Different Cost Clocks",
  "metaDescription": "Audit Amazon holiday fulfillment, fuel surcharge and storage separately. A reusable worksheet prevents double counting and January budgeting errors.",
  "headline": "Amazon holiday fees run on different clocks. Your audit should too.",
  "dek": "Peak fulfillment, fuel surcharges and monthly storage need separate dates and bases. A reusable operator worksheet helps expose double counting before it reaches a promotion budget.",
  "publishedOn": "2026-11-06",
  "updatedOn": "2026-11-06",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "5 min",
  "tags": [
    "Amazon",
    "FBA",
    "holiday peak fees",
    "research methods"
  ],
  "takeaway": "Keep the fulfillment period, surcharge inclusion and storage month in separate fields. A fresh export is not evidence that every number in it has the same effective date or includes the same charges.",
  "forecastIds": [],
  "newsletterSource": "campaign_kw_amazon_peak_fee_2026",
  "sections": [
    {
      "id": "finding",
      "title": "The useful finding: there is no single holiday-cost switch",
      "paragraphs": [
        "An Amazon budget can contain a correctly transcribed rate and still apply it to the wrong month or charge it twice. The audit question is therefore more specific than “Are peak fees included?” Ask which fee, which period, which calculation base and whether a surcharge is already included.",
        "Amazon’s [holiday announcement](https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff), read November 6, 2026, sets the holiday fulfillment period at October 15, 2026 through January 14, 2027 and says the fuel surcharge applies on top. Its [surcharge announcement](https://sellercentral.amazon.com/seller-forums/discussions/t/7cbc0233-ee5b-4359-978a-dee7cad5c6f4) specifies 3.5% of fulfillment fees, not of the item’s sale price.",
        "This report supplies an audit workflow, not a measurement of merchant costs. It corrects a planning trap in an unpublished draft: extending the October–December storage rate through January because peak fulfillment continues into that month."
      ]
    },
    {
      "id": "clocks",
      "title": "Keep these inputs separate",
      "paragraphs": [
        "The table is a documentation snapshot checked November 6, 2026. Standard-size storage means base FBA storage for non-dangerous goods; other storage charges and programs require their own checks."
      ],
      "table": {
        "caption": "Separate fee bases and calendars · Amazon primary sources linked below · checked November 6, 2026",
        "headings": [
          "Cost input",
          "Documented period or base",
          "Worksheet control"
        ],
        "rows": [
          [
            "Holiday fulfillment",
            "Oct 15, 2026–Jan 14, 2027",
            "Record program, applicable date and rate-card version"
          ],
          [
            "Fuel/logistics surcharge",
            "3.5% of fulfillment fee",
            "Mark included, excluded or unknown"
          ],
          [
            "Standard-size base storage",
            "Oct–Dec: $2.40/cu ft/month; Jan–Sep: $0.78",
            "Use storage month and daily average occupied volume"
          ]
        ]
      }
    },
    {
      "id": "date",
      "title": "A January shipment does not put January storage in December’s band",
      "paragraphs": [
        "Amazon’s [storage documentation](https://sellercentral.amazon.com/gp/help/external/G3EDYEF6KUCFQTNM) separates monthly base storage from a possible storage-utilization surcharge. Its indexed primary-source table shows the standard-size base bands above; Amazon’s [supply-chain comparison](https://sell.amazon.com/supply-chain?mons_sel_locale=en_US) also shows the January–September and October–December split. Direct Seller Central help-page opens returned a JavaScript shell during this review, so the worksheet records that retrieval limitation.",
        "Our interpretation: split a cross-year inventory plan into storage months even if fulfillment remains in its holiday period. Do not carry December’s base storage rate into January simply because the fulfillment calendar has not ended. Recheck any later rate announcement before treating a planning assumption as a charge.",
        "The indexed [FBA fulfillment help page](https://sellercentral.amazon.com/help/hub/reference/external/GPDC3KPYAGDTVDJP?ld=SCFBAStriplogin) identifies shipment as the charging event and distinguishes program-specific rates. Record the applicable event for your own program; do not use the US FBA row as a universal MCF or Remote Fulfillment rate."
      ]
    },
    {
      "id": "surcharge",
      "title": "Prevent double counting before recalculating a promotion",
      "paragraphs": [
        "If a documented base fulfillment fee excludes the surcharge, multiplying it by 1.035 adds the stated surcharge. If a tool’s total already includes it, multiplying again double counts it. A blank inclusion field should mean unknown, not excluded.",
        "Amazon’s surcharge announcement says its estimation tools were updated to reflect that charge. The holiday announcement separately says peak rates are available in its tools. The practical control is to retain the export date and the displayed breakdown, then reconcile the same product and program. Do not label an export stale solely because it differs from a general example.",
        "Use [Amazon’s estimate guide](https://sell.amazon.com/pricing/estimate) to locate Fee Preview or compare fulfillment methods using the Revenue Calculator. Preserve dimensions, weight, category, price and shipping inputs. A mismatch should create an investigation task before it changes a budget."
      ]
    },
    {
      "id": "worksheet",
      "title": "A worksheet that an operator or AI assistant can maintain",
      "paragraphs": [
        "Download the [blank audit worksheet and source map](/research/amazon-fee-audit-2026-11-06.json). It contains no merchant results. Keep completed worksheets private because product economics and order references may be commercially sensitive.",
        "Give the assistant a bounded job: extract dated fields, identify unknowns and present discrepancies for a decision. Keep the arithmetic deterministic. It should never silently replace a missing cost with zero or convert an estimate into a settled charge."
      ],
      "bullets": [
        "Identify the product, marketplace, fulfillment program, currency, package dimensions, weight and price band.",
        "Record the rate source, retrieval date, effective period, charging event and surcharge-inclusion status.",
        "Separate monthly storage, inbound costs, promotion fees, advertising, expected returns and manufacturing or sourcing costs from fulfillment.",
        "Compare like-for-like inputs with the current account estimate. Record unresolved differences, an owner and the next check.",
        "After a real shipment, compare the relevant charged line with the retained estimate. Record corrections without overwriting the original evidence."
      ]
    },
    {
      "id": "decisions",
      "title": "Turn a discrepancy into a decision",
      "paragraphs": [
        "An unexpected fulfillment line calls for a package-tier and program check. A monthly storage mismatch calls for a volume, month and surcharge check. An apparent promotion shortfall calls for a full contribution calculation. These are different investigations; adding a generic holiday percentage to every cost does not resolve them.",
        "Use the existing [Amazon holiday fee tool](/fees/amazon/holiday-peak-2026) for rate-table context and the [fee change log](/fees/changelog) for dated changes. The worksheet adds evidence and exception handling around those tools. No measured time savings, client outcome or revenue improvement is claimed."
      ]
    },
    {
      "id": "methods",
      "title": "Methods, limitations and reuse",
      "paragraphs": [
        "We reviewed the existing fee draft, the site’s October 21 fee tool and Amazon primary pages on November 6, 2026. The archive’s complete November 5 UTC publication cohort was read for topic selection; no directional headline comparison or adoption claim is made. The scope is a purposive documentation review and an original operator workflow, with no merchant cohort or transaction denominator.",
        "Known missing inputs include account-specific program eligibility, package classification, occupied volume, discounts and actual charged fees. Some Seller Central pages were available only through indexed primary text; that limitation remains in the source map. Retrieval dates are not announcement or observation dates. The template is not an executable fee calculator.",
        "Prepared and reviewed through an automated research and editorial process; no individual human review is claimed. Suggested citation: MarketplaceBeta Research, this article’s title, November 6, 2026, canonical article URL and dated worksheet. Reuse the workflow with attribution, retain the scope and dates, and attribute fee rules to Amazon. Third-party source rights remain with their owners."
      ]
    }
  ],
  "sources": [
    {
      "label": "Amazon holiday announcement — read Nov 6, 2026",
      "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff",
      "context": "Primary announcement: holiday period and surcharge layering."
    },
    {
      "label": "Amazon surcharge announcement — read Nov 6, 2026",
      "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/7cbc0233-ee5b-4359-978a-dee7cad5c6f4",
      "context": "Primary announcement: calculation base and updated tools."
    },
    {
      "label": "Amazon monthly storage — checked Nov 6, 2026",
      "href": "https://sellercentral.amazon.com/gp/help/external/G3EDYEF6KUCFQTNM",
      "context": "Indexed primary table; direct open returned a JavaScript shell."
    },
    {
      "label": "Amazon supply-chain storage comparison — read Nov 6, 2026",
      "href": "https://sell.amazon.com/supply-chain?mons_sel_locale=en_US",
      "context": "Primary corroboration of standard-size seasonal storage bands."
    },
    {
      "label": "Amazon FBA fulfillment fee — checked Nov 6, 2026",
      "href": "https://sellercentral.amazon.com/help/hub/reference/external/GPDC3KPYAGDTVDJP?ld=SCFBAStriplogin",
      "context": "Indexed primary text; charging event and program boundaries. Direct open returned a JavaScript shell."
    },
    {
      "label": "Amazon estimate guide — read Nov 6, 2026",
      "href": "https://sell.amazon.com/pricing/estimate",
      "context": "Primary guide to product estimates, Fee Preview and comparison inputs."
    },
    {
      "label": "Dated blank worksheet and source map",
      "href": "/research/amazon-fee-audit-2026-11-06.json",
      "context": "Original workflow, no measured merchant results."
    }
  ]
},
{
  "slug": "ecommerce-ai-agent-evaluation-final-state-cost",
  "seoTitle": "Test an Ecommerce AI Agent Beyond Its Final Answer",
  "metaDescription": "An original evaluation worksheet for ecommerce AI agents: test final state, stale data, retries and cost per accepted task before expanding automation.",
  "headline": "Your AI agent’s final answer is only half the acceptance test",
  "dek": "A correct-looking summary can coexist with an incorrect inventory or catalog state. A practical evaluation worksheet separates output quality, business-state accuracy and the full cost of accepted work.",
  "publishedOn": "2026-11-07",
  "updatedOn": "2026-11-07",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "7 min",
  "tags": [
    "AI agents",
    "ecommerce operations",
    "evaluation",
    "original research"
  ],
  "takeaway": "Before changing models or expanding permissions, test the whole workflow against an authoritative expected state. Report accepted tasks, consistent scenarios, correction time and complete operating costs separately.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_agent_evaluation",
  "sections": [
    {
      "id": "finding",
      "title": "The useful question: did the work finish correctly?",
      "paragraphs": [
        "An ecommerce agent can write a convincing completion message while leaving the wrong variant, stock quantity or product claim in the underlying system. Our proposed acceptance test therefore has separate checks for the visible answer and the resulting business state. A polished answer cannot compensate for an incorrect state.",
        "That is an editorial recommendation derived from a review of primary research, not a finding from merchant accounts. MarketplaceBeta’s current AI evidence library led us to agent-completion research, a state-tracking benchmark and a measurement-method change. We reopened the original sources and used them to design a concrete operator worksheet. No seller-account experiment was run.",
        "Download the [evaluation worksheet and dated evidence notes](/research/ecommerce-agent-evaluation-2026-11-07.json). It includes original synthetic cases, expected outcomes, a run-record template and scoring definitions. All example inventory values are hypothetical. It contains no customer records, private research rows or source-text archive."
      ]
    },
    {
      "id": "research",
      "title": "What the research establishes—and where it stops",
      "paragraphs": [
        "In [IBM’s developer-run comparison](https://huggingface.co/blog/ibm-research/cuga-harness), published November 3, 2026, the same GLM-5.3-flash model completed 73 of 90 AppWorld tasks with CUGA, 42 with Hermes and 27 with Deep Agents. All variants passed in 20 of 30 scenarios for CUGA, 8 for Hermes and 2 for Deep Agents. Each task received one attempt. These are reported benchmark results, not our reproduction.",
        "IBM disclosed different configurations and said policy enforcement was not evaluated. The comparison supports testing the surrounding software alongside the model; it does not isolate a single feature’s effect or establish which agent will work best for a merchant.",
        "[Ai2’s StateBench explainer](https://huggingface.co/blog/allenai/statebench), also published November 3, describes deteriorating accuracy on harder state-update sequences as inputs grow. Its synthetic tasks use fixed variables and controlled operations. That makes it a useful source of test ideas, not an estimate of inventory mistakes in real stores. We reviewed the explainer, not a full-paper reproduction.",
        "Our synthesis is a testable question: when the model stays fixed, does a revised workflow produce more correct, affordable outcomes on the operator’s own bounded tasks? Testing that question is more informative than treating a general benchmark score as an ecommerce service guarantee."
      ]
    },
    {
      "id": "cases",
      "title": "Design cases around the failure you need to detect",
      "paragraphs": [
        "The following are original hypothetical cases from the [downloadable worksheet](/research/ecommerce-agent-evaluation-2026-11-07.json), not observed incidents. Run them against an isolated copy or a simulation. Define the expected state before exposing the case to the agent, and keep the answer key outside its tools."
      ],
      "table": {
        "caption": "Proposed ecommerce acceptance cases · hypothetical fixtures, not merchant results · worksheet dated November 7, 2026",
        "headings": [
          "Case",
          "Controlled challenge",
          "What passes"
        ],
        "rows": [
          [
            "Variant boundary",
            "An unavailable red variant sits beside an available blue variant",
            "The answer preserves variant identity and does not offer unavailable red stock"
          ],
          [
            "Stale snapshot",
            "An older stock snapshot arrives after the current version",
            "The current version wins under the declared ordering rule; the stale input cannot overwrite it"
          ],
          [
            "Duplicate event",
            "An inventory decrement is delivered again with the same event ID",
            "The decrement is applied once and the retry is recorded without a second stock change"
          ],
          [
            "Unsupported claim",
            "A source description contains an unverified durability assertion",
            "The draft omits the unsupported assertion and identifies the evidence gap"
          ]
        ]
      }
    },
    {
      "id": "protocol",
      "title": "Freeze a small protocol before comparing configurations",
      "paragraphs": [
        "The [proposed protocol](/research/ecommerce-agent-evaluation-2026-11-07.json) uses 12 de-identified historical cases selected before testing: 4 catalog tasks, 4 inventory or promotion tasks and 4 constrained-content tasks. Give each case 3 variants: normal input, stale evidence and a retry or duplicate. Repeat each variant 3 times. That is 108 attempts per configuration and 216 for a two-configuration comparison. These are design choices, not completed trials or a statistical-power calculation.",
        "Keep the model version, case set, available tools, tool versions and call/token budget fixed. Record sampling settings where supported. Randomize execution order and restore the same starting state between attempts. Record every timeout and aborted attempt; silently discarding them would overstate completion.",
        "Hold the reference answer and state-transition rules separately from the agent. A stale snapshot should not be treated like a late-arriving additive event: specify whether the input replaces state or applies a change. A retry needs a stable event identifier; identical text alone does not establish that two legitimate transactions are duplicates.",
        "Capture the uncorrected result first. If a person repairs it, retain both the original failure and the eventual assisted outcome with correction time. Otherwise the revised workflow can appear more reliable merely because it received more invisible help."
      ]
    },
    {
      "id": "scorecard",
      "title": "Separate accepted work from generated output",
      "paragraphs": [
        "An attempted task passes only if its predeclared output checks and final-state checks both pass and it stays within its authorization boundary. An answer-only score can still be useful diagnostically, but it must not be relabeled completion.",
        "Use the [worksheet definitions](/research/ecommerce-agent-evaluation-2026-11-07.json) consistently. The acceptance share is accepted attempts divided by all started attempts, including timeouts. Scenario consistency requires every variant and repeat of a selected case to pass; report the numerator and denominator rather than mixing that stricter measure with the attempt-level rate.",
        "Separate before-correction acceptance from assisted acceptance. List unsupported claims, duplicate actions and variant-boundary errors as distinct failure counts. Do not collapse those problems into a single quality score that could hide an unacceptable action behind fluent prose."
      ],
      "table": {
        "caption": "Run-record fields for the proposed pilot · blank until measured",
        "headings": [
          "Measure",
          "Record",
          "Interpretation"
        ],
        "rows": [
          [
            "Acceptance",
            "Accepted attempts / all started attempts",
            "Did the predeclared output and state checks pass before correction?"
          ],
          [
            "Consistency",
            "Cases passing every variant and repeat / selected cases",
            "Did the same case remain reliable under the planned perturbations?"
          ],
          [
            "Correction work",
            "Review minutes and correction minutes, separately",
            "How much human work accompanied the result?"
          ],
          [
            "Elapsed time",
            "Seconds from start through final verification",
            "Include tool execution, retries and waiting"
          ],
          [
            "Operating cost",
            "Actual inference, tools, hosting allocation and labor",
            "Keep missing costs unknown; include failed attempts"
          ]
        ]
      }
    },
    {
      "id": "cost",
      "title": "Make the denominator an accepted task",
      "paragraphs": [
        "Compute cost per accepted task as all actual inference and tool charges, allocated hosting and valued review/correction labor divided by accepted tasks. Include the cost of failures in the numerator. If no task is accepted, the ratio is undefined. If a labor rate is unknown, report measured minutes and known charges separately rather than entering zero.",
        "State whether the denominator is before-correction acceptance or assisted acceptance. For the latter, include the associated correction labor. Keep the manual baseline’s scope comparable: a quick draft and a fully reconciled update are different deliverables.",
        "Latency needs its own scope. [Artificial Analysis’s methodology](https://artificialanalysis.ai/methodology/performance-benchmarking), read November 7, documents a November 3, 2026 version change that alters headline aggregation and includes first-token delay. Its multi-turn duration excludes tool execution time. That is a legitimate endpoint measure, but an operator’s completion timer should include the tools and verification the job actually requires.",
        "No cost reduction is claimed here. The worksheet does not authorize API purchases or production writes. Predeclare a spend limit and a narrow operating boundary for any later pilot."
      ]
    },
    {
      "id": "decision",
      "title": "Use failures to choose the next intervention",
      "paragraphs": [
        "If output is wrong while stored facts and final state are correct, inspect generation instructions and claim checking. If the answer is correct but stored state is wrong, inspect the read/write path, identity checks and retry handling. If both pass but review effort remains high, measure where the correction queue accumulates before choosing another model.",
        "A small passing pilot justifies a bounded next test. It cannot establish production safety, seasonal resilience or revenue lift. Set task-specific acceptance requirements before execution and make unauthorized changes or unsupported product claims explicit stop conditions. Do not choose a pass threshold after inspecting the results.",
        "Use the [MarketplaceBeta Intelligence dashboard](/intelligence) to investigate source-linked platform changes, then use this worksheet to translate a relevant change into a testable operational question. For an implementation discussion, bring the task boundary, sanitized cases, expected states and measured failure log; those inputs make a project scope concrete without claiming an outcome in advance."
      ]
    },
    {
      "id": "methods",
      "title": "Methods, scope and reuse",
      "paragraphs": [
        "Evidence cutoff: November 7, 2026, 12:35:50 UTC for the underlying private research brief; the three selected primary pages were reopened on November 7. Publication dates are distinguished from retrieval dates in the downloadable evidence. The method is ecommerce-agent-evaluation-v1.",
        "We selected three primary documents from nine claim-linked documents in the current research brief because they address completion, changing state and measurement scope. This is a purposive methods synthesis, not a survey of agents or an independent benchmark. Ai2 and IBM publish their own research; Artificial Analysis documents its own measurements. These sources are not replications of the same experiment.",
        "The database supplied discovery and dated provenance. Only verified public-source facts, original analysis and original synthetic fixtures are released. There are no merchant outcomes, adoption estimates, forecasts or measured savings. The proposed pilot remains unexecuted; small related case variants are not independent observations for population inference.",
        "Suggested citation: MarketplaceBeta Research, “Your AI agent’s final answer is only half the acceptance test,” November 7, 2026, with this canonical article and the [dated worksheet](/research/ecommerce-agent-evaluation-2026-11-07.json). Reuse the original worksheet with attribution and retain its hypothetical/unexecuted labels. Attribute benchmark findings to their original researchers; their text and datasets remain subject to their own terms.",
        "Prepared and reviewed through an automated research and editorial process. No individual human-review attestation is made."
      ]
    }
  ],
  "sources": [
    {
      "label": "IBM Research: same model, different harness",
      "href": "https://huggingface.co/blog/ibm-research/cuga-harness",
      "context": "Published November 3, 2026; reopened November 7. Developer-run AppWorld comparison with differing configurations and no policy-enforcement test."
    },
    {
      "label": "Ai2: StateBench explainer",
      "href": "https://huggingface.co/blog/allenai/statebench",
      "context": "Published November 3, 2026; reopened November 7. Synthetic state-tracking research; not a merchant error-rate study."
    },
    {
      "label": "Artificial Analysis: API performance methodology",
      "href": "https://artificialanalysis.ai/methodology/performance-benchmarking",
      "context": "Read November 7, 2026. Method version 3.0.0 dated November 3; page-wide publication date not established. Tool execution excluded from multi-turn duration."
    },
    {
      "label": "MarketplaceBeta: dated evaluation worksheet",
      "href": "/research/ecommerce-agent-evaluation-2026-11-07.json",
      "context": "Original hypothetical fixtures, blank run record and proposed protocol. No merchant data, paid test or operating result."
    }
  ]
}
, {
  "slug": "shopify-ai-knowledge-base-published-facts-audit",
  "seoTitle": "Shopify AI Knowledge Base: Audit Published Facts",
  "metaDescription": "A practical Shopify knowledge-base audit: distinguish unpublished scans, published admin facts and manual references before testing AI answers.",
  "headline": "Audit what Shopify’s AI knowledge base publishes—not just what it knows",
  "dek": "Fact origin changes the review queue. Check published policy answers and their references before adding more store content.",
  "publishedOn": "2026-11-08",
  "updatedOn": "2026-11-08",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "Shopify",
    "AI agents",
    "store operations",
    "research methods"
  ],
  "takeaway": "Audit publication status, answer accuracy and supporting references as separate checks. A fact being present in the admin does not establish that an agent can retrieve it—or that its answer is current.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_knowledge_audit",
  "sections": [
    {
      "id": "finding",
      "title": "The finding: fact origin changes the starting status",
      "paragraphs": [
        "[Shopify’s knowledge-base documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base), read November 8, 2026, says scanned storefront facts start unpublished, while facts linked to the Shopify admin publish when created. Published knowledge-base information is publicly available through Storefront MCP. This is documented behavior, not a test of a merchant account.",
        "The practical implication is to inspect the published queue as well as the unpublished queue. Reviewing only newly scanned suggestions can miss an existing policy answer that already needs correction. This audit concerns store information; it complements the separate checkout-path test."
      ],
      "table": {
        "caption": "Documented initial status · Shopify Help Center, retrieved November 8, 2026 · inspect actual current status before acting",
        "headings": [
          "Fact origin",
          "Documented starting status",
          "Audit question"
        ],
        "rows": [
          [
            "Storefront scan",
            "Unpublished",
            "Is the answer correct and ready to publish?"
          ],
          [
            "Linked Shopify admin information",
            "Published when created",
            "Does the published answer still match the authoritative policy?"
          ]
        ]
      }
    },
    {
      "id": "references",
      "title": "A manual override creates a maintenance job",
      "paragraphs": [
        "The [same documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base) says changing a field to Manual removes references supplied by its former source; references added by the merchant remain. New scans can suggest updates, but those suggestions need approval. Scans can miss changes. A requested rescan can take up to 48 hours.",
        "Treat a manual override as a maintained record. Give it an owner, a review date and a customer-facing source that supports the complete answer. A reference that supports the return window but omits an exception is not enough to validate the exception.",
        "Do not assume that correcting a policy page closes the issue. Verify the knowledge-base answer, publication status and references after the correction, then inspect the answer actually returned in the intended channel. Those are separate checkpoints."
      ]
    },
    {
      "id": "worksheet",
      "title": "A short audit record for each policy answer",
      "paragraphs": [
        "Use the [downloadable worksheet](/research/shopify-knowledge-base-audit-2026-11-08.json) to record the question, source, published answer and verification result. Start with questions whose incorrect answers would change a buyer’s decision: returns, delivery coverage, contact options and warranty conditions. Keep credentials and customer messages out of a shared worksheet."
      ],
      "table": {
        "caption": "Original proposed audit worksheet · not a completed store assessment",
        "headings": [
          "Checkpoint",
          "Evidence to retain",
          "Next action if it fails"
        ],
        "rows": [
          [
            "Authoritative answer",
            "Dated policy and applicable exceptions",
            "Resolve the policy ambiguity"
          ],
          [
            "Publication status",
            "Observed field status and source type",
            "Review before publishing or unpublishing"
          ],
          [
            "References",
            "Public links supporting the full answer",
            "Repair stale or incomplete support"
          ],
          [
            "Retrieved answer",
            "Exact test question, channel and observed response",
            "Investigate the mismatch without assuming its cause"
          ],
          [
            "Maintenance",
            "Named owner and next review trigger",
            "Assign responsibility for later changes"
          ]
        ]
      }
    },
    {
      "id": "example",
      "title": "Example: correct words, incomplete scope",
      "paragraphs": [
        "Hypothetical example: a store’s policy permits returns for ordinary stock but excludes personalized items. A saved answer says only that returns are accepted. The broad answer can look accurate while losing the exception that matters to the buyer.",
        "The audit should preserve the relevant exception in the authoritative answer and check whether the retrieved response keeps it. If the response omits it, log the mismatch. Do not infer from that single observation whether the cause is a source field, retrieval selection or the responding model.",
        "Repeat the same question after correction and retain both results. An unavailable response is untested, not a pass. If a test has no applicable exception, mark that field not applicable rather than inventing one."
      ]
    },
    {
      "id": "measure",
      "title": "Measure answer quality separately from visibility",
      "paragraphs": [
        "Report correct answers divided by completed checks, alongside the number of planned checks that could not be completed. Break failures down into wrong answer, missing exception, stale reference and unavailable retrieval. Do not let a smaller denominator make an incomplete audit look better.",
        "This worksheet tests answer consistency. It does not measure search visibility, orders or contribution margin. Keep any later traffic or sales assessment separate and use actual attribution rather than treating a corrected answer as revenue.",
        "After policy facts are checked, use our [Shopify checkout audit](/intelligence/analysis/shopify-ai-channel-fees-chatgpt-checkout-2026) to inspect the purchase path. The [Intelligence dashboard](/intelligence) provides source-linked context for choosing which operational change to investigate next."
      ]
    },
    {
      "id": "methods",
      "title": "Sources, scope and reuse",
      "paragraphs": [
        "This is an original operator workflow based on one current Shopify Help Center page, reopened November 8, 2026. Discovery came from today’s internal AI research brief, whose cutoff was November 8, 2026 at 12:01:12 UTC. The page has no verified publication date; retrieval is not a launch date. Source details and a blank record are in the [dated evidence file](/research/shopify-knowledge-base-audit-2026-11-08.json).",
        "The documented distinction is narrower than a performance claim: it describes publication behavior, not how reliably any AI channel answers a question. No merchant account, live transaction or customer outcome was tested. Account configuration and future documentation changes may affect applicability.",
        "Cite MarketplaceBeta Research, this article’s title, November 8, 2026 and its canonical URL. Reuse the original worksheet with attribution, preserving its proposed-workflow label. Cite Shopify for platform behavior and recheck the current documentation before applying it."
      ]
    }
  ],
  "sources": [
    {
      "label": "Shopify: answering customer questions with your knowledge base",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base",
      "context": "Current undated documentation; read November 8, 2026. Publication status, manual references, suggestions and rescan behavior."
    },
    {
      "label": "MarketplaceBeta: dated audit worksheet",
      "href": "/research/shopify-knowledge-base-audit-2026-11-08.json",
      "context": "Original blank worksheet and source map. No merchant records or measured outcomes."
    }
  ]
},
{
  "slug": "amazon-selling-partner-plugin-approval-record",
  "seoTitle": "Amazon AI Plugin: Build a Useful Approval Record",
  "metaDescription": "A practical approval record for Amazon seller AI workflows: exact SKU, before-and-after values, evidence age, execution status and read-back.",
  "headline": "An approval button needs a change record behind it",
  "dek": "Amazon’s plugin separates questions from account changes. Build the operator handoff around the exact change, not the agent’s summary.",
  "publishedOn": "2026-11-10",
  "updatedOn": "2026-11-10",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "Amazon",
    "AI agents",
    "seller operations"
  ],
  "takeaway": "Group the review by Parent ASIN, but approve and verify the exact child ASIN, seller SKU, marketplace and field. Keep proposed, approved, submitted and verified changes distinct.",
  "forecastIds": [],
  "newsletterSource": "campaign_amazon_approval_record",
  "sections": [
    {
      "id": "finding",
      "title": "The boundary is documented; the handoff is your design choice",
      "paragraphs": [
        "[Amazon’s current plugin FAQ](https://developer.amazonservices.com/amazon-selling-partner-plugin), read November 10, says read-only questions run freely and account-changing requests prompt for approval. It names listing edits, shipments and pricing updates as examples. The page also tells sellers to grant the data and action permissions they want the agent to access.",
        "The operational implication: an exception list and a change queue deserve different handling. Use the first to investigate; require a specific proposed change before treating the second as ready for approval. Our recommendation is a concise change record that an operator can compare with the business system.",
        "This is an original workflow proposal based on documentation, not a test of the plugin. Amazon’s stated approval requirement does not establish how every stale proposal, retry or partial failure behaves. Those details need account-specific verification."
      ]
    },
    {
      "id": "record",
      "title": "What should travel with the approval request?",
      "paragraphs": [
        "Use the [blank change record](/research/amazon-agent-approval-record-2026-11-10.json) for a bounded pilot. Parent ASIN is a useful grouping for a review meeting; the proposed operation still needs an exact target. Do not let a family-level summary stand in for a child or seller SKU.",
        "Record the current value and capture time before writing the desired value. Include the evidence that justifies the change and the expected result. If the needed field or identifier cannot be inspected, route the item for investigation rather than filling the gap with a guess."
      ],
      "table": {
        "caption": "Proposed operator record · blank until tested · November 10, 2026",
        "headings": [
          "Record",
          "What the reviewer checks",
          "If missing"
        ],
        "rows": [
          [
            "Target",
            "Marketplace, seller SKU, child ASIN and optional Parent ASIN grouping",
            "Resolve identity before approval"
          ],
          [
            "Before → after",
            "Exact field, observed value, proposed value and units",
            "Request the complete change"
          ],
          [
            "Evidence age",
            "When the current value was read and what supports the proposal",
            "Refresh or investigate"
          ],
          [
            "Approval scope",
            "The proposal version the operator accepted",
            "Do not reuse an ambiguous approval"
          ],
          [
            "Result",
            "Submission status plus an independent read-back",
            "Keep the task unresolved"
          ]
        ]
      }
    },
    {
      "id": "example",
      "title": "Hypothetical case: a price changes while approval is pending",
      "paragraphs": [
        "An agent proposes a price correction. Before the operator approves it, another authorized process changes that SKU’s price. The old recommendation may still sound sensible, but it no longer describes the current starting point.",
        "In the proposed workflow, the operator refreshes the relevant state, compares it with the recorded before-value and prepares a revised proposal if they differ. Approval attaches to that proposal version. This is a design criterion to test, not an assertion that Amazon’s plugin exposes version locking or performs this comparison.",
        "The same discipline helps with listings: verify the exact editable field and the seller contribution you intend to change. An accepted submission and the buyer-visible page are separate observations; record which one you actually inspected."
      ]
    },
    {
      "id": "recovery",
      "title": "Keep an uncertain result out of the retry queue",
      "paragraphs": [
        "After submission, classify the outcome as confirmed, rejected or unknown. A timeout alone cannot tell you whether a change reached its destination. Read the relevant state or available operation status before deciding whether a retry is appropriate.",
        "Retain the operation identifier if one is provided. If the workflow cannot expose enough evidence to distinguish an unapplied action from an applied action with a lost response, hold the retry for investigation. Do not assume that identical text means an operation will be deduplicated.",
        "A correction is another proposed change. Check the current state before trying to restore an older value; otherwise recovery could overwrite legitimate work completed in the meantime. Keep the original proposal, result and correction linked."
      ]
    },
    {
      "id": "pilot",
      "title": "Start with a decision queue you can inspect",
      "paragraphs": [
        "For a first pilot, choose one task type and a small set of previously resolved, non-sensitive cases. Replay them in a sandbox or draft-only environment. Include a stale proposal, a rejected approval and an uncertain execution result. Write the expected handling before running the cases.",
        "Report verified correct outcomes divided by all started cases, with unresolved cases separately counted and retained in the denominator. Record unintended changes, repeated actions and review minutes separately. These are proposed measures; no results or time savings are claimed.",
        "Use the [existing agent acceptance worksheet](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) for the broader evaluation. The change record here is the narrower operator handoff. Use the [Intelligence dashboard](/intelligence) to trace the platform developments that make a workflow worth investigating."
      ]
    },
    {
      "id": "methods",
      "title": "Source, scope and reuse",
      "paragraphs": [
        "Scope: one current Amazon plugin FAQ, reopened November 10, 2026; discovery came from the internal research brief with a November 10, 12:46:03 UTC cutoff. The FAQ’s publication date is unverified. Its retrieval date is not a release date. The [dated source map and worksheet](/research/amazon-agent-approval-record-2026-11-10.json) separate documented behavior from our proposed controls.",
        "No seller account, API operation or live transaction was tested. Permission availability, visible fields and execution status need verification in the intended account. The worksheet contains no private seller data; keep populated records private.",
        "Cite MarketplaceBeta Research, this title, November 10, 2026 and the canonical article URL. Reuse the original blank record with attribution and preserve its proposed-workflow label. Cite Amazon for platform behavior and recheck the current FAQ before implementation."
      ]
    }
  ],
  "sources": [
    {
      "label": "Amazon Selling Partner plugin FAQ",
      "href": "https://developer.amazonservices.com/amazon-selling-partner-plugin",
      "context": "Undated current documentation, read November 10, 2026. Read/write approval boundary and permissions."
    },
    {
      "label": "MarketplaceBeta change record and source map",
      "href": "/research/amazon-agent-approval-record-2026-11-10.json",
      "context": "Original blank worksheet; no merchant results."
    }
  ]
}
,
{
  "slug": "chatgpt-discovery-metrics-order-ledger",
  "seoTitle": "ChatGPT Discovery Metrics: An Ecommerce Measurement Plan",
  "metaDescription": "Keep ChatGPT mentions, referrals and paid orders distinct. A practical worksheet for compatible denominators, missing metrics and contribution costs.",
  "headline": "ChatGPT discovery metrics need a separate order ledger",
  "dek": "New business insights create a useful observation point. They do not, by themselves, connect an AI mention to a profitable order. Here is a measurement plan for that gap.",
  "publishedOn": "2026-11-11",
  "updatedOn": "2026-11-11",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "6 min",
  "tags": [
    "AI agents",
    "ecommerce strategy",
    "measurement",
    "research methods"
  ],
  "takeaway": "Before judging an AI discovery channel, define which measurements can be compared and which cannot. Keep unavailable metrics distinct from zero, and reconcile attributed orders and costs separately.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_measurement",
  "sections": [
    {
      "id": "finding",
      "title": "The useful question: what can these numbers establish?",
      "paragraphs": [
        "OpenAI’s [November 10 launch announcement](https://openai.com/index/introducing-businesses-chatgpt/), read November 11, describes Businesses in ChatGPT as a beta. Business Hub offers aggregate mentions, website clicks and discovery topics. Insights depend on conversation or interaction thresholds; OpenAI says it does not share users’ conversations or Business Agent chats with businesses.",
        "Our interpretation: treat discovery reporting as an observation layer, then establish a separate, documented connection to store outcomes. A dashboard can answer a narrower question well without answering whether a channel pays for itself. The missing step is not another summary of the dashboard. It is a measurement contract that says what each number counts.",
        "This report proposes that contract. It is an operator workflow, not a merchant performance study or a tested Business Hub integration. No conversion, incremental revenue or profitability result is claimed."
      ]
    },
    {
      "id": "ledgers",
      "title": "Keep discovery, store activity and economics separate",
      "paragraphs": [
        "Use the following table to assign each question to the evidence that could answer it. The store and cost rows are our proposed measurement requirements, not a claim about fields or exports available in Business Hub. Preserve the platform’s exact metric definition when it is available; otherwise record the definition as unresolved."
      ],
      "table": {
        "caption": "Proposed ecommerce measurement plan · authored November 11, 2026 · no merchant observations",
        "headings": [
          "Question",
          "Record to retain",
          "Boundary"
        ],
        "rows": [
          [
            "Was the business visible?",
            "Reported mentions, period and platform definition",
            "A mention count is not a count of buyers"
          ],
          [
            "Did activity reach the store?",
            "Website clicks separately from store-recorded referral sessions",
            "Do not assume a click and a session are the same event"
          ],
          [
            "Did the defined store cohort buy?",
            "Eligible sessions and those with a paid order, under one attribution rule",
            "Only calculate a rate when the numerator belongs to the denominator"
          ],
          [
            "What remained after variable costs?",
            "Cohort order revenue, refunds and declared cost components",
            "Attributed contribution does not prove incremental profit"
          ]
        ]
      }
    },
    {
      "id": "denominators",
      "title": "A ratio needs more than two available numbers",
      "paragraphs": [
        "A numerator must belong to the population described by its denominator. Do not label website clicks divided by mentions a click-through rate unless the metric definitions establish a compatible opportunity set. Matching date labels alone does not prove that relationship. Counts may be repeated events rather than unique people, and the announcement does not provide the definitions needed to resolve that question.",
        "For your own store, one possible measure is the share of eligible, attributed sessions with at least one paid order. Count qualifying sessions in both numerator and denominator; keep order count as a separate measure. Decide how later orders, cancellations and attribution changes will be handled before calculating the result.",
        "Write the session window, order follow-up cutoff, time zone, attribution rule and exclusions beside that rate. Unattributed sessions are a separate observed group, not evidence that those visitors never encountered AI. A change in attribution rules creates a new measurement series unless you can recompute the old one consistently."
      ]
    },
    {
      "id": "missingness",
      "title": "Unavailable is a result category, not a zero",
      "paragraphs": [
        "Keep a value and an availability status in separate fields. Use statuses such as observed, threshold-withheld, not-enabled, not-collected and unknown. Assign a specific reason only when the interface or documentation supports it. A blank screen alone does not identify why a metric is absent.",
        "Hypothetical example: a merchant has store-recorded referrals for a week but no displayed discovery count. Dividing orders by an invented zero is meaningless; treating the absent count as proof of no visibility is also unsupported. Record the store observations, preserve the missing platform value, and leave the cross-system conversion calculation unavailable.",
        "For repeated reports, distinguish periods with comparable definitions and availability from periods that cannot be compared. Do not silently drop unavailable periods and describe the remaining ones as a complete trend. This workflow deliberately permits an unresolved result."
      ]
    },
    {
      "id": "costs",
      "title": "Give attributed contribution its own reconciliation",
      "paragraphs": [
        "For the same declared order cohort, reconcile revenue after discounts and refunds, excluding collected sales tax, with recorded product, payment, fulfillment and return costs. State whether customer shipping revenue is included and prevent any cost from being deducted twice. Show incomplete cost fields instead of presenting an incomplete subtotal as profit.",
        "Keep channel setup and ongoing operating costs visible alongside that subtotal. Choose an allocation rule before comparing channels, or report shared costs separately when allocation would be arbitrary. This is a proposed management worksheet, not a substitute for your accounting records.",
        "Even a positive attributed contribution does not establish that the channel created additional orders. Existing customers, promotions, stock changes or other marketing could affect the same period. A before-and-after comparison is descriptive unless the evaluation design supports a stronger conclusion. No such causal evaluation was performed here."
      ]
    },
    {
      "id": "decisions",
      "title": "Let the gap determine the next task",
      "paragraphs": [
        "Start with one eligible business account and one clearly defined store scope. Confirm access and metric definitions, retain a baseline, and use the [blank measurement worksheet](/research/chatgpt-discovery-measurement-2026-11-11.json) to document the boundaries. It is JSON for reuse, not an executable connector."
      ],
      "bullets": [
        "If discovery is reported but store referrals are unclear, reconcile definitions, windows and the intended destination before declaring a checkout problem.",
        "If the store cohort reaches product pages but has few paid orders, inspect the observed purchase path. Use the [Shopify checkout audit](/intelligence/analysis/shopify-ai-channel-fees-chatgpt-checkout-2026) to frame tests; do not assume the discovery metric explains the failure.",
        "If orders are attributed but costs are incomplete, finish the cost reconciliation before recommending expansion.",
        "If measurement definitions or availability change, mark the break and reassess comparability before describing growth.",
        "Publish only safe aggregates. Keep customer-level records and populated order worksheets in your authorized private systems."
      ]
    },
    {
      "id": "methods",
      "title": "Evidence, scope and limitations",
      "paragraphs": [
        "The topic was selected from MarketplaceBeta’s internal research brief with a November 11, 2026, 12:13:47 UTC cutoff. We inspected the complete claim-evidence linkage for that brief and reopened the relevant OpenAI primary announcement. The public evidence file contains a concise source map and an original blank worksheet; private research identifiers and source archives are excluded.",
        "The external factual scope is one announcement, published November 10 and read November 11, 2026. The rest is our proposed measurement method. We did not inspect a Business Hub account, run a merchant transaction, test an analytics export or observe any store outcome. Availability, definitions and integrations must be checked in the intended account.",
        "No headline-volume comparison, adoption estimate, representative market sample, significance claim or forecast is made. This method can organize a pilot, but it cannot supply evidence that the pilot has succeeded."
      ]
    },
    {
      "id": "reuse",
      "title": "Reuse the method with its boundaries intact",
      "paragraphs": [
        "Cite MarketplaceBeta Research, this article title, November 11, 2026, the canonical article URL and the linked worksheet. Reuse the original blank fields with attribution; preserve the distinction between reported observations and proposed measurements. Cite OpenAI for the platform announcement and recheck current documentation before implementation.",
        "Use the [Intelligence dashboard](/intelligence) for source-linked platform research. The practical deliverable for an ecommerce AI project is a documented decision: what was observed, what remains unknown, and what evidence would justify the next step."
      ]
    }
  ],
  "sources": [
    {
      "label": "OpenAI: Introducing Businesses in ChatGPT",
      "href": "https://openai.com/index/introducing-businesses-chatgpt/",
      "context": "Published November 10, 2026; read November 11. Beta discovery insights and their aggregation/privacy boundary."
    },
    {
      "label": "MarketplaceBeta measurement worksheet and source map",
      "href": "/research/chatgpt-discovery-measurement-2026-11-11.json",
      "context": "Original blank operator worksheet. No merchant records, measured conversion or financial outcomes."
    }
  ]
},
{
  "slug": "self-hosted-agent-migration-input-completion-check",
  "seoTitle": "Self-Hosted Agents: Test Inputs and Completion",
  "metaDescription": "A practical migration worksheet for ecommerce AI agents: verify image inputs, worker execution and scheduled outputs before trusting a successful request.",
  "headline": "Your agent accepted the request. Did it receive the product image?",
  "dek": "Self-hosted agent compatibility needs checks for inputs, execution and completed work. A successful request can leave those questions unanswered.",
  "publishedOn": "2026-11-15",
  "updatedOn": "2026-11-15",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "AI agents",
    "ecommerce operations",
    "research methods"
  ],
  "takeaway": "Before moving a listing-review workflow, verify that the model sees its inputs, tools actually run and the expected output exists. Keep those checks separate from API availability.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "finding",
      "title": "The missing-input problem",
      "paragraphs": [
        "Anthropic\u2019s [self-hosted compatibility documentation](https://platform.claude.com/docs/en/managed-agents/self-hosted/differences), read November 15, 2026, says URL-sourced image or document blocks can be accepted without reaching the model or raising an error. It specifies base64 inputs, or text for documents, as alternatives. That is documented behavior, not a deployment we tested.",
        "For an ecommerce image-review workflow, this creates a specific blind spot: a fluent answer may come from the surrounding product text. It cannot establish that the agent inspected the image. Our proposed correction is an image-only check whose expected answer is deliberately absent from the prompt and filename."
      ]
    },
    {
      "id": "boundaries",
      "title": "Separate acceptance, execution and completion",
      "paragraphs": [
        "The [same documentation](https://platform.claude.com/docs/en/managed-agents/self-hosted/differences) describes tool calls waiting without an error when no worker is polling. It also says self-hosted servers do not provide hosted scheduled deployments or webhooks; operators must supply scheduling and track sessions through events. These are separate migration requirements, not evidence that self-hosting is unreliable."
      ],
      "table": {
        "caption": "Original proposed checks derived from vendor documentation read November 15, 2026; no trial results",
        "headings": [
          "Boundary",
          "Test evidence",
          "What it does not establish"
        ],
        "rows": [
          [
            "Input visibility",
            "Correct answer to an image-only fact",
            "General vision accuracy"
          ],
          [
            "Tool execution",
            "Observed tool result from the intended worker",
            "Completion of the business task"
          ],
          [
            "Task completion",
            "Expected artifact plus terminal session result",
            "Production reliability or commercial value"
          ]
        ]
      }
    },
    {
      "id": "protocol",
      "title": "Build a check that text alone cannot pass",
      "paragraphs": [
        "Use a synthetic product image with a distinctive visible feature and a neutral filename. Write the expected answer before running the task. Ask about the visible feature without describing it in the prompt. Compare the intended input route with a documented supported route, holding the model, question and permissions constant.",
        "Include a text-only control with the image removed. If the control supplies the same apparently correct answer, investigate leakage or guessing before calling the image test successful. A failed visual answer also has several possible causes: input delivery, image quality, ambiguous instructions or model behavior. Retain the exact input and session evidence to distinguish them.",
        "Use the [blank migration worksheet](/research/agent-migration-check-2026-11-15.json) to record expected and actual results. It is a proposed protocol, not an executable integration or a completed benchmark. Keep populated logs in an authorized private system."
      ]
    },
    {
      "id": "recovery",
      "title": "Prove the output arrived before replacing the workflow",
      "paragraphs": [
        "Run a draft-only task with the test worker stopped. Check whether monitoring identifies the missing progress within a limit selected before the test. Restore the worker and inspect the completed artifact and any duplicate output. Keep prices, inventory and live marketplace listings outside this test.",
        "Then run through the intended scheduler and check the output itself, its timestamp and terminal status. A scheduler firing and an API accepting a request are intermediate events. The migration record needs to show which boundary passed and which remains unresolved.",
        "Compare the baseline and candidate using the same synthetic cases. Retain all started cases in the denominator, with rejected and unknown outcomes separately counted. Record correction time and total operating cost. Choose a larger representative trial only after compatibility checks pass; this worksheet alone cannot establish savings."
      ]
    },
    {
      "id": "decision",
      "title": "Choose the smallest change that addresses the observed gap",
      "paragraphs": [
        "Anthropic\u2019s [hosting overview](https://platform.claude.com/docs/en/managed-agents/self-hosted), read November 15, distinguishes hosting tool sandboxes from also hosting the agent service. Model inference remains with Anthropic or the selected provider. Self-hosting the service adds responsibility for its database, workers and releases.",
        "If the actual requirement concerns access to local product files, first determine which component must move. If storage or inference routing is the requirement, document it explicitly. A migration should solve a named constraint, with an accepted output test and a rollback path, rather than assume lower operating cost.",
        "Use our [agent evaluation guide](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) for the broader acceptance and cost record, and the [Intelligence dashboard](/intelligence) for source-linked platform context."
      ]
    },
    {
      "id": "methods",
      "title": "Method and reuse",
      "paragraphs": [
        "The question came from MarketplaceBeta\u2019s November 15 research brief, cut off at 12:16:51 UTC. We read its complete seven claim-evidence links and reopened the hosting overview and compatibility page. The public worksheet contains only original blank fields and source URLs; private provenance is retained separately.",
        "The factual scope is the documented self-hosted Managed Agents behavior at retrieval. Publication dates are unknown; November 15 is a reading date, not a launch date. No server was deployed, merchant account inspected, API behavior reproduced or task performance measured. Documentation can change; verify the target release before implementation.",
        "Cite MarketplaceBeta Research, this title, November 15, 2026 and the canonical article URL when reusing the protocol. Preserve its unexecuted status and cite the vendor for documented behavior. This article makes no adoption, causation, significance or revenue claim."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic: self-hosted compatibility differences",
      "href": "https://platform.claude.com/docs/en/managed-agents/self-hosted/differences",
      "context": "Read November 15, 2026; publication date unknown. Input, worker and scheduling exceptions."
    },
    {
      "label": "Anthropic: self-hosted overview",
      "href": "https://platform.claude.com/docs/en/managed-agents/self-hosted",
      "context": "Read November 15, 2026; deployment responsibilities."
    },
    {
      "label": "Original migration worksheet",
      "href": "/research/agent-migration-check-2026-11-15.json",
      "context": "Blank, unexecuted protocol and dated source map."
    }
  ]
}
,
{
  "slug": "ecommerce-ai-forecast-backtest-cutoff-ledger",
  "seoTitle": "Test an AI Sales Forecast Before It Orders Stock",
  "metaDescription": "An ecommerce forecasting worksheet: freeze historical inputs, compare a seasonal baseline, and test replenishment decisions separately.",
  "headline": "Before an AI forecast orders stock, make it pass a cutoff audit",
  "dek": "A model can look accurate after seeing information the merchant did not have. This proposed seller pilot records what was knowable at each forecast date, then tests predictions and inventory decisions separately.",
  "publishedOn": "2026-11-16",
  "updatedOn": "2026-11-16",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "7 min",
  "tags": [
    "AI forecasting",
    "ecommerce operations",
    "original research",
    "evaluation"
  ],
  "takeaway": "Freeze both the sales history and the information available at each historical cutoff. Compare candidate and baseline on identical targets, keep missing outputs visible, and require a separate inventory-policy test before allowing purchase orders.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "question",
      "title": "The useful question is what the system knew at the time",
      "paragraphs": [
        "A merchant is considering an AI workflow that predicts next week’s sales and drafts a replenishment order. The first acceptance question should be whether the evaluation reconstructs the information available when the forecast would have been made. A convincing explanation of last month is not that test.",
        "Mistral’s [Timestral announcement](https://mistral.ai/news/timestral/), published October 15 and reopened November 16, 2026, describes numerical forecasts with past-only and known-future inputs. That makes a seller trial worth designing. It does not establish better forecasts or profitable replenishment for a particular store; we have not run the model.",
        "Our contribution here is an original proposed cutoff ledger and decision protocol. It extends the [agent acceptance guide](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) to historical forecasting, where a correct-looking output can be contaminated before the agent starts."
      ]
    },
    {
      "id": "ledger",
      "title": "Put an availability date beside every input",
      "paragraphs": [
        "Choose a sellable SKU, channel, timezone and target definition before assembling history. For this pilot, the target is daily ordered units after a declared cancellation treatment; returns remain a separate series. This is an observed-sales target, not a claim to recover all customer demand.",
        "A value needs both the period it describes and the time it became available. A promotion may concern next Friday but have been scheduled last Monday. A corrected order count may describe last Friday but have been finalized only today. Those are different permissions to use a value in a historical forecast.",
        "Use the [blank cutoff ledger](/research/forecast-cutoff-ledger-2026-11-16.json) to preserve the input snapshot, transformation version and source of each field. Keep completed ledgers private. When the historical version cannot be reconstructed, mark the case unreconstructable instead of silently supplying today’s version."
      ],
      "table": {
        "caption": "Proposed input audit; examples are hypothetical, not observed merchant records.",
        "headings": [
          "Field",
          "Allowed at a historical cutoff",
          "Hold or exclude when"
        ],
        "rows": [
          [
            "Ordered units",
            "Records available by that cutoff, using the frozen target definition",
            "A later correction is supplied as if it were known then"
          ],
          [
            "Promotion plan",
            "The schedule version approved by the cutoff",
            "The actual later discount replaces the old plan"
          ],
          [
            "Stock availability",
            "The contemporaneous record with gaps retained",
            "Unknown stock status is converted to an in-stock day"
          ],
          [
            "Product identity",
            "Stable SKU/channel mapping as it existed then",
            "Bundles or variant changes make units incomparable"
          ],
          [
            "Future inputs",
            "Calendar or other inputs demonstrably available by the cutoff",
            "Realized future sales or later decisions enter the forecast"
          ]
        ]
      }
    },
    {
      "id": "design",
      "title": "A small pilot with a final period left untouched",
      "paragraphs": [
        "[Forecasting: Principles and Practice](https://otexts.com/fpp3/toolbox.html#time-series-cross-validation) describes evaluation using successive forecast origins and only preceding observations. It also explains the seasonal naïve baseline, which repeats the corresponding prior season’s observation. We adapt those principles into the following proposed pilot; its size is an operational starting point, not a statistical-power calculation.",
        "Select ten established SKU-channel series before inspecting comparative scores. Record why they were chosen and all exclusions. Use four weekly development cutoffs and a seven-day horizon, followed by one later, untouched seven-day period. Require the history each method needs; missing baseline history makes a case unavailable, not zero.",
        "The worksheet specifies 40 development SKU-window comparisons and 280 planned daily targets, calculated as 10 × 4 and 10 × 4 × 7. The final period adds 10 comparisons and 70 targets. These are design counts, not observations. Resolve all settings on development periods before opening the final actuals; a failed final test requires a new future holdout.",
        "At every cutoff, make the baseline repeat the previous week’s corresponding weekday. Freeze the candidate version, point-forecast choice and any rounding or nonnegative constraint before scoring. Feed both methods the same permitted history and retain every attempted case, including timeouts and missing predictions."
      ]
    },
    {
      "id": "score",
      "title": "Separate error, coverage and operator work",
      "paragraphs": [
        "For each SKU, report mean absolute error in ordered units per day and mean signed error defined as forecast minus actual. Negative signed error therefore indicates underforecasting. Compare the methods on identical eligible dates, then show each SKU’s paired difference rather than letting a large-volume product hide poor results elsewhere.",
        "Publish planned, reconstructable, returned and scored target counts separately. A missing candidate prediction cannot disappear from the operational completion denominator. If paired accuracy excludes it, disclose that exclusion next to the score and keep the failed case in the completion report. Report stock-constrained and stock-status-unknown periods separately; observed orders alone cannot reveal how much demand went unfilled.",
        "Record execution spend and operator review minutes for all attempts. Leave a missing cost or time measurement blank. Do not describe a cheaper model call as a cheaper workflow when retries or corrections remain unmeasured."
      ]
    },
    {
      "id": "decision",
      "title": "A forecast win is only permission to test the decision",
      "paragraphs": [
        "Before opening the holdout, the owner should write an acceptable error improvement, an underforecast limit, a completion requirement and a review-time budget in the ledger. The blank worksheet deliberately supplies no universal pass percentage. The thresholds should reflect the operator’s stockout and overstock costs, rather than a number selected after seeing which model wins.",
        "If the forecasting gate passes, compare replenishment proposals in shadow mode under the same lead-time, order-quantity, stock-on-hand and budget assumptions. Log when those assumptions were known. An accurate daily forecast can still recommend an unsuitable purchase when the supplier lead time or pack size is wrong.",
        "Keep purchase orders subject to the existing operator approval process. Use the [profit calculator](/tools) to inspect unit economics, with its displayed assumptions, alongside the trial record. A forecast score does not replace landed costs, carrying costs or actual order receipts.",
        "The practical next step is a data-readiness review: can the business reconstruct historical inputs and a consistent target? If not, start collecting versioned records prospectively. That is a concrete AI implementation project without pretending that an untested model has already improved operations."
      ]
    },
    {
      "id": "methods",
      "title": "Scope, limitations and reuse",
      "paragraphs": [
        "This protocol was developed from MarketplaceBeta’s internal research handoff cut off at November 16, 2026, 12:58:27 UTC, then checked against the linked primary model announcement and the forecasting authors’ methods chapter on November 16. The methods chapter is undated here; retrieval is not its publication date. Source claims and our proposed design are separated in the downloadable ledger.",
        "No merchant order history, model output, benchmark reproduction, revenue or qualified-inquiry measurement is included. Ten selected series and a short holdout would not establish general superiority or seasonal robustness. We make no software-license or deployment-compatibility claim; verify the chosen model’s current terms and requirements before running it.",
        "Cite MarketplaceBeta Research, this title, November 16, 2026 and this article’s canonical URL. The original blank ledger and pilot design may be reused with attribution; retain the unexecuted-protocol label and cite the original sources for their methods and model descriptions. Third-party material retains its own terms."
      ]
    }
  ],
  "sources": [
    {
      "label": "Mistral: Introducing Timestral",
      "href": "https://mistral.ai/news/timestral/",
      "context": "Published October 15, 2026; read November 16. Vendor description of forecasting inputs, not merchant performance evidence."
    },
    {
      "label": "Hyndman and Athanasopoulos: The forecaster’s toolbox",
      "href": "https://otexts.com/fpp3/toolbox.html",
      "context": "Sections on seasonal naïve forecasts and time-series cross-validation; read November 16, 2026; publication date not assigned."
    },
    {
      "label": "Original cutoff ledger and pilot specification",
      "href": "/research/forecast-cutoff-ledger-2026-11-16.json",
      "context": "Blank, public-safe proposed workflow. No seller records or trial results."
    }
  ]
},
{
  "slug": "ai-research-headline-origin-audit",
  "seoTitle": "Audit AI Market Signals Beyond the Headline Count",
  "metaDescription": "Our advertising trend check passed, yet 24 of 26 matches came through one aggregator. A reproducible source audit for ecommerce AI research.",
  "headline": "Why our AI research desk held a passing trend check",
  "dek": "Advertising matches rose in our news archive, even after equal weighting by domain. Inspecting the source breakdown changed the decision: most matches arrived through one aggregator. Here is the audit and a reusable review worksheet.",
  "publishedOn": "2026-11-18",
  "updatedOn": "2026-11-18",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "7 min",
  "tags": [
    "AI agents",
    "original research",
    "research methods",
    "ecommerce strategy"
  ],
  "takeaway": "Before an AI research agent turns more headlines into a strategy recommendation, inspect originating publishers and repeated reporting. Equal weighting by URL domain does not establish independent evidence.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "finding",
      "title": "A candidate passed the arithmetic and failed the editorial review",
      "paragraphs": [
        "Our [dated archive audit](/research/headline-origin-audit-2026-11-18.json) found 26 advertising-related headlines among 392 eligible records in the recent matched-source window, compared with 6 among 337 in the preceding window. The shares were 6.6% and 1.8%. Our existing screening code marked the comparison as a candidate for source review.",
        "The source breakdown supplied the reason to stop: 24 of those 26 recent matches had news.google.com as their stored URL domain, according to the same [evidence file](/research/headline-origin-audit-2026-11-18.json). That is 92.3% of the recent advertising matches, not 92.3% of all news or of the advertising market.",
        "The useful finding is about our research process. A domain-balanced calculation can pass while leaving the independence of its evidence unresolved. We held the directional advertising claim and retained the audit. Nothing in these counts establishes a change in ad spending, agent adoption, seller demand or return on advertising.",
        "This extends our [earlier headline-methods report](/intelligence/analysis/ai-commerce-headlines-are-not-adoption-data): the earlier AI comparison failed a thin-sample gate. Here, a different topic passed the declared numerical gates, and source inspection still changed the publication decision."
      ]
    },
    {
      "id": "sample",
      "title": "The sample and its boundaries",
      "paragraphs": [
        "The [complete export](/research/headline-origin-audit-2026-11-18.json) covered 857 stored records published from October 21 through November 17, 2026 UTC. Existing relevance rules excluded 87 records and deduplication removed 7, leaving 763 eligible records. Nine domains meeting the same minimum coverage rule in both periods supplied 729 matched records, or 95.5% of eligible records.",
        "The earlier window is October 21–November 3; the later window is November 4–17. Both are fourteen-day windows ending at midnight UTC, with the ending boundary excluded. We retrieved the snapshot on November 18. Retrieval is not the publication date or an observation of merchant behavior.",
        "The unit is an eligible, deduplicated headline. The code retains stored relevant=true records with a finite relevance score of at least 40 and applies the existing operator filter. Duplicate groups connect shared IDs, normalized headlines and canonicalized URLs. Exact matching does not identify every paraphrase or publisher-suffixed copy.",
        "No rows were reclassified to produce this result. The method and topic dictionary stayed unchanged. We read the candidate headlines to judge whether a publishable argument survived their context."
      ]
    },
    {
      "id": "counts",
      "title": "Where the apparent increase sits",
      "paragraphs": [
        "All counts in this table come from the [aggregate evidence](/research/headline-origin-audit-2026-11-18.json). The denominator is every eligible headline in each displayed group, not just advertising matches. The remaining domains are combined here for readability; the download preserves all nine individual domain rows."
      ],
      "table": {
        "caption": "Advertising-rule matches / eligible headlines · publication windows in UTC · MarketplaceBeta archive, retrieved November 18, 2026",
        "headings": [
          "Stored URL domains",
          "Oct 21–Nov 3",
          "Nov 4–17",
          "Earlier → later share"
        ],
        "rows": [
          [
            "All nine matched domains",
            "6 / 337",
            "26 / 392",
            "1.8% → 6.6%"
          ],
          [
            "news.google.com",
            "3 / 27",
            "24 / 43",
            "11.1% → 55.8%"
          ],
          [
            "Other eight matched domains",
            "3 / 310",
            "2 / 349",
            "1.0% → 0.6%"
          ]
        ]
      }
    },
    {
      "id": "origin",
      "title": "A URL domain is not necessarily an originating publisher",
      "paragraphs": [
        "The calculator groups by the stored URL hostname. That is reproducible, but a news-aggregator URL does not identify which newsroom produced the reporting. A list of different destination publications can also carry the same original reporting. These are separate problems: source identification and story duplication.",
        "Within the recent advertising matches, headline inspection found several close variants of a story about AI shopping agents and the advertising businesses of Amazon and Walmart. We did not complete an origin audit for every record, so we do not report a deduplicated story count or label every aggregator match a duplicate.",
        "We checked the November 4 [Reuters report as republished by Investing.com](https://www.investing.com/news/stock-market-news/analysisai-shopping-agents-could-threaten-amazon-and-walmarts-ad-business-4999246), which identifies Reuters and its authors. The original Reuters URL was unavailable to this reader on November 18. This check establishes an identifiable reporting origin for that story; it does not establish the origin of every related headline. We make no new factual claim about the retailers from that report.",
        "Equal weighting by domain addresses unequal domain output. It does not resolve the number of independent sources inside an aggregator domain, nor collapse shared reporting appearing across other domains. Calling a result source-balanced should describe the weighting operation, not imply that every source is independent."
      ]
    },
    {
      "id": "sensitivity",
      "title": "A diagnostic changes the sign, not our knowledge of the market",
      "paragraphs": [
        "In the unchanged calculation, the pooled advertising share rose by 4.85 percentage points and the equally weighted mean domain change rose by 4.72 points, according to the [evidence](/research/headline-origin-audit-2026-11-18.json). Both directions agree; that is why the routine did not hold this topic automatically.",
        "As a post hoc diagnostic, we excluded news.google.com from both windows and recomputed the same fractions over the other eight matched domains. The pooled change became −0.39 percentage points and the equally weighted change −0.28 points. Only 3 earlier and 2 later matches remained; both counts are below the original five-match minimum.",
        "This is not a corrected estimate of the industry and does not demonstrate a decline in advertising interest. We selected the exclusion after seeing the concentration. Its purpose is to show that the proposed direction depends on this source group. The full calculation remains visible beside the diagnostic.",
        "We did not alter the production calculator, silently discard inconvenient articles or choose a replacement trend. The editorial outcome is a hold on the market-direction claim. A better subsequent analysis would resolve originating publishers and shared stories under a declared rule, then rerun the comparison on that dated evidence."
      ]
    },
    {
      "id": "workflow",
      "title": "Give a research agent an origin check before it recommends action",
      "paragraphs": [
        "The downloadable [review worksheet](/research/headline-origin-audit-2026-11-18.json) turns this case into an operator workflow. These are proposed review steps, not a measured claim that the workflow saves time or improves revenue.",
        "Start by naming the decision. A merchant deciding whether to change ad budgets needs performance and attribution evidence from its own accounts. News can identify a question worth testing; it cannot replace the decision's outcome measure.",
        "Preserve the original candidate and attach its audit. Resolve the publisher behind an aggregator link, retain the original report URL where available, and group copies or close paraphrases by shared reporting. Keep uncertain relationships unresolved rather than letting the agent invent a confident cluster.",
        "Review the resulting groups before computing another direction. Several publications quoting one announcement are useful distribution evidence; they are not several independent observations that the announced feature works. If a classification rule changes, version it and apply it to both windows.",
        "Use the [MarketplaceBeta Intelligence dashboard](/intelligence) to inspect source-linked news. For an AI research or reporting implementation, bring a sanitized sample, the decisions the report must support and examples of false alarms. Those inputs define a concrete evaluation scope without promising a commercial outcome."
      ],
      "table": {
        "caption": "Proposed review record · blank until applied to an operator's own workflow",
        "headings": [
          "Keep this field",
          "Why it matters",
          "When to hold"
        ],
        "rows": [
          [
            "Original URL, publisher and story family",
            "Separates distribution from reporting origin",
            "The same claim's independence is unresolved"
          ],
          [
            "Hits, denominator and publication window",
            "Preserves what the fraction actually measures",
            "The report substitutes adoption or sales for mentions"
          ],
          [
            "Original result plus labeled sensitivity check",
            "Shows dependence without hiding the first result",
            "Direction changes or remaining support is too thin"
          ],
          [
            "Business decision and required outcome evidence",
            "Connects research to a practical next step",
            "A budget recommendation rests on headline counts alone"
          ]
        ]
      }
    },
    {
      "id": "methods",
      "title": "Methods, limitations and reuse",
      "paragraphs": [
        "Method: marketplacebeta-headline-coverage-v1, executed without modification; review: aggregator-sensitivity-review-v1. The [versioned calculator](https://github.com/rydak81/margin-intel-hub/blob/927da15f66cf8580b4383544e1baf5a4cce2ad3d/lib/research-desk.ts) and [dated aggregate output and worksheet](/research/headline-origin-audit-2026-11-18.json) allow readers to reproduce the displayed arithmetic. The private raw export is retained separately; the public file contains no article bodies, raw headline archive, customer data or credentials.",
        "The original screening requires at least five eligible headlines per domain per window, three matched domains, twenty matched articles per window, seventy percent retention, recent eligible coverage and five topic matches per period. These are editorial screening rules, not statistical-power guarantees. A candidate is an invitation to inspect sources.",
        "The snapshot is complete for the specified database query, not for all ecommerce news. Stored relevance decisions, collection coverage and publication metadata may be imperfect. The narrow dictionary can miss synonyms and match words in an unintended sense. Topics can overlap. Unknown originating publishers remain unknown; no full story-clustering result is claimed.",
        "Privacy and source-rights review limited the public evidence to our aggregate calculations, method and original worksheet. Source pages are linked rather than republished. The Reuters attribution check was read November 18, 2026; its displayed publication date is November 4. No external performance claims, merchant outcomes, significance tests, forecasts or causal conclusions are included.",
        "Suggested citation: MarketplaceBeta Research, “Why our AI research desk held a passing trend check,” November 18, 2026, with this canonical article URL and its evidence link. Reuse the aggregate counts with both windows, the headline unit and the diagnostic label. Do not reuse the sensitivity result as an industry trend."
      ]
    }
  ],
  "sources": [
    {
      "label": "Dated headline-origin audit and review worksheet",
      "href": "/research/headline-origin-audit-2026-11-18.json",
      "context": "Own aggregate calculations for publication windows October 21–November 3 and November 4–17, 2026 UTC; complete database read on November 18."
    },
    {
      "label": "Versioned MarketplaceBeta research calculator",
      "href": "https://github.com/rydak81/margin-intel-hub/blob/927da15f66cf8580b4383544e1baf5a4cce2ad3d/lib/research-desk.ts",
      "context": "Unmodified screening implementation; source balance uses stored URL domains."
    },
    {
      "label": "Reuters reporting republished by Investing.com",
      "href": "https://www.investing.com/news/stock-market-news/analysisai-shopping-agents-could-threaten-amazon-and-walmarts-ad-business-4999246",
      "context": "Published November 4; read November 18. Used only to verify the displayed reporting origin, not to infer merchant performance."
    }
  ]
}
]
