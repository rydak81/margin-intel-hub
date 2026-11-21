import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
    "slug": "ebay-per-order-fee-2026-under-10",
    "seoTitle": "eBay Per-Order Fee 2026: $0.30 Under $10",
    "metaDescription": "eBay's 2026 per-order fee is $0.30 through $10 and $0.40 above. Worked Most Categories examples at $10, $10.01 and $50.",
    "headline": "eBay's per-order fee in 2026: $0.30 through $10, $0.40 above — and the $10.01 cliff costs a dime",
    "dek": "eBay still adds a fixed per-order fee on top of the category final value percentage. Orders totaling $10.00 or less pay $0.30; orders over $10.00 pay $0.40. We re-read eBay's selling fees page on November 6, 2026, worked Most Categories examples at $10, $10.01 and $50, and mapped when that fixed fee comes back on a refund.",
    "publishedOn": "2026-11-06",
    "updatedOn": "2026-11-06",
    "author": "MarketplaceBeta Intelligence",
    "reviewMode": "automated",
    "readTime": "6 min",
    "tags": [
      "eBay",
      "per-order fee",
      "final value fee",
      "seller fees",
      "low-price items",
      "Q4 2026"
    ],
    "takeaway": "Price every low-ticket eBay SKU with the fixed per-order fee in the sheet, not just the 13.6% Most Categories rate. At $10 the fee is $0.30; at $10.01 it jumps to $0.40. On a hypothetical one-item Most Categories sale with no shipping or tax, that is $1.66 total fees at $10 versus $1.76 at $10.01 — ten cents more for a one-cent price move. Bundle multi-item carts into one checkout when you can: eBay charges the per-order fee once per order, not once per line. And on returns, check the reason code before you assume the $0.30 or $0.40 comes back.",
    "forecastIds": [],
    "newsletterSource": "campaign_kw_ebay_per_order",
    "sections": [
      {
        "id": "answer",
        "title": "The short answer",
        "paragraphs": [
          "eBay's final value fee is a category percentage plus a fixed per-order fee. eBay's selling fees page (re-read November 6, 2026) says: for orders $10.00 or less the per-order fee is $0.30; for orders over $10.00 it is $0.40. That matches our [eBay fee table](/fees/ebay) and the October 16 correction on our [fee change log](/fees/changelog).",
          "The percentage depends on category. Most Categories is 13.6% on the first $7,500 of the total amount of the sale per item, then 2.35% on the excess, per the same eBay page and our [Most Categories calculator](/fees/ebay/most-categories). The total amount of the sale includes item price, handling, shipping collected from the buyer (with listed exceptions), sales tax and other applicable fees. An order is any number of items one buyer checks out with the same shipping method.",
          "The fixed fee matters most under about $25. On a hypothetical $10 Most Categories sale with no buyer shipping and no tax, eBay takes $1.36 (13.6%) plus $0.30, or $1.66 total — 16.6% of the sale. Cross $10.01 and the same math is $1.36 plus $0.40, or $1.76. That one-cent price move costs a full dime in the fixed fee. Our [$10 sale page](/fees/ebay/on-a-10-sale) shows the same $1.66 Most Categories total."
        ],
        "table": {
          "caption": "Hypothetical: Most Categories, one item per order, $0 buyer shipping, $0 collected tax · Sources: eBay selling fees page (re-read Nov 6, 2026); MarketplaceBeta /fees/ebay (verified Oct 16, 2026)",
          "headings": [
            "Sale price",
            "Final value % (Most Categories)",
            "Per-order fee",
            "Total eBay fees",
            "Effective take rate"
          ],
          "rows": [
            [
              "$10.00",
              "$1.36 (13.6%)",
              "$0.30",
              "$1.66",
              "16.6%"
            ],
            [
              "$10.01",
              "$1.36 (13.6%)",
              "$0.40",
              "$1.76",
              "17.6%"
            ],
            [
              "$50.00",
              "$6.80 (13.6%)",
              "$0.40",
              "$7.20",
              "14.4%"
            ]
          ]
        }
      },
      {
        "id": "what-changed",
        "title": "What changed: our tables, not eBay's rule",
        "paragraphs": [
          "eBay's $0.30 / $0.40 split is not a November 2026 change. eBay's Winter 2024 seller update said that from March 15, 2024 the per-order fee on orders over $10 rose from $0.30 to $0.40, while orders $10 and under stayed at $0.30. The rule on today's selling fees page is the same wording we re-read November 6, 2026.",
          "What changed for operators reading MarketplaceBeta is our correction. On October 16, 2026 our [fee change log](/fees/changelog) replaced a flat \"$0.40 per order\" model with \"$0.30 per order through $10; $0.40 above,\" and aligned Most Categories and other standard-rate categories to the first-$7,500 / 2.35% structure. If a sheet, script or listing tool still assumes a flat $0.40 on every order, it overstates fees on every sale at $10 or less by a dime and mis-models the low-price band.",
          "Insertion fees, Promoted Listings, international fees, Store subscription rates and Below Standard surcharges are separate. This piece is only about the per-order fixed amount that sits on top of the category percentage for basic non-Store domestic sales."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters on low-price and multi-item orders",
        "paragraphs": [
          "A fixed fee is a bigger share of a small ticket. At $10, the $0.30 alone is 3.0% of the sale; stacked on 13.6% it pushes the effective take to 16.6% before product cost, postage, ads or returns. At $50 the same $0.40 is 0.8% of the sale and the effective take falls to 14.4%. That is why a \"13.6%\" mental model understates what eBay keeps on dollar-store and accessory SKUs.",
          "The $10.01 cliff is a pricing trap. Raising a $9.99 listing to $10.01 to clear a round number or to cover a shipping bump moves the order into the $0.40 band. On the hypothetical Most Categories row above, fees rise from $1.66 at $10.00 to $1.76 at $10.01 while the percentage line barely moves. If you need the extra cent of price, fine — just put the extra dime of fee in the margin sheet first.",
          "Multi-item checkout cuts the fixed fee. eBay defines an order as items one buyer purchases at checkout with the same shipping method, and charges one per-order fee for that order. Two separate $8 checkouts pay $0.30 twice ($0.60). One combined $16 checkout pays $0.40 once. Combined shipping and volume offers are not just buyer convenience; they change the fixed-fee line.",
          "Refunds do not always return the fixed fee. eBay's fee credits page credits the per-order amount on some cancellations and buyer-preference full refunds, and keeps it on others — including out-of-stock cancellations and many not-as-described, damaged, defective or item-not-received refunds. That is the same reason our [holiday returns piece](/intelligence/analysis/holiday-returns-2026-amazon-walmart-etsy-ebay) flags late delivery on eBay: a not-as-described return can leave you paying return shipping and still owing the per-order fee. Read the reason code before you forecast a full fee credit.",
          "Channel context sits on the [Intelligence hub](/intelligence), the [forecast scorecard](/intelligence/forecasts) and the [Intelligence Dossier](/intelligence/dossier). No open forecast on that scorecard is an eBay per-order-fee call; we are not stretching F5 or F2 to cover this rule."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "Each of these is a change you can make on this week's listings and margin sheets."
        ],
        "bullets": [
          "Open every active eBay SKU priced at $15 or under and replace any flat \"$0.40 always\" assumption with $0.30 through $10 and $0.40 above. Confirm the result against our [eBay fee table](/fees/ebay) and the [$10 sale page](/fees/ebay/on-a-10-sale).",
          "For each of those SKUs, write the total fee at the list price and at list price plus typical buyer shipping and tax, because eBay assesses the percentage — and which per-order band you land in — on the total amount of the sale, not item price alone.",
          "If you sell accessories or multi-packs, turn on combined shipping or a volume offer so one buyer checkout pays one per-order fee. Model two solo checkouts versus one combined checkout before you decide the offer is \"just UX.\"",
          "On your returns SOP, add a one-line check: does this reason credit the per-order fee? Use eBay's fee credits table, not last month's settlement average.",
          "Re-price any SKU sitting at $10.01–$10.50 solely to look \"over $10.\" Either drop to $10.00 and keep the $0.30 band, or raise enough that the extra $0.10 of fee is covered by contribution margin.",
          "Log any eBay fee notice you see against the [fee change log](/fees/changelog). Compare your category row on [Most Categories](/fees/ebay/most-categories) before you trust a third-party calculator that still shows a flat $0.40."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Any eBay seller update that moves the $10 threshold or the $0.30 / $0.40 amounts. The current split has held since the March 15, 2024 change; a winter or spring update that lifts the under-$10 band would hit the same low-price catalogs this piece is written for. We will re-check eBay's selling fees page when eBay posts a fees update and append the [fee change log](/fees/changelog) if the numbers move.",
          "Store vs non-Store schedules and Below Standard surcharges, which sit outside this basic-fee model. Operators on a Store subscription should use eBay's Store fee tables, not the basic Most Categories row alone.",
          "Amazon's expected December–January 2027 US fee notice (forecast F5 on our [forecast scorecard](/intelligence/forecasts)) as the other side of any Amazon-vs-eBay fee comparison — not as a prediction about eBay. Broader fee and channel moves stay on the [Intelligence hub](/intelligence) and in the [Intelligence Dossier](/intelligence/dossier)."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of November 6, 2026, from eBay's public selling fees and fee credits pages and our [eBay fee table](/fees/ebay)."
        ],
        "bullets": [
          "What is eBay's per-order fee in 2026? $0.30 on orders totaling $10.00 or less, and $0.40 on orders over $10.00, on top of the category final value percentage.",
          "Is the fee charged per item or per order? Per order. eBay defines an order as any number of items purchased by the same buyer at checkout with the same shipping method.",
          "What does eBay take on a $10 Most Categories sale? On a hypothetical one-item sale with no buyer shipping and no tax: $1.36 final value fee plus $0.30 per-order fee = $1.66 (16.6%). That matches our [/fees/ebay/on-a-10-sale](/fees/ebay/on-a-10-sale) Most Categories row.",
          "What about $10.01? Same assumptions: about $1.36 plus $0.40 = $1.76. Crossing $10.00 costs an extra $0.10 in the fixed fee.",
          "What about $50? Same assumptions: $6.80 plus $0.40 = $7.20 (14.4%).",
          "Does shipping or tax change the band? Yes. eBay calculates the percentage — and which per-order band applies — on the total amount of the sale, which includes shipping collected from the buyer (with listed exceptions) and sales tax. A $9.50 item with $1.00 collected shipping is a $10.50 order and pays $0.40.",
          "Do I get the per-order fee back on a refund? Sometimes. eBay's fee credits page credits it on some buyer-request cancellations and some buyer-preference full refunds, and does not credit it on out-of-stock cancellations or on many damaged, defective, wrong-item, not-as-described or item-not-received refunds. Credits for the per-order amount can take up to 10 days to show.",
          "When did the $0.40-over-$10 rule start? March 15, 2024, per eBay's Winter 2024 fees update. Orders $10 and under stayed at $0.30.",
          "Where are the category percentage tables? On our [eBay fees hub](/fees/ebay), the [Most Categories page](/fees/ebay/most-categories) and eBay's own selling fees page linked in Sources."
        ]
      },
      {
        "id": "methods",
        "title": "How this was made",
        "paragraphs": [
          "We re-fetched eBay's US selling fees help page and its fee credits help page on November 6, 2026, and compared them to our [eBay fee table](/fees/ebay) (verified October 16, 2026) and the October 16 entries on our [fee change log](/fees/changelog). The $0.30 / $0.40 wording, the Most Categories 13.6% / 2.35% structure, the definition of an order and the fee-credit situations match. Worked dollars at $10, $10.01 and $50 are our arithmetic from those rates (one item, $0 buyer shipping, $0 tax, rounded to the cent). They are hypothetical illustrations, not measured seller settlements. The March 15, 2024 start of the $0.40-over-$10 band comes from eBay's Winter 2024 fees and financials seller update.",
          "Prepared through an automated research and editorial process with evidence checks. No individual human review of this revision is claimed. Suggested citation: MarketplaceBeta Intelligence, \"eBay's per-order fee in 2026: $0.30 through $10, $0.40 above — and the $10.01 cliff costs a dime,\" November 6, 2026, with the canonical article URL and a link to /fees/ebay. Attribute fee rules to eBay and re-check your own Seller Hub invoice before you reprice a catalog."
        ]
      }
    ],
    "sources": [
      {
        "label": "eBay Help: Selling fees (re-read Nov 6, 2026)",
        "href": "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
        "context": "Final value fee = category percentage of the total amount of the sale plus a per-order fee; $0.30 for orders $10.00 or less; $0.40 for orders over $10.00; total amount includes item price, handling, shipping collected (with exceptions), sales tax; order = items purchased by the same buyer at checkout with the same shipping method; Most Categories 13.6% to $7,500 then 2.35%."
      },
      {
        "label": "eBay Help: Fee credits (re-read Nov 6, 2026)",
        "href": "https://www.ebay.com/help/selling/fees-credits-invoices/fee-credits?id=4128",
        "context": "When the per-order fixed amount is credited (buyer-request / address-issue cancellations; some buyer-preference full refunds and Send refund flow) and when it is not (out-of-stock or damaged cancellations; damaged, defective, wrong item, not as described, item not received refunds; partial refunds). Per-order credits can take up to 10 days."
      },
      {
        "label": "eBay Seller Center: Fees & financials, Winter 2024 update",
        "href": "https://www.ebay.com/sellercenter/resources/seller-updates/2024-winter/financials",
        "context": "From March 15, 2024, per-order fee on orders over $10 increased from $0.30 to $0.40; orders $10 and under stayed at $0.30."
      },
      {
        "label": "eBay Seller Center: Seller fees overview",
        "href": "https://www.ebay.com/sellercenter/selling/start-selling-on-ebay/seller-fees",
        "context": "Restates the $0.30 / $0.40 per-order split and category percentage ranges for basic fees."
      },
      {
        "label": "MarketplaceBeta: eBay fees by category (verified Oct 16, 2026)",
        "href": "/fees/ebay",
        "context": "Per-order fee modeled as $0.30 through $10 and $0.40 above; Most Categories 13.6%; source linked to eBay selling fees page."
      },
      {
        "label": "MarketplaceBeta: eBay Most Categories fee calculator",
        "href": "/fees/ebay/most-categories",
        "context": "13.6% on the first $7,500 per item, then 2.35%, plus the per-order fee."
      },
      {
        "label": "MarketplaceBeta: What eBay takes on a $10 sale",
        "href": "/fees/ebay/on-a-10-sale",
        "context": "Most Categories total $1.66 on a $10 sale under the same no-shipping, no-tax assumptions used in this piece."
      },
      {
        "label": "MarketplaceBeta: Fee change log (Oct 16, 2026 correction)",
        "href": "/fees/changelog",
        "context": "Corrected eBay per-order fee from a flat $0.40 model to $0.30 through $10 / $0.40 above, and aligned standard-rate categories to the $7,500 / 2.35% structure."
      },
      {
        "label": "MarketplaceBeta: Holiday returns 2026 (Nov 3, 2026)",
        "href": "/intelligence/analysis/holiday-returns-2026-amazon-walmart-etsy-ebay",
        "context": "eBay return windows and the not-as-described / late-arrival path that can leave the seller paying return shipping without a per-order fee credit."
      },
      {
        "label": "MarketplaceBeta forecast scorecard",
        "href": "/intelligence/forecasts",
        "context": "No open forecast is an eBay per-order-fee call; F5 referenced only as Amazon's expected 2027 fee notice for cross-channel context."
      },
      {
        "label": "MarketplaceBeta Intelligence hub",
        "href": "/intelligence",
        "context": "Operator analysis index and related Q4 coverage."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier",
        "href": "/intelligence/dossier",
        "context": "Broader marketplace fee and channel context."
      }
    ]
  } satisfies AnalysisArticle
