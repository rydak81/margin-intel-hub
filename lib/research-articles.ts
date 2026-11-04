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
}
]
