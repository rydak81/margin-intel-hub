import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "ecommerce-ai-forecast-backtest-cutoff-ledger",
  "seoTitle": "AI Sales Forecast: Test Before It Orders",
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
} satisfies AnalysisArticle
