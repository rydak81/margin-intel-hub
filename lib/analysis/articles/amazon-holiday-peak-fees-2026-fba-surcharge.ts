import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "amazon-holiday-peak-fees-2026-fba-surcharge",
  "seoTitle": "Amazon Peak Fees: Audit Three Cost Clocks",
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
} satisfies AnalysisArticle
