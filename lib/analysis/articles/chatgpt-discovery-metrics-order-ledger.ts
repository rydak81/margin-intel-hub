import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
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
} satisfies AnalysisArticle
