import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
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
} satisfies AnalysisArticle
