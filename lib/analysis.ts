Warning: truncated output (original token count: 76004)
Total output lines: 2931

/**
 * Original operator analysis, published at /intelligence/analysis/[slug].
 *
 * One entry per piece, newest first. Rules for every entry (enforced by review and
 * lib/analysis.test.ts):
 * - Every figure is attributed in the same sentence to our own page or a linked public
 *   source listed in `sources`. Worked examples are labeled hypothetical.
 * - Forecasts are referenced by id and rendered from lib/forecasts.ts as dated calls with
 *   hit/miss status. Never add probabilities or odds.
 * - The Marketplace Pressure Index is named in full and its values are not published here.
 * - Inline links use [text](href); internal hrefs start with "/".
 */

import { RESEARCH_ARTICLES } from '@/lib/research-articles'

export interface AnalysisSection {
  id: string
  title: string
  /** Plain text with optional [label](href) links. */
  paragraphs: string[]
  bullets?: string[]
  table?: { caption: string; headings: string[]; rows: string[][] }
}

export interface AnalysisArticle {
  slug: string
  /** <title> and og:title, under 60 characters. */
  seoTitle: string
  /** Meta description, under 155 characters. */
  metaDescription: string
  headline: string
  dek: string
  /** ISO date, YYYY-MM-DD. */
  publishedOn: string
  updatedOn: string
  author: string
  /** Explicitly distinguish automated publication from an individual human review. */
  reviewMode?: 'automated'
  readTime: string
  tags: string[]
  /** The one decision this piece is about, shown in a callout above the body. */
  takeaway: string
  /** Forecast ids from lib/forecasts.ts that this piece tracks. */
  forecastIds: string[]
  /** Allowlisted newsletter attribution key (see lib/newsletter-source.ts). */
  newsletterSource: `campaign_${string}`
  sections: AnalysisSection[]
  sources: { label: string; href: string; context: string }[]
}

export const ANALYSIS_ARTICLES: AnalysisArticle[] = [
  {
    "slug": "holiday-returns-2026-amazon-walmart-etsy-ebay",
    "seoTitle": "2026 Holiday Returns: Amazon, Walmart, eBay, Etsy Fees",
    "metaDescription": "Amazon and Walmart take holiday returns to Jan 31, 2027; eBay and Etsy leave it to you. Who pays return shipping and which fees come back.",
    "headline": "Holiday returns 2026: your December sales stay open until January 31, and the fees don't all come back",
    "dek": "Amazon and Walmart have both published 2026 holiday return windows that run to January 31, 2027. eBay and Etsy have not, so your own policy is the window. The window is only half the cost. Who pays return shipping, what a refund leaves you paying in fees and what you are allowed to deduct differ on every marketplace. Here is each one from its own pages, read November 3, 2026, and what to set this week.",
    "publishedOn": "2026-11-03",
    "updatedOn": "2026-11-03",
    "author": "MarketplaceBeta Intelligence",
    "reviewMode": "automated",
    "readTime": "8 min",
    "tags": [
      "holiday returns",
      "return policy",
      "returns processing fee",
      "refunds",
      "Amazon",
      "Walmart",
      "eBay",
      "Etsy",
      "Q4 2026"
    ],
    "takeaway": "Count every Amazon order from November 1 and every Walmart order from October 1 as open until January 31, 2027, and keep your returns desk staffed until then. Before Cyber Week, set the levers each marketplace gives you: Keep It rules on Walmart and returnless refunds on Amazon for low-value items where the return label costs more than the item is worth, a deliberate 30- or 60-day choice on eBay, and a written return policy on every Etsy listing. Above all, ship on time. On eBay, a package that arrives after its estimated delivery date is treated as not as described, so you pay the return shipping and keep paying the per-order fee.",
    "forecastIds": [
      "F5"
    ],
    "newsletterSource": "campaign_kw_holiday_returns_2026",
    "sections": [
      {
        "id": "answer",
        "title": "The short answer",
        "paragraphs": [
          "Amazon: most items bought November 1 to December 31, 2026 can be returned through January 31, 2027. Apple-branded products bought in the same period must be back by January 15, 2027. That is from Amazon's customer return policy page, read November 3, 2026. Amazon's seller announcement says the window applies automatically to FBA and seller-fulfilled orders, that no action is needed, and that \"this policy will apply every year.\"",
          "Walmart: most items bought October 1 to December 31, 2026 can be returned through January 31, 2027, per Walmart's August 31, 2026 release note and its seller returns policy (last updated August 31, 2026). Exceptions include wireless phones, protection plans, major appliances, Dyson products, food and beverages, and select seasonal and luxury goods. Walmart's window is already running.",
          "eBay and Etsy: neither has published a 2026 holiday return window. On eBay you choose no returns, 30 days or 60 days, buyer-paid or free (14 days in a few categories), and eBay's developer documentation says \"eBay no longer supports holiday returns.\" On Etsy each listing carries a return policy you set. We did not find a holiday extension on either marketplace's help pages, and we are not carrying a past year's program forward as a 2026 one.",
          "The money differs more than the dates do. The table compares the four from each marketplace's own pages. Where a figure comes only from a secondary source, the table says so."
        ],
        "table": {
          "caption": "2026 holiday returns by marketplace, US · Sources: Amazon Return Policy and Returns to Third-Party Sellers pages; Amazon Seller Central announcements; Walmart Marketplace Learn returns policy (updated Aug 31, 2026); eBay Setting up your return policy, Money Back Guarantee and Fee credits pages; Etsy Help return-policy and refund articles; all read Nov 3, 2026",
          "headings": [
            "Marketplace",
            "Holiday window (purchase dates)",
            "Final return-by date",
            "Who pays return shipping",
            "Fees on a refunded order",
            "Seller levers"
          ],
          "rows": [
            [
              "Amazon",
              "Nov 1 to Dec 31, 2026 (automatic, FBA and seller-fulfilled)",
              "Jan 31, 2027 (Apple-branded: Jan 15, 2027)",
              "Most items have at least one free return option for the buyer. On seller-fulfilled orders you must give a US return address, a prepaid label or a refund without the item",
              "Referral fee credited minus a refund administration fee: the lesser of $5.00 or 20% of the referral fee. FBA: returns processing fee on every apparel and shoe return, and above a category threshold elsewhere",
              "Seller-fulfilled: returnless refund; restocking fee only on used, damaged or out-of-policy returns (photo needed at 20% or more)"
            ],
            [
              "Walmart",
              "Oct 1 to Dec 31, 2026 (most items)",
              "Jan 31, 2027",
              "You. Sellers may not charge customers return shipping",
              "Not stated on Walmart's public pages; check the refund lines in your Payments Report",
              "Keep It and Partial Keep It rules; replacement rules; no restocking fees except on return-exempt items not in original condition (up to 20%)"
            ],
            [
              "eBay",
              "None published for 2026",
              "Your listing's window: 30 or 60 days (14 in some categories)",
              "Remorse returns: whoever your policy names. Not as described, including late arrival: you",
              "Remorse full refund: final value fee and the per-order fee credited. Not as described, item not received or partial refund: the per-order fee is kept",
              "30 or 60 days, buyer-paid or free; auto-accept and auto-refund rules; deduct loss in value on used or damaged returns"
            ],
            [
              "Etsy",
              "None published for 2026",
              "Your listing's policy (Etsy's simple template: 30 days from delivery)",
              "The buyer, by default",
              "Refund through Shop Manager: transaction and processing fees refunded; the listing fee is credited only if you also cancel",
              "Set returns, exchanges and the window per listing; buyer covers loss in value if the item isn't returned in original condition"
            ]
          ]
        }
      },
      {
        "id": "what-changed",
        "title": "What changed this year",
        "paragraphs": [
          "Amazon's dates are the same shape as before: November and December purchases, end of January. What is new is the wording. Amazon's Seller Central post, \"Extended return window for items bought in November and December 2026,\" says the policy \"will apply every year\" and that the change is \"part of our effort to strengthen customer traffic during the year-end shopping season.\" Value Added Resource reports that line as a change from Amazon's previous annual announcements. If it holds, the January tail is no longer a seasonal exception to plan around but a permanent part of selling on Amazon in Q4.",
          "Walmart starts a month earlier. Its holiday window covers purchases from October 1, so every Walmart order placed since then is already inside it. Walmart's standard rule, from the same returns policy, is a minimum 30-day window that starts seven days after the item's ship date, and a request made inside the window must be honored even if the return arrives after it closes.",
          "eBay and Etsy have not added anything. eBay's return options are the ones on its \"Setting up your return policy\" page, and its Business Policies API marks the old holiday-returns field as deprecated. Etsy's help pages describe per-listing policies and say each seller is responsible for their own refund, exchange and return policies."
        ]
      },
      {
        "id": "the-fees",
        "title": "What a return costs you in marketplace fees",
        "paragraphs": [
          "Amazon. Amazon's fee schedule credits you the referral fee on a refund minus a refund administration fee, the lesser of $5.00 or 20% of the referral fee. Amazon's fee-schedule page sits behind the Seller Central login, so we cite Amazon's wording as quoted by Amazon seller support and sellers in its public Seller Forums. Books, music, video and DVD items get all order-related fees back on a full refund. Secondary sources (MyProfit, Oct 22, 2026; SellerMagnet) add that the FBA fulfillment fee is not credited on a refund because the unit already shipped. For that fee at peak rates, use our [Amazon holiday peak fee page](/fees/amazon/holiday-peak-2026) rather than a number repeated here.",
          "Amazon's FBA returns processing fee works on cohorts. Amazon's own Seller Central post says it counts the units of a product shipped in a month, tracks returns of those units through that month and the next two, and charges only the returned units above the category threshold, billing after the three months close: June shipments are charged in September. Products shipping fewer than 25 units in a month are exempt that month, and New Selection products get their first 20 returned units above the threshold waived. Apparel and shoes are charged on every return, with no threshold. The category thresholds and the rate card are on a Seller Central page we could not open without a login. As reported by Feedvisor (updated Feb 19, 2026) and MyProfit, the Home and Kitchen threshold is 8.1% and the 2026 rate card starts at $1.78 for a small standard-size unit. Treat those two figures as secondary until you see them in your own Seller Central.",
          "Why the holiday window matters for that fee, by our reading of Amazon's rule: a November shipment's cohort runs November to January, and a December shipment's runs December to February. Every holiday return made by January 31 therefore lands inside the cohort of the month the unit shipped. On Amazon's billing pattern, the November cohort is charged in February and the December cohort in March, well after the sales were booked.",
          "Walmart. Walmart's public pages do not say whether the referral fee comes back when a customer is refunded. Its retailer agreement (revision 07/2024) says you reimburse Walmart for cash refunds it makes to customers. Its return-dispute guide (updated Feb 19, 2025) says approved disputes reimburse sale proceeds but not return shipping or referral fees. One secondary source, Retail Reason (updated Sep 6, 2026), says a full refund reverses the sale's commission in the Payments Report. Walmart's payments guide (updated Sep 24, 2026) lists a Transaction Type column that marks sales and refunds and a \"Commission from Sale\" column, so check that column on your own refund lines. Walmart also refunds the customer when the returned package is first scanned by the carrier, before you see the item.",
          "eBay. eBay's Fee credits page credits the variable final value fee on refunds. On a full refund for a remorse reason, such as \"changed my mind\" or \"doesn't fit\", it also credits the per-order fixed amount. On a not-as-described return, an item-not-received refund, a voluntary partial refund or an accepted payment dispute, the per-order amount is not credited. Partial refunds earn proportional credits.",
          "Etsy. Etsy's refund article says that if you refund through Shop Manager, your transaction and processing fees for the refunded transactions are refunded to your Payment account automatically, and listing fees are credited only if you also cancel. Refunds through Etsy Payments are possible for 180 days after payment. If you refund outside Etsy after that, Etsy can't refund your seller fees."
        ],
        "table": {
          "caption": "Hypothetical: marketplace fees on one $30 order, fully refunded · Rates from our fee tables (/fees/amazon, /fees/walmart, /fees/ebay, /fees/etsy, verified Oct 16, 2026); refund rules from each marketplace's pages read Nov 3, 2026. Excludes return shipping, outbound postage, fulfillment fees and the item itself.",
          "headings": [
            "Marketplace and case",
            "Fees charged on the sale",
            "Fees you still pay after a full refund"
          ],
          "rows": [
            [
              "Amazon, 15% category (e.g. Kitchen)",
              "$4.50 referral",
              "$0.90 refund administration fee (20% of $4.50), plus the FBA fee and any returns processing fee if FBA"
            ],
            [
              "Walmart, 15% category (e.g. Home & Garden)",
              "$4.50 referral",
              "Not published by Walmart: check the refund line's Commission from Sale"
            ],
            [
              "eBay, most categories, remorse return",
              "$4.08 final value fee (13.6%) + $0.40 per order",
              "$0.00 if you fully refund all items plus original shipping"
            ],
            [
              "eBay, not as described or late arrival",
              "$4.08 + $0.40",
              "$0.40 per-order fee, plus the return label you pay for"
            ],
            [
              "Etsy, US shop on Etsy Payments",
              "$1.95 transaction (6.5%) + $1.15 processing (3% + $0.25) + $0.20 listing",
              "$0.20 listing fee, credited only if you also cancel the order"
            ]
          ]
        },
        "bullets": [
          "The table assumes one item, no buyer-paid shipping and no sales tax. eBay and Etsy both charge on shipping you collect, and eBay also charges on collected tax, so real orders differ.",
          "Our hypothetical FBA cohort: 1,000 units of a Home and Kitchen product ship in December. At the reported 8.1% threshold the first 81 returns are free. If 120 come back by the end of February, 39 are charged. At the reported $3.39 rate for a 12 to 16 oz large standard-size unit, that is about $132, billed in March. Both rates are secondary, so check your own Return Insights numbers."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: January is where Q4 margin gets settled",
        "paragraphs": [
          "A November 1 Amazon order has 91 days to come back. A Walmart order from October 1 has 122. That is our arithmetic from the published dates, and it means the December revenue in your dashboard is provisional until February. On Amazon, the fee consequences of those returns arrive in February and March. On Walmart, the refund goes out at the first carrier scan, before you can inspect what comes back.",
          "The shipping cost lands on you on three of the four marketplaces. Walmart forbids return-shipping charges to customers outright. Amazon promises buyers a free return option on most items, and on seller-fulfilled orders you provide the address, the label or the returnless refund. On eBay, a not-as-described return is always on you, and eBay's Money Back Guarantee treats an item that \"arrived after the latest estimated delivery date\" as not matching the listing. Etsy's Purchase Protection covers late arrivals too: Etsy pays up to $250 of the refund and charges the rest to the seller, per its sellers' refunds article.",
          "That is the link to our [2026 holiday shipping cutoffs piece](/intelligence/analysis/holiday-shipping-cutoffs-2026-small-sellers). A ground order that misses Christmas is more than an upgrade you didn't charge for. On eBay it turns a buyer-paid remorse return into a seller-paid one, and you keep paying the $0.40 per-order fee.",
          "The [October Intelligence Dossier](/intelligence/dossier) argues that returns are an acquisition metric, not just an operations cost: buyers who arrive through accurate fit and condition content return less, and it puts the return policy among the structured product data shopping agents read. Hypothesis, not measured: for small sellers this season, a clear return policy and accurate delivery dates will cut January returns more than any change to the return window itself."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "Each of these is a setting you can change today, before the Cyber Week orders arrive."
        ],
        "bullets": [
          "Amazon FBA: open Return Insights on the FBA Returns page and list the ASINs near their category threshold. The November and December cohorts will absorb every holiday return through January 31. Fix the listing causes, such as size charts, dimensions and photos, now, while those cohorts are still small.",
          "Amazon seller-fulfilled: decide your returnless-refund ceiling. Below it, the return label and handling cost more than the item is worth. Don't plan on restocking fees: Amazon's refund-workflow rules allow none on in-policy returns in original condition, only on used, damaged, materially different or out-of-policy returns. A fee of 20% or more needs a photo, and you have two business days from receipt to refund.",
          "Walmart: your window opened October 1. Set Keep It rules by department and price limit for low-value items, and Partial Keep It rules for return reasons where a partial refund beats a round trip. Make sure your return center is a valid US address that isn't a P.O. box. Then reconcile refund lines in the Payments Report, including the Commission from Sale column.",
          "eBay: make the 30- or 60-day choice deliberately. A 60-day policy covers November gifts through January but brings in more late returns, and some of those come back after the selling season. If you only want it on giftable items, create a second return policy and apply it to those listings. Set auto-refund rules for items too cheap to ship back.",
          "Etsy: every physical listing outside the EU needs a return policy, even \"no returns\", or Etsy may show it lower in search. Post your holiday terms in your listings and shop announcement, and refund through Shop Manager within 180 days so your fees come back.",
          "Everywhere: work your order-by dates back from the carrier cutoffs in our [shipping cutoffs piece](/intelligence/analysis/holiday-shipping-cutoffs-2026-small-sellers). A late delivery turns into a seller-paid return on eBay and a Purchase Protection claim on Etsy.",
          "Price returns into the margin you plan with, using the [Amazon](/fees/amazon), [Walmart](/fees/walmart), [eBay](/fees/ebay) and [Etsy](/fees/etsy) fee pages, or the [fee comparison by item price](/fees/compare-by-item-price) for low-ticket items."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Amazon's 2027 US fee announcement, expected December to January. Forecast F5 on our [forecast scorecard](/intelligence/forecasts) says it holds headline referral rates but raises net cost through surcharges or restructuring, and it resolves by April 30, 2027, graded hit or miss. A change to the returns processing fee's rate card or thresholds would count as the kind of restructuring F5 describes, so we will track it there.",
          "January 14, 2027: Amazon's peak fulfillment fees end, per our [peak fee page](/fees/amazon/holiday-peak-2026). January 15: Apple-branded holiday returns close on Amazon. January 31, 2027: the Amazon and Walmart holiday windows close. February and March 2027: by Amazon's own billing pattern, returns processing fees for November and December shipments post. We will update this piece if eBay or Etsy announce anything for 2026, and log any fee change on the [fee change log](/fees/changelog). Marketplace moves are tracked on the [Intelligence hub](/intelligence)."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of November 3, 2026."
        ],
        "bullets": [
          "When is the Amazon holiday return deadline for 2026? January 31, 2027, for most items purchased November 1 to December 31, 2026. Apple-branded products bought in that period must be returned by January 15, 2027. It applies automatically to FBA and seller-fulfilled orders, per Amazon.",
          "When is the Walmart holiday return deadline for 2026? January 31, 2027, for most items purchased October 1 to December 31, 2026. Wireless phones, protection plans, major appliances, Dyson products, food and beverages, and select seasonal and luxury goods can be excepted, per Walmart Marketplace Learn.",
          "Does eBay have a holiday return policy in 2026? Not one that eBay has published. Your listing's return policy applies: no returns, 30 days or 60 days, buyer-paid or free, and 14 days in a few categories. eBay's Money Back Guarantee still covers items that don't match the listing or that arrive late.",
          "Does Etsy extend return windows for the holidays? We found no Etsy holiday extension for 2026. Each listing carries the return policy you set. Etsy's simple template is 30 days from delivery, with the buyer paying return shipping.",
          "Does Amazon refund the referral fee when I refund a customer? Yes, minus a refund administration fee of the lesser of $5.00 or 20% of the referral fee, per Amazon's fee schedule as quoted in Amazon's Seller Forums. On a $30 item in a 15% category, Amazon keeps $0.90.",
          "What is Amazon's FBA returns processing fee? A per-unit fee on returned FBA units: every return in apparel and shoes, and in other categories only the returns above the category's threshold, measured over the shipping month and the next two. Products shipping fewer than 25 units in a month are exempt that month.",
          "Can I charge a restocking fee on holiday returns? On Amazon seller-fulfilled orders, only for used, damaged, materially different or out-of-policy returns, never for in-policy returns in original condition. On Walmart, only on return-exempt items not in original condition, up to 20% of the item price. On eBay and Etsy, you can deduct the loss in value when an item comes back used or damaged.",
          "Who pays return shipping if my holiday package arrives late? On eBay, you do: eBay treats an item that arrived after the latest estimated delivery date as not matching the listing. On Etsy, a late arrival can be covered by Purchase Protection, which pays up to $250 of the refund and charges the rest to you."
        ]
      }
    ],
    "sources": [
      {
        "label": "Amazon Customer Service: Amazon Return Policy (read Nov 3, 2026; page undated)",
        "href": "https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7",
        "context": "2026 holiday window: most items bought Nov 1 to Dec 31, 2026 returnable through Jan 31, 2027; Apple-branded through Jan 15, 2027. Most items include at least one free return shipping option; seller-fulfilled sellers must offer a US return address, a prepaid label or a full refund without the return."
      },
      {
        "label": "Amazon Seller Central: Extended return window for items bought in November and December 2026 (posted mid-October 2026; read Nov 3, 2026)",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/fcc4e6f3-5e86-4b04-be84-82f9bcc2558a",
        "context": "Window applies automatically to FBA and FBM; no action required; existing return and refund conditions unchanged; \"This policy will apply every year.\""
      },
      {
        "label": "Value Added Resource: Amazon Sets 2026 Holiday Return Window, Says It Will Apply Every Year (secondary)",
        "href": "https://www.valueaddedresource.net/amazon-2026-holiday-returns/",
        "context": "Reports the \"every year\" wording as a change from previous annual announcements."
      },
      {
        "label": "Amazon Customer Service: Returns to Third-Party Sellers (read Nov 3, 2026; page undated)",
        "href": "https://www.amazon.com/gp/help/customer/display.html?nodeId=G38BHJQ25PNCLUBU",
        "context": "Seller provides a US return address, a prepaid return label or a full refund without the item; seller usually refunds within two business days of receipt."
      },
      {
        "label": "Amazon Seller Forums: seller-posted Amazon support reply on refunds and the refund administration fee (read Nov 3, 2026)",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/186fd498e94032664474c1c0311930a0",
        "context": "Quotes Amazon: on a full refund of a non-BMVD product Amazon retains 20% of the original order-related fees up to $5 per line item as a refund administration fee; BMVD full refunds get all order-related fees back. Amazon's fee schedule page itself requires a Seller Central login."
      },
      {
        "label": "Amazon Seller Forums: What the heck is a Refund Admin Fee? (read Nov 3, 2026)",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/69c49f14-19d9-404d-b63f-d8db57f47a35",
        "context": "Quotes the fee-schedule wording: referral fee refunded minus the lesser of $5.00 or 20% of the applicable referral fee, with Amazon's $10, 15% example ($0.30)."
      },
      {
        "label": "Amazon Seller Central: Updates to the Return Insights dashboard and Returns Processing Fee reminder (2024; read Nov 3, 2026)",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/4ba71c53-681d-49e8-ab4d-5a533b0072af",
        "context": "Three-month cohort (shipping month plus two), fee only on returns above the category threshold, billed after the period closes (June shipments charged in September); under-25-unit exemption; New Selection waiver of the first 20 returned units above threshold; apparel and shoes excepted from the threshold model."
      },
      {
        "label": "Amazon Seller Central: Policy update, seller-fulfilled returns refund workflow (Sep 2020; read Nov 3, 2026)",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/d03ae902c64a4dc05a503abcbd7dd5da",
        "context": "No restocking fees on in-policy returns in original condition; allowed for used, damaged, materially different or out-of-policy returns; photo required at 20% or more; refund within two business days of receipt. The most recent public Amazon statement of these rules that we found."
      },
      {
        "label": "Feedvisor: Amazon FBA Returns Processing Fees, the complete 2026 guide (updated Feb 19, 2026; secondary)",
        "href": "https://feedvisor.com/university/returns-processing-fees/",
        "context": "Category thresholds (Home and Kitchen 8.1%), rate card from Jan 15, 2026 (small standard from $1.78; large standard 12+ to 16 oz $3.39), apparel and shoes charged on every return."
      },
      {
        "label": "MyProfit: Amazon refund administration fee and returns processing fee guides (updated Oct 22, 2026; secondary)",
        "href": "https://www.myprofit.co/guides/amazon-refund-administration-fee",
        "context": "FBA fulfillment fee not credited on a refund; same thresholds as Feedvisor."
      },
      {
        "label": "Walmart Marketplace Learn: Upcoming return window extension for the holiday season (Aug 31, 2026)",
        "href": "https://marketplacelearn.walmart.com/releasenotes/upcoming-return-window-extension-for-the-holiday-season",
        "context": "Most items bought Oct 1 to Dec 31, 2026 returnable through Jan 31, 2027; exceptions listed."
      },
      {
        "label": "Walmart Marketplace Learn: Returns policy (last updated Aug 31, 2026)",
        "href": "https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Orders%20&%20returns/returns-policy",
        "context": "30-day minimum window starting seven days after ship date; holiday note; no return shipping charges to customers; no restocking fees except return-exempt items not in original or sellable condition (up to 20%); refunds at first carrier scan; Keep It and Partial Keep It; US return center rules."
      },
      {
        "label": "Walmart Marketplace Learn: Add Keep It Rules (last updated Sep 26, 2025)",
        "href": "https://marketplacelearn.walmart.com/guides/Order%20management/Returns%20&%20refunds/Add-a-Keep-It-Rule",
        "context": "Keep It rules by department, item price limit and return order limit; Partial Keep It by return reason, % refund and max amount."
      },
      {
        "label": "Walmart Marketplace Learn: Dispute a customer return in Seller Center (last updated Feb 19, 2025)",
        "href": "https://marketplacelearn.walmart.com/guides/Order%20management/Troubleshooting/troubleshoot-a-customer-return",
        "context": "Approved return disputes reimburse sale proceeds, not return shipping or referral fees."
      },
      {
        "label": "Walmart Marketplace Learn: Payment statements and transactions (last updated Sep 24, 2026)",
        "href": "https://marketplacelearn.walmart.com/guides/Taxes%20&%20payments/Payments/Payment-statements-and-transactions",
        "context": "Payments Report columns, including Transaction Type (sale or refund) and Commission from Sale."
      },
      {
        "label": "Walmart: Comprehensive Walmart Marketplace Program Retailer Agreement (Rev 07/2024, PDF)",
        "href": "https://azure-na-assets.contentstack.com/v3/assets/blta7903c6b840b702d/blte9f8c035c2517009/Comprehensive%20Walmart%20Marketplace%20Retailer%20Agreement%20-%207.20.2024.pdf?branch=us_mplearn",
        "context": "Seller reimburses Walmart for cash refunds it makes to customers; return policies no less favorable than the seller's own site. No statement on referral fee treatment of refunds that we found."
      },
      {
        "label": "Retail Reason: Why doesn't your Walmart Marketplace payout match your sales? (updated Sep 6, 2026; secondary)",
        "href": "https://retailreason.com/articles/walmart-marketplace-payout-mismatch/",
        "context": "Says a full refund reverses the sale's commission in the Payments Report and a partial refund prorates it. Not confirmed on Walmart's own pages."
      },
      {
        "label": "eBay Help: Setting up your return policy (read Nov 3, 2026; page undated)",
        "href": "https://www.ebay.com/help/selling/managing-returns-refunds/handling-return-requests/setting-rules-return-requests?id=4368",
        "context": "Options: no returns, 30-day or 60-day, buyer-paid or free; 14-day in listed categories; auto-accept and auto-refund rules."
      },
      {
        "label": "eBay Help: eBay Money Back Guarantee policy (read Nov 3, 2026)",
        "href": "https://www.ebay.com/help/policies/ebay-money-back-guarantee-policy/ebay-money-back-guarantee-policy?id=4210",
        "context": "Seller responsible for return shipping on not-as-described returns; item that arrived after the latest estimated delivery date treated as not matching the listing; sellers may deduct loss in value on used or damaged returns."
      },
      {
        "label": "eBay Help: Fee credits (read Nov 3, 2026; page undated)",
        "href": "https://www.ebay.com/help/selling/fees-credits-invoices/fee-credits?id=4128",
        "context": "Remorse full refunds credit the final value fee and the per-order fixed amount; not-as-described, INR, partial refunds and payment disputes credit the variable fee but not the per-order amount; partial credits proportional."
      },
      {
        "label": "eBay Developers: Business Policies API, ReturnPolicyInfo (read Nov 3, 2026)",
        "href": "https://developer.ebay.com/DevZone/business-policies/CallRef/types/ReturnPolicyInfo.html",
        "context": "holidayReturns field deprecated: \"eBay no longer supports holiday returns.\""
      },
      {
        "label": "Etsy Help: How do I Set Return Policies on My Listings (read Nov 3, 2026; page undated)",
        "href": "https://help.etsy.com/hc/en-us/articles/7869401615255-How-do-I-Set-Return-Policies-on-My-Listings",
        "context": "Per-listing policies; required outside the EU; simple policy is 30 days from delivery; buyer pays return shipping and covers loss in value (standard on all returns)."
      },
      {
        "label": "Etsy Help: How to Issue a Full or Partial Refund For an Order (read Nov 3, 2026; page undated)",
        "href": "https://help.etsy.com/hc/en-us/articles/360002089188-How-to-Issue-a-Full-or-Partial-Refund-For-an-Order",
        "context": "Transaction and processing fees refunded when you refund through Shop Manager; listing fees credited if you also cancel; 180-day refund limit on Etsy Payments."
      },
      {
        "label": "Etsy Help: Refunds, Returns, and Exchanges for Sellers (read Nov 3, 2026; page undated)",
        "href": "https://help.etsy.com/hc/en-us/articles/360000572888-Refunds-Returns-and-Exchanges-for-Sellers",
        "context": "Sellers set their own policies; Purchase Protection covers up to $250 of a refund for non-delivery, late arrival, damage (first per year) and some not-as-described claims, with the rest charged to the seller."
      },
      {
        "label": "MarketplaceBeta fee tables (verified Oct 16, 2026)",
        "href": "/fees",
        "context": "Amazon and Walmart 15% categories; eBay 13.6% most categories with $0.40 per order above $10; Etsy 6.5% transaction, 3% + $0.25 processing, $0.20 listing. Used in the hypothetical $30 table."
      },
      {
        "label": "MarketplaceBeta: Amazon 2026 holiday peak fees",
        "href": "/fees/amazon/holiday-peak-2026",
        "context": "Peak FBA fulfillment fees Oct 15, 2026 to Jan 14, 2027; referenced, not repeated, here."
      },
      {
        "label": "MarketplaceBeta: 2026 holiday shipping cutoffs for small sellers (Nov 2, 2026)",
        "href": "/intelligence/analysis/holiday-shipping-cutoffs-2026-small-sellers",
        "context": "Carrier ship-by dates that set your order-by dates."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "Returns as an acquisition metric; return policy as structured product data; forecast F5."
      }
    ]
  },
  {
    "slug": "walmart-new-seller-savings-2026-worth-it",
    "seoTitle": "Walmart New-Seller Savings 2026: Is It Worth It?",
    "metaDescription": "Walmart's 20-40% referral fee discount ends Jan 31, 2027. What it is worth at $5K, $20K and $50K a month, and why the launch date matters more.",
    "headline": "Walmart's New-Seller Savings ends January 31. At $5,000 a month, the referral-fee discount is about $400",
    "dek": "Walmart cuts a new seller's referral fees by 20% to 40% depending on sales, with a $72,000 cap. The program has a fixed end date, so a store that goes live in mid-November gets about 80 days of it. We worked out what that is worth at three sales levels, and why your operations should decide the launch date, not the discount.",
    "publishedOn": "2026-11-03",
    "updatedOn": "2026-11-03",
    "author": "MarketplaceBeta Intelligence",
    "reviewMode": "automated",
    "readTime": "6 min",
    "tags": [
      "Walmart",
      "New-Seller Savings",
      "referral fees",
      "channel launch",
      "Q4 2026"
    ],
    "takeaway": "Don't launch on Walmart for the discount, and don't delay a launch you are ready for to chase it. In a 15% category the first band takes 3 points off the referral fee, which for a seller doing $5,000 a month on Walmart comes to roughly $400 between a mid-November go-live and January 31 (our hypothetical). If you can meet Walmart's performance standards through the December peak, start onboarding this week. If you already went live after February 1, 2026, check in Seller Center today that you are actually enrolled.",
    "forecastIds": [
      "F6",
      "F5"
    ],
    "newsletterSource": "campaign_kw_walmart_nss",
    "sections": [
      {
        "id": "what-changed",
        "title": "What changed: the clock, not the terms",
        "paragraphs": [
          "Nothing in the offer changed this month. What changed is how much of it is left. Walmart's New-Seller Savings 2026 page says the program runs from February 2, 2026 to January 31, 2027, and that sellers must go live after February 1, 2026 to qualify. On November 3 that leaves under three months, and Walmart's own FAQ on the same page says onboarding takes about 10 days on average.",
          "The terms, from Walmart's offer details page (checked November 3, 2026): 20% off the referral fee on the first $0.01 to $50,000 of sales, 30% off from $50,001 to $500,000, and 40% off above $500,000, up to a maximum of $72,000 in referral fee discounts. The same offer adds up to $2,000 back on Walmart Fulfillment Services (WFS) fees (10% per item, paid as a reimbursement), up to $500 in Walmart Connect ad credits, and up to $1,000 in Search Engine Marketing credits. That last one is $1,000 only for verified Brand Portal brand owners who spend at least $2,000; other new sellers get a 50% rebate of up to $250 after $500 of spend.",
          "Discounts run from the moment you complete onboarding until January 31, 2027 or until you hit the maximum, whichever comes first. You have to accept the \"Click to enroll\" participation terms in the New-Seller Savings form in Seller Center. Sellers who joined between February 1 and April 27, 2026 are exempt from that step. For everyone else who skips it, Walmart keeps \"full discretion\" over whether to give the discount at all."
        ]
      },
      {
        "id": "the-math",
        "title": "What the discount is worth by sales level",
        "paragraphs": [
          "Walmart says its $72,000 maximum is \"calculated on the assumption of an average Referral fee for new sellers in their first year.\" Our arithmetic shows how far that is from a small store. In a 15% category such as Home & Garden ([our Walmart Home & Garden fee page](/fees/walmart/home-garden), sourced from Walmart's pricing table), the 20% band takes 3 points off the fee: a $30 order pays $3.60 instead of $4.50. A seller would need about $1.34 million in Walmart sales inside the program window to reach the $72,000 cap. In an 8% category it takes about $2.39 million.",
          "The table is hypothetical and is not a measurement of any seller. It assumes a 15% base fee, sales spread evenly, a go-live of November 13 (10 days of onboarding from today) and discounts through January 31, which is 80 days. It also assumes the bands apply to cumulative sales from go-live, each band discounting only the sales inside it. Walmart's terms list the bands in sales dollars but do not spell out what counts toward them, such as whether shipping charges are included. Check the credits on your own payment report."
        ],
        "table": {
          "caption": "Hypothetical: referral fee saved with New-Seller Savings in a 15% category · Sources: Walmart New-Seller Savings offer details (checked Nov 3, 2026); Walmart referral fee table via /fees/walmart (verified Oct 16, 2026)",
          "headings": [
            "Walmart sales per month",
            "Sales in an 80-day window",
            "Fee saved Nov 13 to Jan 31",
            "Fee saved over a full 12 months at the same rate (for comparison)"
          ],
          "rows": [
            [
              "$2,000",
              "about $5,300",
              "about $160",
              "about $720"
            ],
            [
              "$5,000",
              "about $13,200",
              "about $400",
              "about $1,950"
            ],
            [
              "$20,000",
              "about $52,600",
              "about $1,600",
              "about $10,050"
            ],
            [
              "$50,000",
              "about $131,500",
              "about $5,200",
              "about $27,750"
            ]
          ]
        },
        "bullets": [
          "The right-hand column is there to show scale. No seller who launches now gets 12 months of this program, because it ends on January 31.",
          "A store below about $19,000 in monthly Walmart sales over this 80-day window stays in the 20% band. For that store, the program is a 3-point fee cut in a 15% category for about 11 weeks.",
          "The WFS reimbursement only starts once a first item is received at a Walmart fulfillment center, so a seller-fulfilled store gets none of the $2,000."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: Walmart is buying supply, and the window has an edge",
        "paragraphs": [
          "Our view: New-Seller Savings is Walmart paying to recruit sellers, and it is one part of a larger push. The [October Intelligence Dossier](/intelligence/dossier) logged referral fee cuts in about 14 categories in June and Walmart marketplace growth of 50% or more in Q2 of fiscal 2027, and argued that the fee gap is a harvest window, not a permanent structure. If you were going to add Walmart anyway, the subsidy is a reason to start sooner. If you weren't, a few hundred dollars shouldn't change your mind.",
          "The fee gap is real at the margin. Amazon's Home & Garden referral fee is also 15% in our fee tables, so during the 20% band a Walmart Home & Garden sale pays about 12% against Amazon's 15%. See the [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart) for your category, and the [fee change log](/fees/changelog) for what moved this year.",
          "The cost is risk at the worst time of year. The offer details say you must keep good performance metrics through January 31, 2027, that Walmart can reverse discounts and demand reimbursement for violations, and that Walmart \"may alter or end this offer at any time without notification.\" Walmart's Seller Performance Standards (updated July 28, 2026) require an On-Time Delivery rate of 90% or above, Valid Tracking of 99% or above, Cancellation and Item Not Received rates of 2% or below, and Late Shipment of 5% or below. Carrier delays count against you. Missing these can lead to suppression, suspension or termination. For a brand-new store whose first weeks fall in the December carrier peak, these thresholds are a launch-readiness test, not a footnote to the discount.",
          "Hypothesis, not confirmed by Walmart: there may be a 2027 edition. Walmart has run a New-Seller Savings offer before; its January 26, 2023 announcement offered new US sellers up to a 25% commission reduction for 90 days. If a 2027 edition repeats this year's rule of going live after February 1, a store that goes live in November 2026 might not qualify for it. Walmart has announced nothing. For a seller doing $5,000 a month the gap is about $400 now against roughly $1,950 over a hypothetical full year. Compare that difference with the contribution you expect from selling on Walmart between November and January, using your own sales and margin assumptions."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "Pick the line that matches where you are."
        ],
        "bullets": [
          "Went live on Walmart after February 1, 2026: open Seller Center and confirm you accepted the New-Seller Savings \"Click to enroll\" terms. Walmart's promotion page points to the payments page in one place and the pricing page in another, and elsewhere calls the discount automatic, so check for the form rather than assume. If you joined after April 27 and never accepted them, your discount is at Walmart's discretion. Then check that the discounts appear on your payment report.",
          "Planning to add Walmart in the next six months and able to fulfill reliably now: start onboarding this week. Walmart's minimum qualifications include a business tax ID (an SSN is not accepted) or business license number, documents verifying your business name and address, GS1-prefix GTIN/UPC codes, and fulfillment through WFS or a US B2C warehouse that handles returns.",
          "Planning to add Walmart but not confident of 90% on-time delivery in December: wait until January. The terms can reverse discounts after a policy violation, and a suspension affects the channel beyond this limited promotion window.",
          "Already selling on Walmart under another account: don't open a second one for the offer. The terms limit the benefits to one seller account, and existing sellers who open new accounts to claim them risk having all associated accounts deactivated.",
          "Run the per-order math for your three best SKUs on our [Walmart fee page](/fees/walmart) or [what Walmart takes on a $30 sale](/fees/walmart/on-a-30-sale). Multiply the base referral fee by 0.8 for the first $50,000 of sales and compare that with your other channels."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Forecast F6 on our [forecast scorecard](/intelligence/forecasts) says Walmart extends its fee-cut or WFS-incentive playbook to more categories to sustain marketplace growth above 40%. It resolves by April 30, 2027 and is graded hit or miss on Seller Center policy updates and Walmart's Q3 and Q4 fiscal 2027 results. A renewed New-Seller Savings program on its own is not a category extension, so it would not count toward F6. A fee increase would make F6 a miss. Walmart reports Q3 fiscal 2027 results on November 19, 2026 and Q4 on February 18, 2027, per its events page.",
          "Forecast F5 says Amazon's 2027 US fee announcement, expected December to January, holds headline referral rates but raises net cost through surcharges or restructuring. That announcement sets the other side of any Amazon vs Walmart launch decision, so wait for it before committing a big catalog move.",
          "Whether Walmart announces a 2027 New-Seller Savings edition, and with what go-live rule. We will update this piece if it does. Walmart's moves are tracked on the [intelligence dashboard](/intelligence) and in the [Marketplace Pressure Index](/intelligence/pressure-index)."
        ]
      }
    ],
    "sources": [
      {
        "label": "Walmart Marketplace: New-Seller Savings 2026 (checked Nov 3, 2026)",
        "href": "https://marketplace.walmart.com/new-seller-savings-2026/",
        "context": "Program dates Feb 2, 2026 to Jan 31, 2027; go-live after Feb 1, 2026; 20%/30%/40% bands; up to $72K off referral fees; opt in after go-live on the payments page; onboarding about 10 days on average; minimum qualifications."
      },
      {
        "label": "Walmart Marketplace: New Seller Savings, general offer details (checked Nov 3, 2026)",
        "href": "https://marketplace.walmart.com/nss-offer-details/",
        "context": "Band thresholds ($0.01-50,000; $50,001-500,000; over $500,000); $72,000 maximum based on an average new-seller referral fee; WFS 10% reimbursement up to $2,000; SEM $1,000 (Brand Portal owners, $2,000 spend) or $250 ($500 spend); $500 Walmart Connect credit; Click to enroll terms and Feb 1-Apr 27 exemption; performance requirement; end date or cap; one account only; Walmart may alter or end the offer."
      },
      {
        "label": "Walmart Marketplace Learn: New-Seller Savings overview (updated Sep 2, 2026)",
        "href": "https://marketplacelearn.walmart.com/guides/new-seller-savings-overview",
        "context": "Offer lasts until January 31, 2027; component table."
      },
      {
        "label": "Walmart Marketplace Learn: Seller Performance Standards (updated Jul 28, 2026)",
        "href": "https://marketplacelearn.walmart.com/guides/Policies&standards/Performance/Seller-performance-standards",
        "context": "On-Time Delivery 90% or above, Valid Tracking 99% or above, Cancellation 2% or below, Item Not Received 2% or below, Late Shipment 5% or below; carrier delays seller-accountable; suppression, suspension or termination."
      },
      {
        "label": "MarketplaceBeta: Walmart referral fees (verified Oct 16, 2026 against marketplace.walmart.com/pricing)",
        "href": "/fees/walmart",
        "context": "Home & Garden 15%; category rates used in the worked examples. Amazon Home & Garden 15% from our Amazon fee table (verified Oct 16, 2026 against sell.amazon.com/pricing)."
      },
      {
        "label": "Walmart corporate: New-Seller Savings Gives Sellers a Boost To Grow at Walmart (Jan 26, 2023)",
        "href": "https://corporate.walmart.com/news/2023/01/26/new-seller-savings-gives-sellers-a-boost-to-grow-at-walmart",
        "context": "Earlier New-Seller Savings offer: up to a 25% commission rate reduction for 90 days for new US sellers."
      },
      {
        "label": "Walmart corporate: Events (checked Nov 3, 2026)",
        "href": "https://corporate.walmart.com/news/events",
        "context": "FY2027 Q3 earnings release Nov 19, 2026; FY2027 Q4 earnings release Feb 18, 2027."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "Walmart's June referral fee cuts in about 14 categories and 50%+ marketplace growth (Q2 FY27), with the dossier's own cited sources; the fee gap as a harvest window; forecasts F5 and F6."
      }
    ]
  },
  ...RESEARCH_ARTICLES,
  {
    "slug": "holiday-shipping-cutoffs-2026-small-sellers",
    "seoTitle": "2026 Holiday Shipping Cutoffs for Small Sellers",
    "metaDescription": "USPS, UPS and FedEx 2026 ship-by dates for Christmas, what Amazon, Etsy, eBay, Walmart and TikTok Shop publish, and what late upgrades cost.",
    "headline": "The 2026 holiday shipping cutoffs, and why the last week costs three times as much in surcharges",
    "dek": "All three carriers have published their 2026 Christmas dates. For ground, the last safe day is Thursday, December 17. After that, every order that still has to arrive by Christmas moves to an air or express service, and the peak surcharge on that label is roughly three times the ground one. Here are the dates from the carriers' own pages, what the marketplaces do and don't publish, and the order-by dates to set this week.",
    "publishedOn": "2026-11-02",
    "updatedOn": "2026-11-02",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "7 min",
    "tags": [
      "holiday shipping",
      "shipping cutoffs",
      "USPS",
      "UPS",
      "FedEx",
      "peak season",
      "Q4 2026"
    ],
    "takeaway": "Set your customer-facing order-by date for ground shipping this week, working back from December 17 (USPS Ground Advantage, and FedEx Ground at five days in transit) minus your own handling time. Then decide, before the orders arrive, whether you will sell December 18 to 23 orders on air or express service, and at what price. In that window the peak surcharge alone is $2.35 to $2.55 a package at UPS and FedEx, against $0.75 to $0.80 on ground.",
    "forecastIds": [
      "F2"
    ],
    "newsletterSource": "campaign_kw_holiday_cutoffs_2026",
    "sections": [
      {
        "id": "answer",
        "title": "The short answer",
        "paragraphs": [
          "For delivery by Christmas inside the lower 48 states, the carriers' published last days to ship are: USPS Ground Advantage, Thursday, December 17; USPS Priority Mail, Friday, December 18; USPS Priority Mail Express, Saturday, December 19 (USPS's dates are for expected delivery before December 25). UPS 3 Day Select, Monday, December 21; UPS 2nd Day Air, Tuesday, December 22; UPS Next Day Air, Wednesday, December 23. FedEx Ground and Home Delivery run from December 17 for a five-day lane to December 23 for a one-day lane; FedEx Express Saver December 21, FedEx 2Day December 22, FedEx overnight services December 23 (UPS and FedEx dates are for delivery by December 24). We read each carrier's own page or PDF on November 2, 2026.",
          "Two carriers do not give a single ground date. UPS says to check its Calculate Time and Cost tool for UPS Ground, and warns that \"a limited number\" of Ground packages will need extra transit time from November 16, 2026 to January 8, 2027. USPS no longer gives a Ground Advantage date for Alaska, Hawaii, Puerto Rico or the territories: its page says those packages carry a service expectation of 10 days or more and points to its ZIP-to-ZIP lookup instead.",
          "The marketplaces mostly do not publish a Christmas ship-by date for seller-fulfilled orders. Your order-by date is your carrier's date minus your own handling time. The table below has every date we could verify, and says so where a date is not published."
        ],
        "table": {
          "caption": "2026 last days to ship for holiday delivery, US domestic · Sources: USPS holiday shipping page, UPS 2026 Year-End Holiday Schedule (PDF), FedEx 2026 Shipping deadlines for holiday packages (PDF), all read Nov 2, 2026",
          "headings": [
            "Carrier and service",
            "Last day to ship",
            "Delivery target"
          ],
          "rows": [
            [
              "USPS Ground Advantage, First-Class Mail (lower 48)",
              "Thu, Dec 17",
              "Before Dec 25"
            ],
            [
              "USPS Priority Mail",
              "Fri, Dec 18",
              "Before Dec 25"
            ],
            [
              "USPS Priority Mail Express",
              "Sat, Dec 19",
              "Before Dec 25"
            ],
            [
              "USPS Ground Advantage to or from AK, HI, PR, territories",
              "No date published: 10+ day service expectation, check ZIP to ZIP",
              "Before Dec 25"
            ],
            [
              "FedEx Ground Economy",
              "Tue, Dec 15",
              "By Dec 24"
            ],
            [
              "FedEx Ground / Home Delivery",
              "Dec 17 (5-day lane), Dec 18 (4-day), Dec 21 (3-day), Dec 22 (2-day), Dec 23 (1-day)",
              "By Dec 24"
            ],
            [
              "UPS Ground",
              "No date published: check UPS Calculate Time and Cost for your lane",
              "By Dec 24"
            ],
            [
              "UPS 3 Day Select / FedEx Express Saver",
              "Mon, Dec 21",
              "By Dec 24"
            ],
            [
              "UPS 2nd Day Air / FedEx 2Day and 2Day AM",
              "Tue, Dec 22",
              "By Dec 24"
            ],
            [
              "UPS Next Day Air / FedEx First, Priority and Standard Overnight",
              "Wed, Dec 23",
              "By Dec 24"
            ],
            [
              "FedEx SameDay",
              "Thu, Dec 24",
              "Dec 24"
            ]
          ]
        }
      },
      {
        "id": "what-changed",
        "title": "What changed: the dates are out, and the late window got pricier",
        "paragraphs": [
          "USPS announced its 2026 dates on September 22, and its holiday page now carries the full domestic, international and military tables. FedEx's last-day-to-ship PDF carries an 8/26 date stamp, and UPS's year-end schedule is out as well. All three say the dates can change. FedEx says updates will be posted on the same page, so re-check in mid-December.",
          "Three details are easy to miss. UPS warns that some UPS 2nd Day Air packages tendered on December 14, 15, 16 or 21, and some 3 Day Select packages tendered on December 14 or 15, may need an extra day in transit. The UPS Service Guarantee is suspended except for select Air and International services. And UPS's 2027 rates take effect on December 21, inside the last-week window: UPS daily rates for Ground, Air and International rise an average net 5.9% that day, per UPS's rates page. Our [UPS and FedEx 2027 rates piece](/intelligence/analysis/ups-fedex-2027-rate-increase-small-sellers) has the arithmetic.",
          "Two dates come earlier than December. USPS's international send-by date is Wednesday, December 9 for First-Class Package International and Priority Mail International to every region it lists, and December 16 for Priority Mail Express International. For military mail, USPS lists Wednesday, November 4 for Ground Advantage to the APO/FPO/DPO AE ZIP ranges it shows, which is this week.",
          "The surcharges on top of these labels are the same ones we laid out in our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar) on October 20, re-read this morning and unchanged: UPS's schedule is still the August 26 update and FedEx's U.S. package table is still the July 22 update. What that calendar did not show is what happens to the air and express surcharges in the same weeks, which is where the last-minute orders go."
        ]
      },
      {
        "id": "marketplaces",
        "title": "What the marketplaces publish (and what they don't)",
        "paragraphs": [
          "We looked for 2026 holiday dates on each marketplace's own pages on November 2. Where we found none, we say so rather than reuse last year's."
        ],
        "table": {
          "caption": "Marketplace holiday dates and rules, 2026 · Sources listed below, read Nov 2, 2026",
          "headings": [
            "Marketplace",
            "What is published for 2026",
            "What it means now"
          ],
          "rows": [
            [
              "Amazon FBA",
              "Black Friday Week and Cyber Monday arrival cutoffs: Oct 14 (AWD), Oct 21 (FBA, minimal shipment splits), Oct 28 (FBA, Amazon-optimized splits). Peak fulfillment fees Oct 15, 2026 to Jan 14, 2027.",
              "All three have passed. Stock arriving now is not guaranteed to be processed in time for event Prime eligibility. Fees: see our Amazon peak page."
            ],
            [
              "Amazon (seller-fulfilled)",
              "No 2026 holiday ship-by date found on Amazon's public pages.",
              "Your handling time and shipping templates set the delivery promise."
            ],
            [
              "Etsy",
              "No single date. Etsy calculates each order's ship-by date from your processing time, processing schedule and shipping profile, and tells sellers to set and post their own last-order dates.",
              "Update processing times and holiday days off now."
            ],
            [
              "eBay",
              "No US holiday cutoff found. eBay's 2026 seasonal carrier announcement, as reported, waives the FedEx Demand Surcharge on eligible eBay Labels from Sep 28, 2026 to Jan 17, 2027. The UPS Demand Surcharge still applies.",
              "Check which carrier your eBay labels default to."
            ],
            [
              "Walmart",
              "WFS domestic inbound deadlines: Sep 1 (October event), Sep 15 (Annual, Black Friday/Cyber Monday and December events).",
              "Passed. No 2026 Christmas date for seller-fulfilled orders found; each order's Ship By date applies."
            ],
            [
              "TikTok Shop",
              "No holiday cutoff on TikTok's public Seller University. Standard SLA: dispatch within 2 business days, deliver within 6 business days. FBT: an Oct 15 inbound target and inbound receiving suspended Nov 27 to Dec 6, per TikTok's September FBT update as reported.",
              "The 6-day SLA does not promise Christmas delivery for mid-December orders."
            ]
          ]
        }
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: the last week is where the surcharge triples",
        "paragraphs": [
          "Between November 22 and December 26, UPS charges $0.75 per Ground Residential or Ground Saver package and $2.50 per UPS Air package (Next Day Air, 2nd Day Air and 3 Day Select), per its August 26 demand surcharge schedule. Between November 23 and December 27, FedEx charges $0.80 per residential Ground or Home Delivery package, $2.35 on 2Day, 2Day AM and Express Saver, and $2.55 on overnight services, per FedEx's demand surcharge page (updated October 23, 2026, U.S. package table dated July 22). That makes the air surcharge 3.3 times the ground one at UPS and 2.9 times at FedEx, by our arithmetic.",
          "USPS has no separate surcharge. It raises the price itself: temporary rates from October 4, 2026 to January 17, 2027 add $0.50 to a 0–3 lb retail Ground Advantage or Priority Mail parcel in zones 1–4, $0.75 to Ground Advantage and $1.00 to Priority Mail in zones 5–9, and $1.40 (zones 1–4) to $2.35 (zones 5–9) to a 0–3 lb Priority Mail Express parcel, per USPS's August 25 announcement. The lower commercial schedule in the same announcement adds $0.40 to $0.55 for a 0–3 lb Ground Advantage parcel.",
          "Hypothetical, before any base rate: on a $20 order, the $0.75 UPS ground surcharge is 3.75% of revenue. Ship the same order 2nd Day Air on December 22 and the $2.50 surcharge alone is 12.5%, before you pay the air rate it sits on. On eBay, passing that $2.50 to the buyer as shipping also raises the final value fee, because eBay charges it on the total including shipping: at the 13.6% most-categories rate on our [eBay fee page](/fees/ebay), that is about $0.34 more per order.",
          "That is why this connects to forecast F2 on our [forecast scorecard](/intelligence/forecasts): effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% GRIs, resolving January 31, 2027 and graded hit or miss from carrier surcharge tables and shipper invoices. Hypothesis, not yet measured: for small sellers, the share of December orders that slip from ground to air after December 17 will move their effective parcel cost more than the ground surcharge itself."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "None of this needs a new tool. It needs dates on your listings before the Cyber Week orders arrive."
        ],
        "bullets": [
          "Set a ground order-by date. Start from the carrier date, subtract your handling time, then a buffer. Hypothetical: a shop with 3 business days of handling that ships USPS Ground Advantage needs orders by Monday, December 14 to make the December 17 send-by date. If you ship UPS Ground, look up your longest lane in Calculate Time and Cost instead of guessing.",
          "Publish it where the buyer sees it: shop announcement, listing descriptions and the order confirmation. On Etsy, update processing times and add holiday days off to your processing schedule, because Etsy builds ship-by dates from those settings.",
          "Price the late window now. Decide whether December 18 to 23 orders get Priority Mail, Priority Mail Express or air at a buyer-paid upgrade, and set that price to cover the base rate plus the $2.35 to $2.55 UPS and FedEx air surcharges, or the USPS temporary increase.",
          "Ship the early dates. Military Ground Advantage to the AE ZIP ranges USPS lists is due Wednesday, November 4. International First-Class Package and Priority Mail International are due December 9.",
          "If you sell on eBay, check your carrier default. eBay's announcement, as reported, waives the FedEx Demand Surcharge on eligible eBay Labels through January 17, 2027, but not the UPS one.",
          "Plan for what comes back. Amazon and Walmart both take holiday returns until January 31, 2027, and a late delivery on eBay becomes a seller-paid return. See our [2026 holiday returns piece](/intelligence/analysis/holiday-returns-2026-amazon-walmart-etsy-ebay) for each marketplace's window and fees.",
          "If you use FBA or WFS, the Black Friday inbound dates have passed. Check what is actually received, not what is in transit, and plan seller-fulfilled backup for best-sellers. For Amazon's peak fees on that inventory, use our [Amazon holiday peak fee page](/fees/amazon/holiday-peak-2026) rather than re-running the math here.",
          "On TikTok Shop, do not treat the standard SLA as a Christmas promise. Hypothetical, our arithmetic: an order that enters Awaiting Shipment on Thursday, December 17 has a deliver-by date of Monday, December 28 under the 6-business-day rule, because weekends and Christmas Day do not count."
        ]
      },
      {
        "id": "own-data",
        "title": "Where our own pages fit",
        "paragraphs": [
          "Referral fees do not change because of the holidays, but the base they apply to can: eBay and Etsy both charge on shipping you collect. Our [fee pages](/fees) and the [fee change log](/fees/changelog) carry each marketplace's current rates with the date we checked them. The [October Intelligence Dossier](/intelligence/dossier) lists the surcharge stack behind forecast F2 and recommends re-setting free-shipping thresholds against the surcharged parcel cost. For the wider picture, see the [Intelligence hub](/intelligence)."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Early November: UPS says details of a new per-package surge fee on Ground and Ground Saver shipments from certain origin ZIP codes, for qualified customers, effective on or after December 21, will be published in early November. We will add it here when it is out.",
          "November 22–23: the UPS and FedEx peak surcharge step-up. December 21: UPS 2027 rates. Mid-December: any carrier changes to these dates, which all three say can move. January 4, 2027: FedEx 2027 rates, per our [2027 rates piece](/intelligence/analysis/ups-fedex-2027-rate-increase-small-sellers). January 17, 2027: USPS temporary prices end; see our [USPS January 2027 piece](/intelligence/analysis/usps-january-2027-price-change-fuel-surcharge). We will grade F2 on the [scorecard](/intelligence/forecasts) by January 31, 2027."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of November 2, 2026."
        ],
        "bullets": [
          "What is the last day to ship USPS for Christmas 2026? Thursday, December 17 for Ground Advantage and First-Class Mail, Friday, December 18 for Priority Mail and Saturday, December 19 for Priority Mail Express, for expected delivery before December 25 in the lower 48, per USPS. For Alaska, Hawaii, Puerto Rico and the territories, USPS gives no Ground Advantage date and says to expect 10 days or more.",
          "What is the UPS Ground cutoff for Christmas 2026? UPS does not publish one. It tells shippers to check Calculate Time and Cost for their lane, and warns some Ground packages will need extra time from November 16 to January 8. Its published air dates are December 21 (3 Day Select), December 22 (2nd Day Air) and December 23 (Next Day Air), for delivery by December 24.",
          "What is the FedEx Ground cutoff for Christmas 2026? It depends on transit time: December 17 for a five-day lane, December 18 for four days, December 21 for three, December 22 for two and December 23 for one, for delivery by December 24, per FedEx. FedEx Ground Economy is December 15.",
          "How much are the 2026 holiday peak surcharges? On residential ground: UPS $0.50, then $0.75 from November 22 to December 26; FedEx $0.50, then $0.80 from November 23 to December 27. On air: UPS $1.35, then $2.50; FedEx 2Day and Express Saver $1.20, then $2.35; FedEx overnight $1.30, then $2.55. USPS raises prices instead, from October 4 to January 17.",
          "Does Etsy or eBay publish a holiday shipping deadline? Not a single one that we found. Etsy builds each order's ship-by date from your processing time and asks you to post your own last-order dates. eBay relies on your handling time. Both mean your order-by date is your decision.",
          "Is it too late to send inventory to FBA for Black Friday? Amazon's Black Friday and Cyber Monday arrival cutoffs were October 14, 21 and 28, depending on shipment type, so stock arriving now is not guaranteed to be processed in time for event Prime eligibility. It can still be received."
        ]
      },
      {
        "id": "note",
        "title": "How this was made",
        "paragraphs": [
          "AI-assisted, human-reviewed. Every carrier date and surcharge was read from the carrier's own page or PDF on November 2, 2026. Marketplace dates come from each marketplace's own pages where we could open them; the eBay waiver and TikTok's FBT dates come from seller announcements we could not open publicly, so we cite the trade reports that quote them. The ratios, percentages of a $20 order and order-by examples are our arithmetic. Examples labeled hypothetical are illustrations, not measured results."
        ]
      }
    ],
    "sources": [
      {
        "label": "USPS: 2026 Holiday Shipping Deadlines",
        "href": "https://www.usps.com/holiday/holiday-shipping-dates.htm",
        "context": "Read Nov 2, 2026: lower 48 send-by dates Dec 17 (Ground Advantage, First-Class Mail), Dec 18 (Priority Mail), Dec 19 (Priority Mail Express) for expected delivery before Dec 25; no Ground Advantage date for AK, HI, PR and territories (10+ day expectation); international Dec 9 and Dec 16; military Ground Advantage to listed AE ZIPs Nov 4."
      },
      {
        "label": "USPS Newsroom: Postal Service Recommends 2026 Holiday Mailing and Shipping Dates (Sep 22, 2026)",
        "href": "https://about.usps.com/newsroom/national-releases/2026/0922-usps-recommends-2026-holiday-mailing-shipping-dates.htm",
        "context": "Announcement of the 2026 domestic dates."
      },
      {
        "label": "USPS Newsroom: Temporary Price Change for 2026 Holiday Shipping Season (Aug 25, 2026)",
        "href": "https://about.usps.com/newsroom/national-releases/2026/0825-usps-announces-temporary-price-change-for-2026-holiday-shipping-season.htm",
        "context": "Temporary prices Oct 4, 2026 to Jan 17, 2027 on Priority Mail Express, Priority Mail, Ground Advantage and Parcel Select, with per-zone and per-weight increases."
      },
      {
        "label": "UPS: 2026 Year-End Holiday Schedule (PDF)",
        "href": "https://assets.ups.com/adobe/assets/urn:aaid:aem:e8548535-8096-4fa9-9cef-2b81aef7c26c/original/as/year-end-holiday-schedule-us-en.pdf",
        "context": "Read Nov 2, 2026: last days to ship for Dec 24 delivery, Dec 21 (3 Day Select), Dec 22 (2nd Day Air), Dec 23 (Next Day Air); Ground, check ups.com/ctc; extra Ground transit Nov 16, 2026 to Jan 8, 2027; Service Guarantee suspended except select Air and International."
      },
      {
        "label": "UPS: Demand Surcharges, August 26, 2026 update (PDF)",
        "href": "https://assets.ups.com/adobe/assets/urn:aaid:aem:2c542692-de10-4fa3-b507-3b4f181e0953/original/as/demand-surcharges-us-en.pdf",
        "context": "Read Nov 2, 2026: Ground Residential and Ground Saver $0.50 / $0.75 (Nov 22 to Dec 26) / $0.50; UPS Air $1.35 / $2.50 / $1.35; higher-volume tables for shippers above 20,000 packages a week."
      },
      {
        "label": "UPS: Shipping Zones and Rates (2027 changes)",
        "href": "https://www.ups.com/us/en/support/shipping-support/shipping-costs-rates",
        "context": "Read Nov 2, 2026: daily rates for Ground, Air and International rise an average net 5.9% from Dec 21, 2026; origin-ZIP surge fee details due early November."
      },
      {
        "label": "FedEx: 2026 Shipping deadlines for holiday packages (PDF)",
        "href": "https://www.fedex.com/content/dam/fedex/us-united-states/services/2026_Peak_Last_Day_to_ship.pdf",
        "context": "Read Nov 2, 2026: last days to ship for Dec 24 arrival, Ground Economy Dec 15; Ground and Home Delivery Dec 17 to Dec 23 by transit days; Express Saver Dec 21; 2Day Dec 22; overnight Dec 23; SameDay Dec 24. Dates subject to change."
      },
      {
        "label": "FedEx: Demand Surcharges (page updated Oct 23, 2026)",
        "href": "https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html",
        "context": "U.S. package table updated Jul 22, 2026: residential Ground and Home Delivery $0.50 / $0.80 (Nov 23 to Dec 27) / $0.50; 2Day, 2Day AM, Express Saver $1.20 / $2.35 / $1.20; overnight $1.30 / $2.55 / $1.30; Ground Economy $2.55 / $4.05 / $2.55."
      },
      {
        "label": "Amazon Seller Central: Holiday 2026: Same fees, same eligibility, earlier deadlines",
        "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff",
        "context": "Black Friday Week and Cyber Monday arrival cutoffs: Oct 14 (AWD), Oct 21 (FBA minimal splits), Oct 28 (FBA Amazon-optimized splits)."
      },
      {
        "label": "Amazon Supply Chain Services: MCF peak season readiness guide (Sep 16, 2026)",
        "href": "https://supplychain.amazon.com/blog/mcf-peak-season-readiness",
        "context": "Read Nov 2, 2026: same cutoff dates, described as arrival dates; peak fulfillment fees Oct 15, 2026 to Jan 14, 2027."
      },
      {
        "label": "Etsy Seller Handbook: Checklist: How to Ship Smoothly This Holiday Season",
        "href": "https://www.etsy.com/seller-handbook/article/973333640408",
        "context": "Etsy estimates delivery dates from processing time, processing schedule and shipping profile; asks sellers to follow carrier cutoffs."
      },
      {
        "label": "Etsy Seller Handbook: Prepare Your Shop for Holiday Success",
        "href": "https://www.etsy.com/seller-handbook/article/30953650830",
        "context": "Advises sellers to set firm last-order dates and post them in the shop announcement, policies and item descriptions."
      },
      {
        "label": "Walmart Marketplace: Peak prep deadlines and checklist, Holiday 2026 (PDF)",
        "href": "https://azure-na-assets.contentstack.com/v3/assets/blta7903c6b840b702d/blt081fa526582904e3/Peak%20Playbook%20Holiday%202026.pdf?branch=us_mplearn",
        "context": "Read Nov 2, 2026: WFS domestic inbound deadlines Sep 1, 2026 (October event) and Sep 15, 2026 (Annual, Black Friday/Cyber Monday and December events)."
      },
      {
        "label": "TikTok Shop (Seller University, US): Logistics & Fulfillment (09/09/2026)",
        "href": "https://seller-us.tiktok.com/university/essay?knowledge_id=7740101263378189&lang=en",
        "context": "Read Nov 2, 2026: regular orders dispatch within 2 business days and deliver within 6 business days of Awaiting Shipment; business days exclude weekends and US federal holidays."
      },
      {
        "label": "GeekSeller: What's New with TikTok FBT, September 2026 Seller Update (Sep 7, 2026)",
        "href": "https://www.geekseller.com/blog/whats-new-with-tiktok-fbt-september-2026-seller-update/",
        "context": "Cites TikTok Shop's September 2026 FBT newsletter: Oct 15 inbound target for Black Friday/Cyber Monday; FC inbound receiving suspended Nov 27 to Dec 6."
      },
      {
        "label": "LiquidationOH: eBay Waives the FedEx Holiday Surcharge on Its Labels, Not the UPS One (Sep 28, 2026)",
        "href": "https://www.liquidationoh.com/reselling-news-ebay-waives-the-fedex-holiday-surcharge-on-its-labels-not-the-ups-one/",
        "context": "Reports eBay's 2026 seasonal carrier announcement: FedEx Demand Surcharge waived on eligible eBay Labels Sep 28, 2026 to Jan 17, 2027; UPS Demand Surcharge applies."
      },
      {
        "label": "Niceggie: eBay Announces 2026 Seasonal Carrier Rate Increases (Oct 1, 2026)",
        "href": "https://www.niceggie.com/en/news/ebay-announces-2026-seasonal-carrier-rate-increases-6abdc14a1bc406cba4658764",
        "context": "Second report of the same eBay announcement, listing the FedEx services covered by the waiver."
      },
      {
        "label": "MarketplaceBeta: Amazon 2026 holiday peak fees",
        "href": "/fees/amazon/holiday-peak-2026",
        "context": "Amazon peak FBA fees by size tier with the 3.5% surcharge; referenced, not repeated, here."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "The 2026 surcharge stack and forecast F2."
      }
    ]
  },
  {
    slug: "tiktok-shop-referral-fee-6-or-8-percent",
    seoTitle: "TikTok Shop Fee: 6% or 8%? Check What You Pay",
    metaDescription: "TikTok's US fee table still says 6%; trade blogs say 8% since Aug 4, 2026. What each means on a $20 sale and how to read your own rate.",
    headline: "TikTok Shop's referral fee: the table says 6%, the blogs say 8%. Your settlement report decides",
    dek: "Three months after trade blogs reported a move to 8%, TikTok's own US fee table, re-checked this morning, still lists 6%. On a $20 sale the gap is 40 cents an order. Here is what each rate costs, the settlement check that tells you which one you are on, and what would settle it for everyone.",
    publishedOn: "2026-11-02",
    updatedOn: "2026-11-02",
    author: "MarketplaceBeta Intelligence",
    readTime: "5 min",
    tags: ["TikTok Shop", "marketplace fees", "referral fee", "settlement report", "2026"],
    takeaway: "Keep modeling TikTok Shop at the published 6%, with an 8% stress case, until your own numbers say otherwise. This week, pull one settlement report that spans August 4, 2026, divide the referral fee by its base on a handful of clean orders, and you will know which rate you pay. If it reads 8%, re-price low-ticket SKUs and creator commissions first, because that is where 40 cents an order hurts.",
    forecastIds: [],
    newsletterSource: "campaign_kw_tiktok_fee_2026_11",
    sections: [
      {
        id: "answer",
        title: "The short answer",
        paragraphs: [
          "As of November 2, 2026, TikTok has not published an 8% US referral fee. Its \"Referral Fees by Category\" table on Seller University, page dated October 8, 2026, lists 6% for almost every US category, 5% for five fine-jewelry sub-categories and the Pre-Owned categories, and 3% on the part of a Collectibles or Pre-Owned sale above $10,000. We re-read it this morning.",
          "The 8% comes from third-party sellers' guides. Delzonic (August 28, 2026) and FBA Tactics (August 25, updated September 5) say most non-food US categories moved from 6% to 8% on August 4, 2026. beBOLD Digital (September 8, updated September 14) repeats the figure but calls it a reported change and notes TikTok's public table had not caught up. Ecommerce Times (August 16) gives a different date, October 1, 2026. None of them links a TikTok notice, and we found none. So 8% is a report, not a confirmed rate. It is also not something we can rule out for an individual shop, which is why the check below matters.",
          "On a $20 sale with no shipping, discount or tax, TikTok's fee is $1.20 at 6% and $1.60 at 8%: 40 cents more per order, a third more in fees. That is the same answer our [TikTok Shop $20 sale page](/fees/tiktok-shop/on-a-20-sale) gives at 6%, and the 8% case comes from our [6% vs 8% explainer](/fees/tiktok-shop/fee-change-2026)."
        ]
      },
      {
        id: "what-changed",
        title: "What changed, and what didn't",
        paragraphs: [
          "TikTok's side of the record has not moved since our October 21 check. The category table carries the same October 8, 2026 date and the same 6%, 5% and 3% rates. Its companion page, \"TikTok Shop Referral Fee Updates - 2024\" (page dated 05/08/2025), still says the referral fee moved to 6% per order on April 1, 2024, that new sellers on promotional plans stay on them until the promotion ends, and that TikTok will use \"reasonable efforts\" to notify sellers by email or in their account 30 days before a material change.",
          "The reports have not converged either. They disagree on the date (August 4 or October 1) and on the extras: Delzonic adds 9.5% to 11% for select beauty and electronics sub-categories, and Ecommerce Times adds a 1.5% creator facilitation fee. FBA Tactics tells readers to treat 8% as the working figure. beBOLD tells them to verify first. Independent fee guides checked this week, including z.media (November 1) and Nolyn (November 2), still list 6% from TikTok's table.",
          "Our own pages follow the primary source. Since October 21, [our TikTok Shop fee page](/fees/tiktok-shop) models 6% in every category and notes the reported 8% beside it, and the switch is logged on the [fee change log](/fees/changelog). Our [October Intelligence Dossier](/intelligence/dossier) listed the 6% to 8% move under \"what we could not verify\" and named TikTok's official fee table as the signal to watch monthly. That is still the status."
        ],
        table: {
          caption: "Who says what about the US referral fee · Sources: TikTok Seller University fee pages; Delzonic; FBA Tactics; beBOLD Digital; Ecommerce Times. All re-read November 2, 2026.",
          headings: ["Source", "Dated", "Rate for most categories", "Cites a TikTok notice?"],
          rows: [
            ["TikTok: Referral Fees by Category (official)", "Page dated Oct 8, 2026", "6% (5% fine jewelry and Pre-Owned)", "It is TikTok's own table"],
            ["FBA Tactics", "Aug 25, 2026, updated Sep 5", "8% from Aug 4, 2026", "No; cites trade coverage"],
            ["Delzonic", "Aug 28, 2026", "8% from Aug 4, 2026; 9.5%–11% some beauty and electronics", "No"],
            ["beBOLD Digital", "Sep 8, 2026, updated Sep 14", "8% \"reported\"; says the public table still shows 5%–6%", "No; cites Delzonic"],
            ["Ecommerce Times", "Aug 16, 2026", "8% from Oct 1, 2026", "Describes a Seller Center statement but links none"]
          ]
        }
      },
      {
        id: "twenty-dollar-sale",
        title: "Why it matters: what each rate takes from a $20 sale",
        paragraphs: [
          "TikTok's formula is Referral Fee Rate × (Customer Payment + Platform Discount − Tax), and the base includes shipping the customer paid, per its category table. That means a buyer-paid shipping charge raises your fee, a TikTok-funded discount does not lower it, and sales tax never enters it.",
          "The rows below are our arithmetic from that formula. The first row is a plain $20 sale. The other two are hypothetical orders, labeled as such, to show how the base moves."
        ],
        table: {
          caption: "TikTok Shop referral fee on a $20 item at the published 6% and the reported 8% · Formula: TikTok Seller University category table (page dated Oct 8, 2026). Hypothetical orders and all dollar figures are our arithmetic.",
          headings: ["Order", "Fee base", "At 6%", "At 8%", "Difference"],
          rows: [
            ["$20 item, no shipping, discount or tax", "$20.00", "$1.20", "$1.60", "+$0.40"],
            ["Hypothetical: $20 item + $4 buyer-paid shipping", "$24.00", "$1.44", "$1.92", "+$0.48"],
            ["Hypothetical: $20 item + $4 shipping, $2 TikTok-funded discount, $1.50 tax (customer pays $23.50)", "$23.50 + $2.00 − $1.50 = $24.00", "$1.44", "$1.92", "+$0.48"],
            ["Refund administration fee if that plain $20 item is fully refunded (20% of the referral fee, capped at $5 per SKU)", "—", "$0.24", "$0.32", "+$0.08"]
          ]
        },
        bullets: [
          "Per $10,000 of fee base, 6% is $600 and 8% is $800, so the reported change would cost $200 more per $10,000 sold (our arithmetic).",
          "Hypothetical: a $20 item that cleared $2.00 profit per unit at 6% would clear $1.60 at 8%, a 20% cut in profit from a two-point fee move. The thinner the margin, the bigger the share.",
          "Hypothetical: add a 15% creator commission, which TikTok's settlement report defines as (product price excl. tax − seller discount) × rate, and the $20 sale carries $3.00 in commission. Fees plus commission come to $4.20 (21% of the sale) at 6% and $4.60 (23%) at 8%."
        ]
      },
      {
        id: "settlement-check",
        title: "How to tell which rate you are paying",
        paragraphs: [
          "Your settlement report is the only document that answers this for your shop. TikTok's help article \"How to Access Your Settlement Report\" (page dated 09/11/2025) says to go to Finances > Statements or Payouts in Seller Center, click Export, pick a date range and download the file from Export History. The Order details sheet breaks settlement down by SKU, fees included. Our [fee-change explainer](/fees/tiktok-shop/fee-change-2026) walks through it step by step; here is the short version."
        ],
        bullets: [
          "Export a range that spans August 4, 2026, so you have orders from before and after the reported change date, and ideally after October 1 too, the other date in the reports.",
          "Pick clean orders: completed, no refund, no adjustment, and an empty Ads referral fee discount column. TikTok's column definitions say that discount lowers the referral fee on orders from the Shop Ads incentive, so it will make your rate look lower than it is.",
          "Rebuild the base: Customer payment + Platform discounts − Sales tax payment. On Colorado orders, also subtract the Retail delivery fee payment, which TikTok's worked example groups with tax.",
          "Divide the Referral fee (ignore the minus sign) by that base. About 0.06 is the published rate. About 0.08 is the reported one. About 0.05 fits fine jewelry or Pre-Owned. Anything well below 0.05 suggests a promotional plan, which TikTok says continues until its promotional period ends. On small orders, rounding to the cent can move the result slightly, so check five or six orders, not one.",
          "Compare by order created date. If orders created before August 4 read 0.06 and later ones read 0.08, your rate changed. Then look for the notice in your Seller Center messages and email, since TikTok says it notifies sellers about 30 days before material changes, and screenshot it.",
          "Check the category each SKU is listed under. A product mapped to a different category can carry a different rate, and the category table is the reference for which rate goes with which category."
        ]
      },
      {
        id: "what-to-do-this-week",
        title: "What to do this week",
        paragraphs: [
          "One settlement export and a spreadsheet column. No new tool."
        ],
        bullets: [
          "Run the check above on five or six clean orders from before and after August 4. Write down the implied rate and the order dates.",
          "If you read 0.06: keep pricing at 6%, but keep an 8% stress case for any SKU you are about to scale into Q4. A low-ticket item with a thin margin is where 40 cents an order hurts first.",
          "If you read 0.08: re-run unit economics at 8% for every SKU under $25, starting with your best sellers. Creator commission is a rate you set, so it is the line you can move fastest; re-price only after you know the new floor.",
          "If you are on a promotional rate: find its end date now. A shop that has never paid 6% should plan for the standard rate, not the promotion.",
          "Compare channels at your real price points on the [fee comparison by item price](/fees/compare-by-item-price), which uses TikTok's published 6%."
        ]
      },
      {
        id: "what-were-watching",
        title: "What we're watching next",
        paragraphs: [
          "We re-check TikTok's fee pages every time we update the [TikTok Shop fee page](/fees/tiktok-shop). The signals that would settle this:"
        ],
        bullets: [
          "A new date or new rates on TikTok's \"Referral Fees by Category\" table. It has read October 8, 2026 since before our October 21 check.",
          "A dated Seller Center notice or email to US sellers announcing 8%. If TikTok publishes one, we will update our fee pages and log it on the [fee change log](/fees/changelog).",
          "Whether any of the trade reports adds a primary source, or whether the August 4 and October 1 accounts converge on one date.",
          "Our [forecast scorecard](/intelligence/forecasts) tracks one TikTok Shop call, F4, on full-year 2026 US GMV. This fee question does not change it, so we have not tied it to this piece. Follow the [intelligence hub](/intelligence) for updates."
        ]
      },
      {
        id: "faq",
        title: "Questions sellers ask",
        paragraphs: [
          "Answers as of November 2, 2026."
        ],
        bullets: [
          "Is the TikTok Shop referral fee 6% or 8% in 2026? TikTok's own US category table, page dated October 8, 2026, says 6% for most categories, with 5% for five fine-jewelry sub-categories and Pre-Owned. Delzonic and FBA Tactics report 8% for most non-food categories from August 4, 2026, but TikTok has not published that rate.",
          "How much does TikTok Shop take from a $20 sale? $1.20 at the published 6%, or $1.60 if your shop is being charged the reported 8%, on a $20 order with no shipping, discount or tax. Buyer-paid shipping is added to the base, so a $20 item with $4 shipping costs $1.44 at 6% (our arithmetic from TikTok's formula).",
          "How do I check my TikTok Shop referral fee rate? Export a settlement report from Finances > Statements or Payouts in Seller Center, open the Order details sheet, and on a completed order with no refund divide the Referral fee by (Customer payment + Platform discounts − Sales tax payment). About 0.06 means 6%, about 0.08 means 8%.",
          "When did the reported 8% start? Reports disagree. Delzonic and FBA Tactics say August 4, 2026; Ecommerce Times says October 1, 2026. TikTok has published neither date.",
          "Does a TikTok-funded discount lower my referral fee? No. TikTok adds platform discounts back into the base, so the fee is charged as if the buyer paid full price. Discounts you fund yourself do reduce what the customer pays, and with it the base."
        ]
      },
      {
        id: "note",
        title: "How this was made",
        paragraphs: [
          "AI-assisted, human-reviewed. TikTok's pages and every third-party report were re-read on November 2, 2026, and are dated as shown. Fee amounts, the per-$10,000 figure and the profit and commission examples are our arithmetic from TikTok's published formula. Examples labeled hypothetical are illustrations, not quotes or measured results."
        ]
      }
    ],
    sources: [
      {
        label: "TikTok Shop (Seller University, US): Referral Fees by Category",
        href: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en",
        context: "Page dated Oct 8, 2026, re-read Nov 2, 2026: 6% for most US categories, 5% for five fine-jewelry sub-categories and Pre-Owned, 3% above $10,000 on Collectibles and Pre-Owned. Formula: rate × (customer payment + platform discount − tax); base includes customer-paid shipping."
      },
      {
        label: "TikTok Shop (Seller University, US): Referral Fee Updates - 2024",
        href: "https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en",
        context: "Page dated 05/08/2025, re-read Nov 2, 2026: 6% per order from Apr 1, 2024; promotional plans continue to their end; 20% refund administration fee capped at $5 per SKU from May 15, 2025; ~30 days' notice of material changes."
      },
      {
        label: "TikTok Shop (Seller University, US): How to Access Your Settlement Report",
        href: "https://seller-us.tiktok.com/university/essay?knowledge_id=2336057241700098&lang=en",
        context: "Page dated 09/11/2025: export path and Order details column definitions, including Referral fee, Customer payment, Platform discounts, Sales tax payment, Ads referral fee discount and affiliate commission formula."
      },
      {
        label: "FBA Tactics: TikTok Shop US Referral Fee Now 8% (Aug 25, 2026, updated Sep 5)",
        href: "https://fbatactics.com/guides/tiktok-shop-fee-increase-2026/",
        context: "Reports 6% to 8% for most non-food US categories on Aug 4, 2026 from trade coverage; notes no TikTok press release."
      },
      {
        label: "Delzonic: TikTok Shop Fee Increase 2026 (Aug 28, 2026)",
        href: "https://delzonic.com/blogs/tiktok-shop-fee-increase-2026/",
        context: "Reports 8% from Aug 4, 2026 and 9.5% to 11% for select beauty and electronics sub-categories; cites no TikTok document."
      },
      {
        label: "beBOLD Digital: TikTok Shop's Reported 8% Referral Fee (Sep 8, 2026, updated Sep 14)",
        href: "https://www.bebolddigital.com/news/tiktok-shop-8-percent-referral-fee",
        context: "Treats 8% as a reported change; says TikTok's public table still shows mostly 5% to 6% and sellers should verify in Seller Center."
      },
      {
        label: "Ecommerce Times: TikTok Shop's Q4 2026 Seller Fee Overhaul (Aug 16, 2026)",
        href: "https://ecommerce-times.com/tiktok-shops-q4-2026-seller-fee-overhaul-is-reshaping-dtc-margins/",
        context: "Gives a different account: 8% from Oct 1, 2026 plus a 1.5% creator facilitation fee; links no TikTok document."
      },
      {
        label: "z.media: How to Sell on TikTok Shop US 2026 (fee section checked Nov 1, 2026)",
        href: "https://www.z.media/insights/how-to-sell-on-tiktok-shop-us-2026",
        context: "Independent guide still listing 6% from TikTok's US table (displayed date Oct 8, 2026)."
      },
      {
        label: "Nolyn: TikTok Shop vs Amazon (checked Nov 2, 2026)",
        href: "https://www.nolyn.ai/compare/tiktok-shop-vs-amazon",
        context: "Independent comparison: TikTok's US page still listed 6% on Nov 2, 2026; 8% appears in third-party articles only."
      },
      {
        label: "MarketplaceBeta: TikTok Shop 6% vs reported 8% explainer (Oct 21, 2026)",
        href: "/fees/tiktok-shop/fee-change-2026",
        context: "Full source list, dollar tables at five price points and step-by-step settlement report check."
      },
      {
        label: "MarketplaceBeta: TikTok Shop fees on a $20 sale",
        href: "/fees/tiktok-shop/on-a-20-sale",
        context: "$1.20 in fees on a $20 sale at the published 6%, by category."
      },
      {
        label: "MarketplaceBeta: TikTok Shop fee page",
        href: "/fees/tiktok-shop",
        context: "Category rates at the published 6%, verified Oct 21, 2026, with the reported 8% noted."
      },
      {
        label: "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        href: "/intelligence/dossier",
        context: "Lists TikTok Shop's 6% to 8% move as unverified at the primary source; TikTok's official fee table named as a monthly signal."
      }
    ]
  },
  {
    "slug": "ups-fedex-2027-rate-increase-small-sellers",
    "seoTitle": "FedEx and UPS 2027 Rate Increase: What Small Sellers Pay",
    "metaDescription": "UPS raises rates Dec 21 and FedEx Jan 4, both 5.9% on average. Why a typical 1–5 lb home delivery rises more, and what to reprice now.",
    "headline": "UPS and FedEx both say 5.9% for 2027. On a small seller's typical box, plan for more",
    "dek": "UPS's increase lands December 21, in the middle of peak. FedEx follows on January 4. On FedEx's own list rates, a 1–5 lb residential Home Delivery package goes up 6.5% to 6.8% once the residential charge is counted, and UPS is adding a 5% fuel surcharge to rates that used to include fuel. Here is the arithmetic, the calendar, and what to change before the first new label prints.",
    "publishedOn": "2026-10-30",
    "updatedOn": "2026-10-30",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "6 min",
    "tags": [
      "parcel",
      "UPS",
      "FedEx",
      "shipping rates",
      "2027"
    ],
    "takeaway": "Do not budget 2027 shipping at 5.9%. On FedEx's published list rates, the light residential packages most small sellers ship rise about 6.5% before fuel, and UPS Small Business Rates customers face a 4.5% rate increase plus a new 5% fuel surcharge from December 21. This week, find out which rate card you actually buy labels on, re-price shipping templates and free-shipping thresholds for orders that ship after December 21, and move off paper shipping documents before January.",
    "forecastIds": [
      "F2"
    ],
    "newsletterSource": "campaign_kw_parcel_2027",
    "sections": [
      {
        "id": "what-changed",
        "title": "What changed",
        "paragraphs": [
          "Both big parcel carriers have now posted their 2027 increases, and both lead with the same number. FedEx said on its rate changes page that standard list rates for US, US export and US import package services rise an average of 5.9% on January 4, 2027, with surcharge and fee changes on the same date, as Supply Chain Dive reported on September 21. UPS followed the week of October 19: daily rates for UPS Ground, UPS Air and international services rise an average net 5.9% on December 21, 2026, per UPS's shipping rates page and Logistics Management, which noted the effective date is a full week earlier than in recent years.",
          "UPS has not yet published its 2027 rate guide or 2027 surcharge amounts. What it has confirmed, on its rates page: Area Surcharge ZIP code lists and some ZIP-to-zone assignments change on December 21, the minimum billable weight for Additional Handling packages rises from 40 lb to 50 lb, and a new per-package surcharge will apply on or after December 21 to Ground and Ground Saver shipments from certain origin ZIP codes for qualified customers, with details promised in early November.",
          "The line most small sellers should read first is on UPS's Small Business Rates page. From December 21, those…26004 tokens truncated…oncern goods coming into the US, and we cover them in our [de minimis analysis](/intelligence/analysis/de-minimis-suspension-small-sellers-2026). The 12.5% Section 301 duty discussed there does not apply to what you mail abroad."
        ]
      },
      {
        "id": "the-rule",
        "title": "The rule in one table",
        "paragraphs": [
          "Every row is the rule's own wording or a close paraphrase. Section numbers refer to the IMM text printed in the Federal Register notice."
        ],
        "table": {
          "caption": "What USPS's new customs-charges rule says, checked October 27, 2026",
          "headings": [
            "Question",
            "What the rule says",
            "Section"
          ],
          "rows": [
            [
              "When does USPS invoice you?",
              "If a customs authority, postal operator (or its agent), customs broker or customs representative in the destination country seeks duties, taxes or import fees from you or USPS, and they have not been paid in full, USPS or its representative \"will send an invoice to the mailer.\"",
              "424.1"
            ],
            [
              "What must you pay?",
              "\"The entire amount due in accordance with the invoice terms, even if the mailer disputes the assessment.\" The rule sets no number of days and no payment method; those are in the invoice.",
              "424.2"
            ],
            [
              "Does a lost or returned parcel change that?",
              "No. The mailer \"is not relieved of its obligation to pay for duties, taxes, and import fees, regardless of whether the item is delivered, lost, damaged, or returned.\"",
              "424.2"
            ],
            [
              "What if you pay late?",
              "Interest accrues at 6 percent per annum until paid in full. USPS may also collect its costs \"to the extent permitted by applicable law,\" and may treat unpaid amounts as revenue deficiencies under DMM 607.3.0.",
              "424.4"
            ],
            [
              "What can you dispute with USPS?",
              "\"Only accounting errors related to Postal Service invoicing.\" Challenges to the amount charged abroad go to the foreign party, \"without involvement from the Postal Service.\"",
              "424.5"
            ],
            [
              "Who checks the foreign amount?",
              "No one at USPS. It \"is not responsible for the accuracy\" of charges calculated by foreign customs, postal, law enforcement or tax authorities.",
              "424.3"
            ],
            [
              "Do you get money back if the foreign side refunds?",
              "USPS will make a corresponding adjustment or refund \"if deemed practical in the Postal Service's reasonable judgment.\" For amounts paid through USPS DDP, refunds follow section 365.",
              "424.6"
            ],
            [
              "Where DDP is required",
              "The mailer \"must send the mailpiece on a delivered duty paid basis\" and make sure all duties, taxes and import fees are paid on time.",
              "112"
            ]
          ]
        }
      },
      {
        "id": "who-is-exposed",
        "title": "Who is exposed: where you can prepay and where you cannot",
        "paragraphs": [
          "Who pays duties on a USPS package abroad depends on the destination. Section 424.1 says it depends on factors \"including, but not limited to, the customs requirements of the destination country.\" USPS's [Prepaid Import Duties page](https://www.usps.com/international/prepaid-import-duties.htm) says that if you do not prepay, \"the recipient will have to pay the required amounts before they can get their package.\" The new rule adds the step after that: if the recipient does not pay and the destination goes after you or USPS, USPS invoices you.",
          "The way to prepay is USPS Delivered Duty Paid. It works only with Priority Mail Express International, Priority Mail International and First-Class Package International Service. It is not available with First-Class Mail International, International Priority Airmail or M-bag service, and only through USPS systems: a Post Office counter, Click-N-Ship, certain USPS APIs or USPS Global Shipping Software. Shippers who create their own manifests or pay by permit cannot use it. USPS charges no fee for DDP, but its service provider does, and that fee is included in the quote along with the duties, taxes and fees."
        ],
        "table": {
          "caption": "USPS Delivered Duty Paid by destination (Postal Bulletin of July 23, 2026; USPS page read October 27, 2026)",
          "headings": [
            "Status",
            "Destinations",
            "Limits in the listing"
          ],
          "rows": [
            [
              "Required for dutiable items",
              "Andorra, Belgium, Denmark, Finland, France (including French Guiana, Guadeloupe, Martinique, Mayotte, Monaco and Reunion), Germany, Luxembourg, Portugal",
              "Not available for items declared as gifts with a value up to 45 EUR. Germany: not for Helgoland and Büsingen."
            ],
            [
              "Available, not required",
              "Austria, Canada, Estonia, Italy, Malta, Netherlands, Slovakia, Spain, Sweden, United Kingdom",
              "UK: only dutiable items valued 135 to 900 GBP sent by Priority Mail Express International or Priority Mail International. EU listings: not for gifts declared up to 45 EUR."
            ],
            [
              "Not listed",
              "Every other destination",
              "USPS says more countries are expected to be added. Until then there is no USPS way to prepay."
            ]
          ]
        }
      },
      {
        "id": "what-it-can-cost",
        "title": "What the charges can look like: the EU example",
        "paragraphs": [
          "The EU is the case USPS had in mind, and its charges are public. The European Commission says that from July 1, 2026 a temporary €3 customs duty applies on low-value parcels, per item by tariff classification and not by quantity: five T-shirts cost €3, and three T-shirts and a watch cost €6. USPS describes the same duty as \"flat, nonrefundable\" and says it applies to business-to-consumer packages up to €150. From November 1, 2026 the EU adds a €2 Union handling fee. The Commission's customs-reform page says so, and Dutch Customs describes it as €2 per declaration line, regardless of value, and non-refundable when delivery fails or the recipient refuses or returns the shipment. VAT and country-specific fees come on top.",
          "Hypothetical, using only those published amounts: a parcel with 3 T-shirts and a watch that a buyer in the Netherlands refuses. Under our reading that two tariff classifications make two declaration lines, the duty is €6 and, from November 1, the handling fee is €4, so €10 before VAT and any national fees. The numbers are small. The point is that none of it is refundable, and since October 19 USPS has a written process to invoice it to you if the destination looks to the sender."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: the refused parcel is the exposure",
        "paragraphs": [
          "Hypothesis, not a USPS statement: on a delivered order the buyer pays at the door and the question never reaches you. The new exposure is the parcel that is refused, abandoned or returned, where the destination may now look to the sender and USPS has a billing path. Before October 19 a refusal cost you the postage, the return and the sale. Now it can also cost the foreign charges, which USPS will not let you argue about and which are not refunded when you refund the buyer (the EU's €3 duty and €2 fee are non-refundable, per USPS and Dutch Customs). On a €15 item, €5 of EU duty and handling fee is a third of the sale before VAT (hypothetical).",
          "Where the destination requires DDP, the exposure is yours from the start, because IMM 112 now says you must send those parcels on a DDP basis. USPS's notice says the invoice can follow when charges \"have not been paid in full using USPS Delivered Duty Paid service,\" so our reading is that paying in full through DDP removes the usual trigger. It is not a blanket shield. USPS's page says the DDP provider covers a shortfall between its quote and what customs actually charges only subject to the terms and limitations in its terms of service, and when a limitation applies the customer pays the provider the balance.",
          "Prepaying also changes your price. The quote includes the duties, taxes, fees and the provider's fee, and USPS adds it to the postage. That cost is real whether the buyer pays it at checkout or you absorb it, so decide before you list which destinations you will serve and what you charge them."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "None of this needs new software. It needs a list of destinations and a decision for each."
        ],
        "bullets": [
          "List every country you shipped to in the last 90 days and mark each as required, available or not listed using the table above. Check your own label provider's list as well, because USPS's list covers only USPS systems.",
          "For required countries, ship only if your label tool prepays duties, whether that is USPS DDP or another solution your marketplace or label provider offers. IMM 362 says USPS-approved PC Postage providers and third-party marketplaces may use alternative solutions for collecting and remitting duties, and USPS employees accept those parcels as they would DDP ones. Ask your provider in writing which solution it uses.",
          "For available countries, use DDP on orders where a buyer who refuses would cost you most: low-value items and anything bound for the EU. Add the quoted duties, taxes and fees to the shipping charge or the price.",
          "For countries you cannot prepay, choose: stop shipping there, add a clear buyer-pays-duties notice to the listing and order message, or accept the risk with the numbers in front of you. Keep the notice, the customs form and the tracking number for each order so a later invoice can be matched to it.",
          "Make customs forms exact. The EU duty counts per tariff classification, and USPS's system assigns codes from your item descriptions. IMM 112 now says a mailer that provides false or incomplete information may have the parcel returned or confiscated and \"may be subject to additional charges.\"",
          "Open invoices the day they arrive. You can contest USPS accounting errors only. The foreign amount must be challenged with the foreign customs authority, postal operator or broker, and USPS does not wait for that to finish.",
          "If you want to weigh in on the rule, USPS takes comments until November 18, 2026 at PCFederalRegister@usps.gov with the subject line \"Customs Requirements and Payment Procedures.\""
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask about USPS duty billing",
        "paragraphs": [
          "Answers are from the Federal Register notice, USPS's own pages and the EU authorities named, read October 27, 2026. Where the sources are silent, we say so."
        ],
        "bullets": [
          "Does USPS bill me if the recipient refuses the package? The rule does not mention refusals by name. It says you remain liable \"regardless of whether the item is delivered, lost, damaged, or returned,\" and a refused parcel usually ends as a returned one. The trigger is a destination party seeking unpaid amounts from you or USPS, so a refusal that leads to such a demand can end in an invoice. USPS's DDP page adds that duties, taxes and fees on a refused or undeliverable DDP package are not refunded unless the provider's terms say so.",
          "What is USPS DDP and which services include it? It is a service that lets you prepay a destination's duties, taxes and fees at the time of mailing. It covers Priority Mail Express International, Priority Mail International and First-Class Package International Service, to the countries in the table above. USPS charges no fee itself, but its service provider's fee is built into the quote.",
          "Do returned or lost items still generate a bill? Yes, if the destination seeks unpaid charges from you or USPS. Section 424.2 says the obligation does not depend on delivery, loss, damage or return.",
          "Is there interest on late payment? Yes. Section 424.4 sets interest at 6 percent per annum if payment is not received by the invoice due date, plus collection costs where the law allows. It does not say how many days you get, because that is in the invoice terms.",
          "Does this affect Etsy or eBay international orders? It affects any order where you buy a USPS international label and are the sender on the customs form. Etsy's help center says US sellers can buy USPS labels, domestic and international, on Etsy, and it recommends carriers that offer DDP. We could not verify whether Etsy's USPS international labels prepay duties automatically, or how Etsy's or eBay's US programs treat a refused parcel. IMM 362 says marketplaces and label providers may use their own duty-collection solutions, so read your provider's terms before assuming either way.",
          "Can I dispute the duty amount with USPS? Only USPS accounting errors. The amount the foreign side charged must be challenged with the foreign party, and you must pay the invoice meanwhile.",
          "Does this apply only to the EU? No. USPS wrote it because of the EU, but section 424 applies to any destination country where a relevant party seeks unpaid duties, taxes or import fees from you or USPS.",
          "Is this the same as the US ending de minimis? No. That concerns goods mailed into the US. This rule concerns what other countries charge on parcels you mail out."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "November 1, 2026: the EU's €2 handling fee, which the Commission says starts then. USPS's DDP page did not mention it when we read it on October 27, so watch whether USPS quotes it in DDP prices and whether it updates its country listings.",
          "November 18, 2026: the end of the comment period. Because this is an interim final rule, USPS can revise it. Watch for invoice terms, such as due dates and payment methods, which the rule leaves to the invoice.",
          "Additions to the DDP country list. USPS says more destinations are expected. Each one moves a country from \"not listed\" to a place you can prepay. The rest of our shipping coverage is in the [parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar), and our wider analysis is on the [intelligence dashboard](/intelligence). Our dated calls are on the [forecast scorecard](/intelligence/forecasts); none covers this rule today. Our broader marketplace analysis is in the October [Intelligence Dossier](/intelligence/dossier). If your marketplace fees stack with shipping, see our [Etsy](/fees/etsy) and [eBay](/fees/ebay) fee pages."
        ]
      }
    ],
    "sources": [
      {
        "label": "Federal Register: Customs Requirements and Payment Procedures for Certain Customs Charges (91 FR 66000, Oct 19, 2026)",
        "href": "https://www.federalregister.gov/documents/2026/10/19/2026-21310/customs-requirements-and-payment-procedures-for-certain-customs-charges",
        "context": "USPS rule, document 2026-21310, effective October 19, 2026, comments due November 18, 2026. New IMM 424 (invoice, payment even if disputed, delivered/lost/damaged/returned, 6% interest, disputes, adjustments); revised IMM 112, 131.34 and 361.13; the EU rationale. Read in full Oct 27, 2026."
      },
      {
        "label": "GovInfo: Federal Register, October 19, 2026, document 2026-21310",
        "href": "https://www.govinfo.gov/content/pkg/FR-2026-10-19/html/2026-21310.htm",
        "context": "Official printed text; shows the action type as an interim final rule."
      },
      {
        "label": "USPS: Prepaid Import Duties (read Oct 27, 2026)",
        "href": "https://www.usps.com/international/prepaid-import-duties.htm",
        "context": "Eligible DDP countries; the three eligible services; how to buy; provider fee and landed cost guarantee subject to limitations; refused or undeliverable packages not refunded; the EU €3 duty summary; \"More countries are expected to be added.\""
      },
      {
        "label": "USPS Postal Bulletin 22707: IMM Revision: Availability of USPS Delivered Duty Paid (Jul 23, 2026)",
        "href": "https://about.usps.com/postal-bulletin/2026/pb22707/html/updt_002.htm",
        "context": "IMM 362 and the country listings: which destinations require or offer DDP, services covered and excluded, gifts up to 45 EUR, UK 135 to 900 GBP limit, and the sentence allowing PC Postage providers and third-party marketplaces to use alternative solutions."
      },
      {
        "label": "European Commission: €3 customs duty for low-value parcels (Jun 29, 2026)",
        "href": "https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en",
        "context": "Temporary €3 duty from July 1, 2026, per item by tariff classification and not quantity; the T-shirts and watch example; seller or importer responsible for declaring and paying."
      },
      {
        "label": "European Commission: EU Customs Reform (news of Oct 7, 2026)",
        "href": "https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en",
        "context": "\"From 1 November 2026, the EU will apply the €2 Union handling fee.\""
      },
      {
        "label": "Dutch Customs: Handling fee for e-commerce (last updated Oct 22, 2026)",
        "href": "https://www.douane.nl/en/themes/import-and-export/import/e-commerce/handling-fee-for-e-commerce/",
        "context": "€2 per declaration line from November 1, 2026, regardless of value; example of 3 declaration lines costing €6; non-refundable including when the recipient refuses or returns."
      },
      {
        "label": "Irish Revenue: Union Handling Fee, 1 November 2026 (published Sep 30, 2026)",
        "href": "https://www.revenue.ie/en/customs/individuals/union-handling-fee/index.aspx",
        "context": "€2 per distinct item regardless of value, separate from and in addition to the €3 duty; non-refundable even when goods are faulty or returned."
      },
      {
        "label": "Etsy Help: Information for Managing International Shipments",
        "href": "https://help.etsy.com/hc/en-us/articles/360001987487-Information-for-Managing-International-Shipments",
        "context": "Etsy recommends DDP carriers and notes sellers are responsible for customs-form accuracy; lists USPS among commonly used DDP carriers for US-based sellers. Read Oct 27, 2026."
      },
      {
        "label": "Etsy Help: USPS Shipping Labels on Etsy",
        "href": "https://help.etsy.com/hc/en-us/articles/360000336887-USPS-Shipping-Labels-on-Etsy",
        "context": "US sellers can buy USPS labels for domestic and international addresses on Etsy; the seller completes the required forms. Read Oct 27, 2026."
      },
      {
        "label": "MarketplaceBeta: De minimis suspension and small sellers",
        "href": "/intelligence/analysis/de-minimis-suspension-small-sellers-2026",
        "context": "The inbound US de minimis change, kept separate from this outbound rule."
      }
    ]
  },
  {
    slug: 'de-minimis-suspension-small-sellers-2026',
    seoTitle: 'De Minimis Suspension: What It Means for Small Sellers',
    metaDescription: 'From Jan 20, 2027, mail parcels carrying Chapter 98 or 99 duties lose postal informal entry. China-made goods are a common case. What to do now.',
    headline: 'International mail with Chapter 98 or 99 duties loses its easy customs lane on January 20. Find out how your supplies arrive',
    dek: 'The $800 duty-free exemption is suspended indefinitely and repealed by statute from July 2027. The last soft spot was international mail. In a rule published October 22, CBP moved to January 20, 2027 the date after which mail shipments carrying Chapter 98 or 99 duties, claiming Chapter 98 or free-trade-agreement duty-free treatment, or subject to other agencies\' requirements can no longer use postal informal entry. The rule says filers then choose formal entry or the voluntary Entry Type 13 test. It is not China-specific, but products of China are a common case: since July 24 they carry a 12.5% Section 301 duty, a Chapter 99 duty, unless exempt. Here is what changed, who it hits, and what to check before you place Q1 orders.',
    publishedOn: '2026-10-26',
    updatedOn: '2026-10-26',
    author: 'MarketplaceBeta Intelligence',
    readTime: '7 min',
    tags: ['de minimis', 'customs', 'importing', 'sourcing', 'landed cost'],
    takeaway: 'If any of your parts, packaging or inventory arrives from overseas by international mail, ask each supplier this week who files the US customs entry after January 20, 2027, whether the duty is in the price, and what the new entry will cost. Re-price those inputs at the full duty for their tariff line, not the old flat rate, and decide whether to pull Q1 mail orders forward or consolidate them into fewer, larger shipments.',
    forecastIds: ['F10'],
    newsletterSource: 'campaign_kw_de_minimis',
    sections: [
      {
        id: 'what-changed',
        title: 'What changed',
        paragraphs: [
          'On October 22, CBP published a final rule in the Federal Register (91 FR 66638) moving a compliance date from October 22, 2026 to January 20, 2027. The date applies to 19 CFR 145.12(a)(2)(v) and (vi), which make international mail shipments ineligible for CBP\'s new postal informal entry process if they are subject to duties under Chapter 98 or Chapter 99 of the tariff schedule, claim Chapter 98 or free-trade-agreement duty-free treatment, or are subject to other agencies\' import requirements. This is not limited to goods from China. The rule says that at the end of the delay, filers "may choose to file formal entry" or take part in the Entry Type 13 test for eligible shipments. It describes that test as a voluntary, optional alternative to formal entry, and says it began on September 22. CBP gave the reason as more time for importers, brokers and logistics providers to update their systems. CBP\'s e-commerce FAQ, last modified September 2, still shows October 22 as the effective date, so check the Federal Register rule, not the FAQ. The FAQ says ineligible merchandise must be entered "under another appropriate entry process, such as an Entry Type 13 or formal entry."',
          'CBP\'s October 14 news release words it differently. It says that from January 20 CBP "requires the use" of Entry Type 13 for informal entry of international postal shipments subject to Section 201, 232 or 301 duties or the jurisdiction of another agency, and that otherwise formal entry is required. It does not mention Chapter 98 or all of Chapter 99, and it does not call the test voluntary. We could not reconcile that wording with the Federal Register rule, so ask your broker which applies to your shipments.',
          'This is the latest step in a year of de minimis changes. Duty-free treatment for shipments of $800 or less was suspended for all countries from August 29, 2025 under Executive Order 14324. When the Supreme Court struck down the IEEPA tariffs on February 20, 2026, Executive Order 14388 kept the suspension in place the same day. On June 24, 2026, CBP wrote an indefinite suspension into its own regulations for both mail (91 FR 37801) and every other mode (91 FR 37789). The One Big Beautiful Bill Act ends the exemption by statute from July 1, 2027, per CBP\'s June rule, which also says CBP\'s regulatory suspension would stay in force even if the Executive Order were amended or removed.',
          'Mail was treated differently until July 24. Under the interim process, CBP\'s June rule says, mail shipments that would have been de minimis paid only the flat 10% Section 122 surcharge, with no product classification required. The new postal informal entry process, in effect since July 24, requires the 10-digit tariff classification for every item and collects all applicable duties, per CBP\'s rule and FAQ. Only the owner or purchaser of the goods, or a licensed customs broker they designate, can file, and the filer needs a customs bond on file. Mail entries remain exempt from the merchandise processing fee except Inbound EMS, per the FAQ. CBP sampled 392,312 low-value non-mail entries from September to November 2025, found an average non-IEEPA duty of 8.62% of value, and used that rate to estimate that mail duties would rise by about $316 million a year.',
          'The rate change underneath happened the same day. The 150-day Section 122 surcharge expired on July 24, and USTR\'s Section 301 forced-labor tariffs took effect for goods entered from 12:01 a.m. Eastern that day, per USTR\'s Federal Register notice (91 FR 47318) and BDO. Those duties cover all products of 60 economies, minus listed exemptions, under tariff headings 9903.05.20 through 9903.05.84, which are in Chapter 99. Products of China pay 12.5%. Seventeen economies, including Canada, Mexico, India and the United Kingdom, pay 10%, per USTR.',
        ],
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters: the mail lane was the last simple one',
        paragraphs: [
          'Put those two facts together. Our reading, which you should confirm with a licensed customs broker for your own tariff lines: a mail parcel of Chinese-made goods that is not on USTR\'s exemption list carries a Chapter 99 duty, so from January 20 it cannot use the postal informal entry process. China is a common case, not the only one. Any mail parcel carrying Chapter 98 or 99 duties is covered, as are parcels subject to other agencies\' requirements, per the Federal Register rule. Someone with the right to make entry has to file formal entry or, per the rule and CBP\'s FAQ, use the voluntary Entry Type 13 test. The test is open to mail shipments of $2,500 or less, including Chapter 98 and 99 goods, and requires an importer number, every 10-digit classification, and a bond, per CBP\'s FAQ and its June 24 test notice. Goods under antidumping or countervailing duty orders, or quotas, need formal entry either way, per the FAQ.',
          'CBP said in its June rule why it is doing this: under the interim process, importers could avoid Section 201, 232 and 301 duties by sending goods through the mail. That gap is closing in two steps. Full duty collection on mail started on July 24. The data and filing requirements for Chapter 98 and 99 goods arrive January 20.',
          'Three kinds of sellers feel it. Makers and small brands who buy parts, filament, tools or packaging from overseas platforms and suppliers that ship by mail. Sellers who source or dropship low-value inventory directly from overseas to US buyers. And sellers outside the US who sell to US buyers on Etsy: since July 9, Etsy requires Delivered Duty Paid shipping on US orders, and if a carrier charges the buyer tariffs or collection fees, Etsy refunds the buyer and deducts the charge from the seller, per Etsy\'s announcement and Shipping Policy.',
          'Our [Intelligence Dossier](/intelligence/dossier) called the end of de minimis a durable relative gain for sellers who hold US inventory, because direct-from-China retail lost its structural duty advantage. The January 20 date is the mail half of that story. Our hypothesis, which we have not measured: after January 20, overseas sellers and platforms that still ship small orders by mail will either charge more to cover the entry work, push buyers to Delivered Duty Paid prices, or move volume to express couriers and bulk shipments into US warehouses. If you buy inputs that way, your price or your delivery time is likely to change in Q1.',
        ],
        table: {
          caption: 'Hypothetical: a $40 order of China-made printer parts shipped by international mail, assuming a 2.5% base (MFN) duty on the tariff line and no exemption · Rates: CBP June 24, 2026 rules; USTR Section 301 notice (Jul 2026); CBP Oct 22, 2026 notice',
          headings: ['When it enters', 'Duty basis', 'Duty on $40', 'Who can file the entry'],
          rows: [
            ['Feb 24 – Jul 23, 2026 (interim mail process)', 'Flat 10% Section 122 rate only', '$4.00', 'Qualified party on a monthly worksheet'],
            ['Jul 24, 2026 – Jan 19, 2027 (postal informal entry)', 'All applicable duties: 2.5% base + 12.5% Section 301', '$6.00', 'Owner, purchaser or licensed broker, with a bond'],
            ['From Jan 20, 2027', 'Same duties', '$6.00', 'Formal entry, or the voluntary Entry Type 13 test (per the Federal Register rule); broker fees are extra and vary'],
          ],
        },
      },
      {
        id: 'the-math',
        title: 'The math, in one line',
        paragraphs: [
          'On the hypothetical order above, the duty goes from $4.00 to $6.00, a 50% rise, before any broker or carrier entry fee. Your real line may carry other Chapter 99 duties, or an exemption, so take the rate from your broker\'s entry paperwork, not from this table. If you buy many small mail orders, the per-entry fee can end up larger than the duty. That is the number to get quoted before January 20.',
        ],
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'This is not legal or customs advice. For classification and entry questions, use a licensed customs broker. For most small sellers, the work is a list and some emails:',
        ],
        bullets: [
          'List every supplier or platform that ships to you from outside the US, and mark which arrive by international mail. Mail items carry a 13-character Universal Postal Union (S10) tracking number, per CBP\'s FAQ.',
          'Email each mail supplier three questions: who files the US entry for my orders after January 20, 2027; is the duty included in the price I pay; and what extra fee, if any, will I be charged per shipment. Get the answers in writing.',
          'Re-cost those inputs at the full duty for their tariff line plus any entry fee, not the old flat 10%. Re-run margins on the products that use them with the [product profitability guide](/guides/product-profitability) and your [marketplace fee pages](/fees), and check the [fee change log](/fees/changelog) for fees that moved this year.',
          'Decide on Q1 timing now. If parts or supplies that carry Chapter 98 or 99 duties (China-made goods are a common case) come by mail and you will need them in January or February, either place those orders early enough to enter before January 20, or ask a broker to quote consolidating them into fewer, larger express or freight shipments. Our hypothesis is that one consolidated entry will beat dozens of small mail entries once each needs a filer, but run it with a real quote.',
          'If you sell to US buyers from outside the US, or fulfill US Etsy orders from overseas stock, ship Delivered Duty Paid and set US-specific prices that include the duty. Check your costs on our [Etsy fee page](/fees/etsy).',
          'If you were the importer of record on 2025 shipments, the separate IEEPA refund clock is still running: see our [IEEPA refund analysis](/intelligence/analysis/ieepa-tariff-refunds-marketplace-sellers).',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'Forecast F10 on our [forecast scorecard](/intelligence/forecasts): de minimis is not restored before the statutory repeal takes effect in July 2027. It was logged on October 14, resolves July 1, 2027, and will be graded hit or miss against the Federal Register and CBP record. CBP\'s June rule makes its regulatory suspension independent of the Executive Order, but a congressional reversal is the stated way the call could fail, so we keep it open until it resolves.',
          'Dated checkpoints: whether CBP holds January 20, 2027 or moves it again (it has already moved once, from October 22); updates to CBP\'s e-commerce FAQ, which still shows the old date, and whether CBP reconciles its October 14 news release with the Federal Register rule on scope and on whether Entry Type 13 is mandatory; how long the Entry Type 13 test runs, which CBP says continues until it announces an end in the Federal Register; changes to USTR\'s Section 301 exemption lists; the Federal Circuit appeal over the Section 122 surcharge, which the Court of International Trade held unlawful on May 7 before the appeals court stayed that ruling on May 12, per BDO; and July 1, 2027, when the statutory repeal takes effect. We track trade and logistics coverage on the [intelligence dashboard](/intelligence).',
        ],
      },
    ],
    sources: [
      { label: 'Federal Register: Indefinite suspension of the de minimis exemption for mail shipments and new postal informal entry process; delayed compliance extension (final rule, 91 FR 66638, Oct 22, 2026)', href: 'https://www.federalregister.gov/documents/2026/10/22/2026-21600/indefinite-suspension-of-the-de-minimis-exemption-for-mail-shipments-and-new-postal-informal-entry', context: 'Compliance date for 19 CFR 145.12(a)(2)(v) and (vi) moved from Oct 22, 2026 to Jan 20, 2027; scope is PGA requirements, Chapter 98 or 99 duties, and Chapter 98 or FTA duty-free claims; footnote 3: filers may choose formal entry or the voluntary Entry Type 13 test for eligible shipments, which began Sep 22, 2026; reason given.' },
      { label: 'Federal Register: Modification of the test of the new electronic informal entry process for mail (91 FR 66707, Oct 22, 2026)', href: 'https://www.federalregister.gov/documents/2026/10/22/2026-21570/modification-of-the-test-of-the-new-electronic-informal-entry-process-for-mail', context: 'Entry Type 13 open to mail shipments of $2,500 or less, including Chapter 98 and 99 goods; footnote cites Section 201, 232 and 301 duties as examples; test temporarily accepts filings without complete PGA data.' },
      { label: 'CBP: International Mail Entry Type 13 mandatory implementation date extended to Jan. 20, 2027 (news release, Oct 14, 2026)', href: 'https://www.cbp.gov/newsroom/national-media-release/international-mail-entry-type-13-mandatory-implementation-date', context: 'Says Entry Type 13 becomes mandatory Jan 20, 2027 for mail subject to Section 201, 232 or 301 duties or PGA jurisdiction, otherwise formal entry; wording differs from the Federal Register rule.' },
      { label: 'Federal Register: Indefinite suspension of the de minimis exemption for mail shipments and new postal informal entry process (91 FR 37801, Jun 24, 2026)', href: 'https://www.federalregister.gov/documents/2026/06/24/2026-12669/indefinite-suspension-of-the-de-minimis-exemption-for-mail-shipments-and-new-postal-informal-entry', context: 'Suspension under CBP\'s own authority; interim mail process applied only the 10% Section 122 rate; new process requires 10-digit classifications and collects all applicable duties from Jul 24, 2026; Chapter 99 goods excluded; Section 201/232/301 avoidance via mail; 8.62% average non-IEEPA duty on 392,312 sampled entries and ~$316M annual duty increase; One Big Beautiful Bill Act repeal effective Jul 1, 2027; suspension survives changes to the Executive Order.' },
      { label: 'Federal Register: Indefinite suspension of the de minimis exemption, all modes other than mail (91 FR 37789, Jun 24, 2026)', href: 'https://www.federalregister.gov/documents/2026/06/24/2026-12670/indefinite-suspension-of-the-de-minimis-exemption-for-merchandise-arriving-through-all-modes-other', context: 'Non-mail shipments of $800 or less must use formal or informal entry; EO 14388 continued the suspension on Feb 20, 2026.' },
      { label: 'Federal Register: Test of the new electronic informal entry process for mail (Entry Type 13), Jun 24, 2026', href: 'https://www.federalregister.gov/documents/2026/06/24/2026-12668/test-of-the-new-electronic-informal-entry-process-for-mail', context: 'Entry Type 13 open to mail shipments of $2,500 or less, including Chapter 99 goods; AD/CVD and quota goods need formal entry; runs until concluded by notice.' },
      { label: 'CBP: E-commerce frequently asked questions (last modified Sep 2, 2026)', href: 'https://www.cbp.gov/trade/basic-import-export/e-commerce/faqs', context: 'Who may file; bond requirement; data elements including 13-character UPU tracking number; MPF exemption for mail except Inbound EMS; ineligible merchandise goes to "an Entry Type 13 or formal entry"; Entry Type 13 described as a voluntary test; still shows the Oct 22, 2026 date.' },
      { label: 'The White House: Continuing the suspension of duty-free de minimis treatment for all countries (EO 14388, Feb 20, 2026)', href: 'https://www.whitehouse.gov/presidential-actions/2026/02/continuing-the-suspension-of-duty-free-de-minimis-treatment-for-all-countries/', context: 'Suspension continued after the Learning Resources decision, including for international mail.' },
      { label: 'Federal Register: USTR notice of actions in Section 301 forced-labor investigations (91 FR 47318, Jul 28, 2026)', href: 'https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies', context: 'Tariffs on all products of 60 economies with exemptions, from 12:01 a.m. ET Jul 24, 2026; headings 9903.05.20-9903.05.84; 12.5% on products of China.' },
      { label: 'USTR: USTR takes action in forced labor Section 301 investigations (Jul 2026)', href: 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ustr-takes-action-forced-labor-section-301-investigations', context: '10% for 17 economies including Canada, Mexico, India and the United Kingdom; 12.5% for most others.' },
      { label: 'BDO: IEEPA tariff refunds, frequently asked questions', href: 'https://www.bdo.com/insights/tax/ieepa-tariff-refunds-frequently-asked-questions', context: 'Section 122 surcharge began Feb 24 and expired Jul 24, 2026, when Section 301 forced-labor duties took effect; CIT held Section 122 duties unlawful May 7, stayed by the Federal Circuit May 12.' },
      { label: 'Etsy Community: Upcoming policy changes for orders shipped to the US', href: 'https://community.etsy.com/forum/announcements-290/topic/upcoming-policy-changes-for-orders-shipped-to-the-us-183836/', context: 'DDP expected from Jul 9; carrier tariff or collection charges refunded to buyers and deducted from the seller.' },
      { label: 'Etsy: Shipping Policy (effective Jul 9, 2026)', href: 'https://www.etsy.com/legal/shipping', context: 'Orders shipped to the US must use a Delivered Duty Paid method, with narrow exceptions.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: 'End of de minimis as a durable relative gain for sellers holding US inventory; forecast F10.' },
    ],
  },
  {
    slug: 'ieepa-tariff-refunds-marketplace-sellers',
    seoTitle: 'IEEPA Tariff Refunds for Amazon and Marketplace Sellers',
    metaDescription: 'Only the importer of record gets IEEPA refunds, and the easy filing window closes entry by entry. Who qualifies, the dates, and what to file this week.',
    headline: 'The IEEPA refund clock is running on your holiday 2025 inventory. Check who your importer of record was',
    dek: 'CBP is paying back the tariffs the Supreme Court struck down, but only to the importer of record, and only through the simple filing path for entries that are unliquidated or less than 80 days past liquidation. For goods entered last October through December, that window is closing now. Here is who can claim, what the class action does and does not do, and what to check this week.',
    publishedOn: '2026-10-23',
    updatedOn: '2026-10-23',
    author: 'MarketplaceBeta Intelligence',
    readTime: '7 min',
    tags: ['tariffs', 'IEEPA refunds', 'importing', 'cash flow', 'Q4 2026'],
    takeaway: 'If your business was the importer of record, pull your entry list from ACE this week and file for every entry still inside the 80-day window, starting with last year\'s holiday inventory. If a supplier or forwarder was the importer, the refund is theirs by default: ask them in writing what they are claiming on your goods. Treat any refund as one-off cash, not a reason to cut prices.',
    forecastIds: ['F8'],
    newsletterSource: 'campaign_kw_ieepa_refund',
    sections: [
      {
        id: 'what-changed',
        title: 'What changed',
        paragraphs: [
          'The Supreme Court ruled on February 20, 2026, in Learning Resources v. Trump, that the tariffs imposed under the International Emergency Economic Powers Act (IEEPA) were unlawful. Per BDO\'s refund FAQ, IEEPA duties paid from February 4, 2025 (the fentanyl tariffs on China, Canada and Mexico) and from April 5, 2025 (the reciprocal tariffs on nearly every country) through February 24, 2026 are eligible for refund.',
          'CBP pays the refunds through a tool called CAPE in its ACE Portal. Phase 1 opened April 20 for entries that are unliquidated or no more than 80 days past liquidation. Phase 2 opened June 29 for certain reconciliation entries. Phase 3 opened October 6 for older, "finally liquidated" entries, but CBP limits it to importers that sued at the Court of International Trade and hold a court order for reliquidation, per CBP\'s IEEPA refunds page and Phillips Lytle. CBP says valid refunds, with interest, generally arrive 60 to 90 days after a filing is accepted. Trade lawyers at The National Law Review reported on October 19 that most Phase 1 refunds are arriving within about 60 days.',
          'The money is large and moving. CBP told the court that, as of July 31, about $128.68 billion in potential and certified refunds had been accepted for processing, per BDO\'s summary of CBP\'s August 4 declaration. Companies are booking it: Hydro Flask owner Helen of Troy expects $80.5 million in refunds this fiscal year and recognized $26.9 million in the quarter ended August 31, Supply Chain Dive reported on October 22.',
          'On October 8 the Court of International Trade certified a class in Freestyle World v. CBP (Slip Op. 26-123): all importers of record that paid the challenged IEEPA duties between February 1, 2025 and February 19, 2026 and have not filed their own suit. Membership is automatic. Certification is not a refund order. As of October 23 we have found no class-wide order directing CBP to reliquidate entries, and commentators at Leyton and Lieberman PLLC do not expect one before the government answers the class complaint.',
        ],
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters: the refund goes to whoever was the importer',
        paragraphs: [
          'Only the importer of record for an entry, or the customs broker that filed it, can file a CAPE declaration, per CBP. Anyone else in the chain who absorbed the tariff in a higher price, including a marketplace seller who bought goods landed, cannot file. BDO notes those parties can negotiate with the importer for their share, or be named to receive the refund on CBP Form 4811, but only if that designation is on the entry before the importer files in CAPE. Once an entry has gone through CAPE, the notify party cannot be added.',
          'Our October [Intelligence Dossier](/intelligence/dossier) made the same point as a structural call: refunds flow only to importers of record, so sellers who bought landed from middlemen captured none of the refund and paid a markup on someone else\'s duty handling. Our hypothesis, which we have not measured: smaller marketplace sellers who bought on DDP terms or through a forwarder that acted as importer are the least likely to see any of this money unless they ask for it.',
          'The second problem is timing. CBP liquidates most formal entries automatically about 314 days after entry, per the Congressional Research Service. Phase 1 takes entries up to 80 days past that date, a cut-off CBP built so it can finish reliquidating before its 90-day voluntary reliquidation authority under 19 U.S.C. § 1501 runs out, per The National Law Review. So every week, another week of entries leaves the simple path and lands in the court-order queue. On those dates, goods entered in October through December 2025, which for many sellers was last year\'s holiday inventory, are leaving the window between now and the end of December.',
        ],
        table: {
          caption: 'Estimated last day to file in CAPE Phase 1, by entry date · Hypothetical: assumes CBP\'s typical liquidation 314 days after entry (Congressional Research Service) plus the 80-day Phase 1 limit (CBP). Your actual liquidation dates are in ACE.',
          headings: ['Entry date', 'Typical liquidation date', 'Estimated last day for Phase 1'],
          rows: [
            ['Sep 1, 2025', 'Jul 12, 2026', 'Sep 30, 2026 (passed)'],
            ['Oct 1, 2025', 'Aug 11, 2026', 'Oct 30, 2026'],
            ['Nov 1, 2025', 'Sep 11, 2026', 'Nov 30, 2026'],
            ['Dec 1, 2025', 'Oct 11, 2026', 'Dec 30, 2026'],
            ['Jan 15, 2026', 'Nov 25, 2026', 'Feb 13, 2027'],
            ['Feb 23, 2026', 'Jan 3, 2027', 'Mar 24, 2027'],
          ],
        },
      },
      {
        id: 'the-finally-liquidated-bucket',
        title: 'If your entries are already past the window',
        paragraphs: [
          'Entries more than 80 days past liquidation are, for now, outside CAPE unless you have your own court order. You have three routes, and none is a sure thing yet. You can rely on the certified class, which costs nothing to join but has no refund order or timetable. You can file your own suit at the Court of International Trade, which The National Law Review\'s trade lawyers still recommend for significant sums because it is faster and more certain. Or, for entries liquidated within the last 180 days, you can file a protest, which BDO says many importers are doing to preserve their rights.',
          'Watch the outer deadline. Practitioners read the two-year statute of limitations for refund suits as starting to expire in February 2027 for China entries, March 2027 for Canada and Mexico, and April 2027 for other countries, with dates varying by entry, per The National Law Review. BDO puts the two key dates at February 4, 2027 for the fentanyl tariffs and April 5, 2027 for the reciprocal tariffs. A court ruling or a class-wide order could change the picture before then.',
          'Two traps. The Congressional Research Service notes that informal entries, the simplified process for most shipments valued at $2,500 or less, are generally treated as liquidated when the duty is paid. If most of your imports came in by express courier, ask whoever cleared them how CAPE handled those entries before you assume they qualify for Phase 1. And CBP warns that scammers are contacting importers about refunds: file only through your own ACE Portal account or your broker.',
        ],
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'This is not legal advice. For large sums, talk to a licensed customs broker or a trade attorney. For most sellers, the work is a few hours of record-pulling:',
        ],
        bullets: [
          'Find out who the importer of record was on every 2025 and early-2026 shipment. It is on the entry summary (CBP Form 7501) and in your broker\'s records. If it was you, you need an ACE Portal importer account and ACH refund details on file. CBP pays refunds only by ACH, and will not pay until that bank information is in place, per CBP.',
          'Pull the entry list from ACE. BDO suggests the Entry Summary Detail Report (ES-003), filtered for the IEEPA Chapter 99 lines (9903.01.xx and 9903.02.xx). Sort by liquidation date, and file CAPE declarations for the entries closest to the 80-day cut-off first. Each declaration holds up to 9,999 entries, per CBP.',
          'If a supplier, forwarder or 3PL was the importer, send a written request this week. Ask which of your shipments they are claiming, how much, and whether they will credit you your share. Ask now, before they file, while a Form 4811 designation is still possible. A supplier that quoted you landed prices with tariffs baked in is collecting the refund on cost you paid.',
          'For entries already past 80 days, decide by size. Below the cost of a lawsuit, staying in the class is the default. Above it, get a quote for an individual suit before the first limitations dates in early 2027. File protests on entries liquidated in the last 180 days if your adviser agrees.',
          'Book the refund as one-off cash, not a margin reset. Tariffs did not go away. Yale\'s Budget Lab puts the average statutory tariff rate at 11.0% after Section 301 tariffs replaced the expired Section 122 surcharge on July 24, rising to 11.8% by year-end under current law. Price this holiday season on today\'s landed cost. Use our [fee pages](/fees) and the [product profitability guide](/guides/product-profitability) to re-run margins, and check the [fee change log](/fees/changelog) for marketplace fees that moved this year.',
          'Decide whether to become the importer for future shipments. Our [Dossier](/intelligence/dossier) argues that importing in your own name gives you refund rights and clear duty costs, but the compliance burden is real and it is the wrong call for small import volumes. If you stay on landed pricing, ask suppliers to show the duty line separately.',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'Forecast F8 on our [forecast scorecard](/intelligence/forecasts): the US average effective tariff rate moves 2 points or more, in either direction, from about 10.9% within 12 months of our October 14 call. It resolves October 14, 2027 and is graded hit or miss on Yale Budget Lab data. Yale\'s latest statutory figure, 11.0%, is close to our baseline. Its 11.8% year-end projection is still inside the 2-point band. We do not attach a number to F8 before it resolves.',
          'Dated checkpoints: the Freestyle World scheduling order (due October 22) and any class-wide reliquidation order; CBP instructions for court plaintiffs who submitted importer numbers after July 30; the Federal Circuit\'s ruling on the government\'s appeal over refunds for finally liquidated entries; and the first statute-of-limitations dates in February 2027. We track trade and logistics coverage on the [intelligence dashboard](/intelligence) and in the [Marketplace Pressure Index](/intelligence/pressure-index).',
        ],
      },
    ],
    sources: [
      { label: 'CBP: IEEPA duty refunds', href: 'https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds', context: 'CAPE phases; only the importer of record or its filing broker may file; ACE Portal account and ACH refund details required; up to 9,999 entries per declaration; refunds with interest generally 60–90 days after acceptance; Form 4811 notify party; scam warning.' },
      { label: 'CBP: CAPE trade information notice (updated Jul 10, 2026)', href: 'https://www.cbp.gov/sites/default/files/2026-07/26_0723_trade_information_notice_CAPE.pdf', context: 'CAPE processes entries that are unliquidated or up to 80 days past liquidation, including reconciliation-flagged and warehouse withdrawal entries.' },
      { label: 'CBP: IEEPA frequently asked questions', href: 'https://www.cbp.gov/trade/programs-administration/trade-remedies/IEEPA-FAQ', context: 'IEEPA implementation dates by action; protests may be filed within 180 days after liquidation.' },
      { label: 'BDO: IEEPA tariff refunds, frequently asked questions', href: 'https://www.bdo.com/insights/tax/ieepa-tariff-refunds-frequently-asked-questions', context: 'Supreme Court decision of Feb 20, 2026; eligible periods from Feb 4 and Apr 5, 2025 through Feb 24, 2026; Phase 1 and 2 dates; ES-003 report and Chapter 99 filters; Form 4811 must precede CAPE filing; CBP\'s Aug 4 declaration ($128.68B accepted for processing as of Jul 31); protests; limitation dates of Feb 4 and Apr 5, 2027; Section 122 expiry and Section 301 replacement on Jul 24, 2026.' },
      { label: 'Phillips Lytle: CBP opens Phase 3 of CAPE for IEEPA refunds', href: 'https://phillipslytle.com/cbp-opens-phase-3-of-cape-for-ieepa-refunds/', context: 'Phase 3 opened Oct 6, 2026 for finally liquidated entries of CIT plaintiffs with reliquidation orders.' },
      { label: 'The National Law Review: International trade update for October 19, 2026', href: 'https://natlawreview.com/article/tariff-ied-week-international-trade-october-19-2026', context: 'Phase 1 refunds largely issued within 60 days; class certified; individual suits recommended for significant refunds; earliest limitation expiry in February 2027.' },
      { label: 'The National Law Review: After Learning Resources, liquidation, protests and IEEPA refunds', href: 'https://natlawreview.com/article/after-learning-resources-liquidation-protests-and-ieepa-tariff-refunds', context: 'Why CAPE stops at 80 days: CBP\'s 90-day voluntary reliquidation authority under 19 U.S.C. § 1501.' },
      { label: 'The National Law Review: Importers consider individual CIT filings', href: 'https://natlawreview.com/article/ieepa-refund-litigation-continues-importers-consider-individual-cit-filings', context: 'Two-year limitations period: February 2027 for China entries, March 2027 for Canada and Mexico, April 2027 for other countries, varying by entry.' },
      { label: 'Congressional Research Service: Potential refunds of IEEPA tariffs (IF13150)', href: 'https://www.congress.gov/crs_external_products/IF/PDF/IF13150/IF13150.4.pdf', context: 'Formal entries typically liquidate 314 days after entry; informal entries (generally $2,500 or less) are generally considered liquidated upon payment of duty.' },
      { label: 'US Court of International Trade: Freestyle World v. CBP, Slip Op. 26-123 (Oct 8, 2026)', href: 'https://www.cit.uscourts.gov/sites/cit/files/26-123.pdf', context: 'Class definition: importers of record that paid the challenged duties Feb 1, 2025 to Feb 19, 2026 and did not file their own action.' },
      { label: 'Leyton: IEEPA refunds, CAPE Phase 3 and the Freestyle World class action', href: 'https://leyton.com/us/insights/articles/ieepa-refunds-cape-phase-3-and-the-freestyle-world-class-action/', context: 'Mandatory class membership; certification is not a refund order; joint scheduling order due Oct 22, 2026.' },
      { label: 'Lieberman PLLC: What the Freestyle World ruling means for importers', href: 'https://www.liebermanpllc.com/freestyle-world-ieepa-refund-class-certification/', context: 'No class-wide reliquidation injunction yet; government appeals pending at the Federal Circuit.' },
      { label: 'Supply Chain Dive: Hydro Flask maker aims tariff refunds at inventory, packaging (Oct 22, 2026)', href: 'https://www.supplychaindive.com/news/hydro-flask-maker-aims-tariff-refunds-at-inventory-packaging/833631/', context: 'Helen of Troy expects $80.5M in refunds this fiscal year; $26.9M recognized in the quarter ended Aug 31.' },
      { label: 'Yale Budget Lab: The state of U.S. tariffs (Aug 24, 2026)', href: 'https://budgetlab.yale.edu/research/state-us-tariffs', context: 'Average statutory tariff rate 11.0%, set to reach 11.8% by year-end under current law.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: 'Refunds flow only to importers of record; importer-of-record restructuring play (O4) and its limits; forecast F8.' },
    ],
  },
  {
    slug: 'q4-2026-holiday-forecasts-marketplace-sellers',
    seoTitle: 'Q4 2026 Holiday Forecasts for Marketplace Sellers',
    metaDescription: 'Adobe, Deloitte and Bain expect a record online holiday. What it means for discounts, inventory and ad budgets, and the two calls we will grade in public.',
    headline: 'The holiday forecasts say record dollars. Plan for thin units and price discounts accordingly',
    dek: 'Adobe expects $275.1 billion online in November and December, up 6.7%. Bain says more than half of holiday sales growth is inflation. Our forecast F1 sits at 6%, and the first test of the season came in under Adobe\'s call. Here is what that means for a marketplace seller\'s discount depth, inventory and ad spend before Black Friday.',
    publishedOn: '2026-10-22',
    updatedOn: '2026-10-22',
    author: 'MarketplaceBeta Intelligence',
    readTime: '7 min',
    tags: ['holiday 2026', 'forecasts', 'pricing', 'Amazon', 'Q4 2026'],
    takeaway: 'Plan Q4 to a season that grows mid-single digits in dollars, with much of that from prices, not extra units. Set a discount floor per SKU from your peak-season fees before Cyber Week, and do not count on a deep markdown to buy back the margin through volume.',
    forecastIds: ['F1', 'F3'],
    newsletterSource: 'campaign_kw_q4_forecast',
    sections: [
      {
        id: 'what-changed',
        title: 'What the forecasters expect, and the first real test',
        paragraphs: [
          'Every major forecaster expects a record holiday online. Adobe forecasts $275.1 billion in US online spending from November 1 to December 31, up 6.7% year over year, with Cyber Week (Thanksgiving through Cyber Monday, November 30) at $47.5 billion, or 17.3% of the season, per Adobe\'s September 28 release. Deloitte forecasts holiday e-commerce up 7.5% to 8.4%, to $316.1 billion to $318.9 billion, but over November through January, a different window that includes January, per Deloitte\'s September 10 release. Bain forecasts November–December nonstore sales up 9% and total retail above $1 trillion for the first time, per its September 3 release.',
          'The demand base underneath is real. US retail e-commerce was $340.2 billion in Q2 2026, up 12.2% year over year and 17.1% of total retail, per the Census Bureau\'s quarterly report. The next print, for Q3, is due November 19.',
          'The first piece of the season that can already be checked came in a little light. Adobe had forecast $9.9 billion of US online spending, up 9.2%, during the October 6–7 Prime Big Deal Days event. Adobe\'s actual figure was $9.86 billion, up 8.5%, as reported by Digital Commerce 360 and Retail Dive. That is close in dollars and 0.7 points under in growth. One two-day event does not grade a 61-day season, but it is the only actual figure we have so far.',
        ],
        table: {
          caption: '2026 US holiday forecasts · Sources: Adobe (Sep 28, 2026), Deloitte (Sep 10, 2026), Bain (Sep 3, 2026), Digital Commerce 360 and Retail Dive (Oct 8, 2026)',
          headings: ['Forecaster', 'Measure and window', 'Forecast'],
          rows: [
            ['Adobe', 'US online spend, Nov 1–Dec 31', '$275.1B, +6.7% (vs $257.8B in 2025, per Reuters)'],
            ['Adobe', 'Cyber Week online spend', '$47.5B, +7.4%; Cyber Monday $15.1B, Black Friday $12.9B'],
            ['Deloitte', 'Holiday e-commerce, Nov–Jan', '$316.1B–$318.9B, +7.5% to +8.4%'],
            ['Bain', 'Nonstore sales, Nov–Dec', '+9%; total retail +4.5%, more than half of nominal growth from inflation'],
            ['Adobe (actual)', 'Prime Big Deal Days, Oct 6–7', '$9.86B, +8.5% (Adobe had forecast $9.9B, +9.2%)'],
          ],
        },
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters: record dollars are not record units',
        paragraphs: [
          'Bain\'s own caveat is the line to plan around. It expects more than half of the nominal rise in holiday sales to come from higher prices, while saying e-commerce is one of the few areas that should see both price and unit growth, per Bain\'s release. A seller whose prices rose with costs this year can post a record December in dollars on flat or lower unit volume. Inventory, staffing and ad budgets run on units.',
          'The discount calendar is also predictable this year, which is useful. Adobe expects discounts of up to 14% off list in early November, up to 21% just before Thanksgiving, a peak of up to 30% during Cyber Week, and 10–15% through December, with category peaks on par with 2025: electronics 30%, toys 29%, apparel 23%, furniture 18%, per Adobe. Buyers will compare your price to those reference points, increasingly with AI help. Adobe expects AI-referred traffic to US retail sites to rise 130% over the season.',
          'Consumer mood is the soft spot. The University of Michigan\'s preliminary October sentiment index was 46.3, down from 48.1 in September, with the current-conditions index at 44.7, per the Surveys of Consumers. Our forecast F1 names a headline reading below 44 as an invalidating signal. October is not there yet. The final October reading comes out October 23.',
          'Hypothesis, not yet tested: the gap between a dollar-strong season and soft unit growth will show up first in low-ticket categories where a flat per-unit fee is a larger share of price. That is where deep discounting does the most damage, which the next section works through.',
        ],
      },
      {
        id: 'the-math',
        title: 'What a Cyber Week discount has to deliver',
        paragraphs: [
          'Hypothetical example, not a measurement: a $34 toy sold through FBA, large standard tier, 1 to 1.25 lb, with an assumed $10 landed product cost. Amazon\'s referral fee in Toys & Games is 15%, per our [Amazon fee page](/fees/amazon). The peak fulfillment fee for that tier in the $10–$50 price band is $5.34, and the 3.5% fuel and logistics surcharge on top brings it to about $5.53, per our [Amazon holiday peak fee page](/fees/amazon/holiday-peak-2026), which is transcribed from Amazon\'s Seller Central tables. The referral fee shrinks with the price. The fulfillment fee does not.',
          'By our arithmetic, at full price you keep $13.37 per unit before ads. At 20% off ($27.20) you keep $7.59, so you need about 76% more units to earn the same dollars. At Adobe\'s 29% peak toy discount ($24.14) you keep $4.99, which takes about 2.7 times the units. Fees rise from 31% of the sale price to 35% and then 38%. If the discount runs as a paid Amazon deal, add the $100 upfront fee and 1.5% of promotional sales (capped at $5,000) that Amazon lists for Black Friday Week and Cyber Monday deals.',
        ],
        table: {
          caption: 'Hypothetical $34 toy, FBA large standard 1–1.25 lb, $10 assumed landed cost, before ads and deal fees · Sources: our Amazon fee page (15% Toys & Games referral) and Amazon holiday peak fee page ($5.34 peak fee + 3.5% surcharge), from Amazon Seller Central; discount depth from Adobe (Sep 28, 2026)',
          headings: ['Price', 'Referral (15%)', 'Peak fulfillment + 3.5%', 'Fees as % of price', 'Kept per unit', 'Units needed vs full price'],
          rows: [
            ['$34.00 (full price)', '$5.10', '$5.53', '31.3%', '$13.37', '1.0x'],
            ['$27.20 (20% off)', '$4.08', '$5.53', '35.3%', '$7.59', '1.8x'],
            ['$24.14 (29% off, Adobe toy peak)', '$3.62', '$5.53', '37.9%', '$4.99', '2.7x'],
          ],
        },
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'Black Friday Week and Cyber Monday deal submissions on Amazon closed October 20, per Amazon\'s Holiday 2026 announcement, so most of what is left is pricing, inventory and spend.',
        ],
        bullets: [
          'Check inbound timing today. For Prime badge eligibility during Black Friday Week and Cyber Monday, Amazon asks that FBA inventory sent with Amazon-optimized shipment splits arrive by October 28. The minimal-splits and AWD dates (October 21 and October 14) have passed, per Amazon\'s Holiday 2026 announcement. Those are arrival dates, not ship dates.',
          'Set a discount floor per SKU. Re-run each Cyber Week SKU at your planned deal price with peak fulfillment fees and the surcharge, using our [holiday peak fee page](/fees/amazon/holiday-peak-2026) or Amazon\'s Revenue Calculator, which Amazon says now shows peak rates. Write down the unit lift each discount needs, as in the table above. If last year\'s event never delivered that lift on the SKU, cut the depth.',
          'Size the season to the forecasts, not to October. Plan reorders and ad budgets to mid-single-digit dollar growth, with a separate unit plan that assumes part of that growth is price. Keep a reorder trigger rather than front-loading stock you will carry into January, when peak fulfillment fees end on January 14 but leftover stock keeps costing you storage.',
          'Weight spend toward Cyber Week, not evenly across November. Adobe puts 17.3% of the season\'s online spend in those five days. Keep enough budget and stock for Black Friday, which Adobe expects to grow faster than Cyber Monday.',
          'Compare channels at peak cost before you choose where to discount. The same discount can cost more on one marketplace than another once fulfillment is included. Start with our [fee pages](/fees) and the [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart), and see the [fee change log](/fees/changelog) for every rate that moved this year.',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'Forecast F1 on our [forecast scorecard](/intelligence/forecasts): US online holiday sales from November 1 to December 31 grow 6% or more year over year. Adobe\'s forecast sits 0.7 points above that line. We grade F1 hit or miss on Adobe and Salesforce trackers and Census Q4 data when it resolves on January 31, 2027. We do not attach a number to it before then.',
          'Forecast F3: AI-referred retail traffic at least doubles year over year during Cyber Week, and its conversion premium stays at 25% or more. Adobe\'s season-wide call of +130% clears the bar, but its day-level calls are mixed: +159% on Thanksgiving, +95% on Black Friday and +88% on Cyber Monday, per Adobe. Adobe has not published a Cyber Week aggregate, so F3 is closer than the headline suggests. It also resolves January 31, 2027.',
          'Dated checkpoints: the final October consumer sentiment reading on October 23, Adobe\'s in-season updates through November, Cyber Week actuals in early December, and Census Q3 e-commerce on November 19. The full evidence base for these calls is in the [October Intelligence Dossier](/intelligence/dossier). We track holiday and logistics coverage weekly on the [intelligence dashboard](/intelligence) and the [Marketplace Pressure Index](/intelligence/pressure-index).',
        ],
      },
    ],
    sources: [
      { label: 'Adobe: U.S. holiday shopping season to hit record $275.1 billion online (Sep 28, 2026; corrected Oct 16, 2026)', href: 'https://www.businesswire.com/news/home/20260928285775/en/CORRECTING-and-REPLACING-Adobe-U.S.-Holiday-Shopping-Season-to-Hit-Record-%24275.1-Billion-Online-Rising-6.7-YoY', context: 'Season, Cyber Week, Cyber Monday, Black Friday and Thanksgiving forecasts; discount calendar and category discount peaks; AI-referred traffic +130% (Thanksgiving +159%, Black Friday +95%, Cyber Monday +88%); Prime Big Deal Days forecast of $9.9B, +9.2%. The Oct 16 correction changed one historical date and no figures.' },
      { label: 'Reuters via Investing.com: US holiday online sales to grow 6.7%, Adobe forecasts (Sep 28, 2026)', href: 'https://www.investing.com/news/economic-indicators/usholiday-online-sales-to-grow-67-as-discounts-attract-shoppers-adobe-analytics-forecasts-4920167', context: '2025 comparison base of $257.8B for Adobe\'s Nov–Dec season.' },
      { label: 'Deloitte: Holiday retail sales forecast (Sep 10, 2026)', href: 'https://www.deloitte.com/us/en/about/press-room/deloitte-forecasts-holiday-retail-sales.html', context: 'Holiday e-commerce +7.5% to +8.4%, $316.1B to $318.9B, November 2026 to January 2027.' },
      { label: 'Bain & Company: US holiday retail sales to exceed $1 trillion (Sep 3, 2026)', href: 'https://www.bain.com/about/media-center/press-releases/2026/us-holiday-retail-sales-set-to-outpace-last-years-seasonal-growth-performance-to-exceed-$1-trillion-for-the-first-timebain--company-forecasts/', context: 'Nov–Dec retail +4.5%, nonstore +9%, more than half of nominal growth from inflation, e-commerce expected to see price and unit growth.' },
      { label: 'US Census Bureau: Quarterly retail e-commerce sales, 2nd quarter 2026', href: 'https://www.census.gov/retail/eCommerce.html', context: 'Q2 2026 e-commerce $340.2B, +12.2% YoY, 17.1% of retail; next release Nov 19, 2026.' },
      { label: 'Digital Commerce 360: Prime Big Deal Days drove $9.86 billion in online spending, Adobe says (Oct 8, 2026)', href: 'https://www.digitalcommerce360.com/2026/10/08/amazon-prime-day-big-deal-days-sales-2026/', context: 'Adobe actuals for Oct 6–7: $9.86B, +8.5% from $9.09B.' },
      { label: 'Retail Dive: Online spend during Prime Big Deal Days neared $10B', href: 'https://www.retaildive.com/news/amazon-prime-big-deal-days-online-spend-nears-ten-billion/832604/', context: 'Corroborates Adobe\'s Prime Big Deal Days actuals.' },
      { label: 'University of Michigan Surveys of Consumers: Preliminary results for October 2026', href: 'https://www.sca.isr.umich.edu/', context: 'Sentiment 46.3 (Sep 48.1), current conditions 44.7.' },
      { label: 'Amazon Seller Forums: Holiday 2026, same fees, same eligibility, earlier deadlines', href: 'https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff', context: 'Deal submission window to Oct 20; deal fees ($100 upfront plus 1.5% of promotional sales, capped at $5,000); inbound arrival deadlines Oct 14 / 21 / 28; peak fees Oct 15–Jan 14 with the 3.5% surcharge on top; peak rates in the Revenue Calculator.' },
      { label: 'MarketplaceBeta: Amazon 2026 holiday peak fees by size tier', href: '/fees/amazon/holiday-peak-2026', context: 'Peak fulfillment fee of $5.34 for large standard 1–1.25 lb in the $10–$50 band, transcribed from Amazon Seller Central, plus the 3.5% surcharge.' },
      { label: 'MarketplaceBeta: Amazon fee schedule (verified Oct 16, 2026)', href: '/fees/amazon', context: 'Toys & Games referral fee of 15%, from sell.amazon.com/pricing.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: 'Holiday scenarios and the forecast ledger (F1, F3), each with the dossier\'s own cited sources.' },
    ],
  },
  {
    slug: 'walmart-new-carriers-vs-ship-with-walmart',
    seoTitle: 'Walmart\'s 8 New Carriers vs Ship with Walmart',
    metaDescription: 'Walmart approved eight more parcel carriers on Oct 13. What leaving Ship with Walmart labels costs you in protection, and what to test before peak.',
    headline: 'Walmart approved eight more carriers. Using them means giving up Ship with Walmart\'s cover',
    dek: 'UniUni, SpeedX, GOFO and five others are now approved for seller-fulfilled Walmart orders. They are not in Ship with Walmart, so a cheaper label also means no lost-package refund cover and no on-time protection. Here is how to price that trade before the peak surcharges start.',
    publishedOn: '2026-10-21',
    updatedOn: '2026-10-21',
    author: 'MarketplaceBeta Intelligence',
    readTime: '6 min',
    tags: ['Walmart', 'logistics', 'parcel', 'seller-fulfilled', 'Q4 2026'],
    takeaway: 'A new carrier is only cheaper if its label savings beat what you now carry yourself: lost-package refunds and late deliveries that count against your On-Time Delivery rate. Test new carriers on a slice of low-value, light orders. Keep Ship with Walmart labels on anything where one lost package wipes out a month of savings.',
    forecastIds: ['F6', 'F2'],
    newsletterSource: 'campaign_kw_walmart_carriers',
    sections: [
      {
        id: 'what-changed',
        title: 'What changed',
        paragraphs: [
          'On October 13, Walmart added eight parcel carriers to its approved list for seller-fulfilled Marketplace orders: UniUni, SpeedX, Exelot, SwiftX, TForce Final Mile, GOFO, OSM Worldwide and DoorDash, per the Marketplace Learn release notes. Metropolitan Warehouse & Delivery was added for freight. Walmart\'s parcel carrier guide, updated the same day, still names USPS, FedEx and UPS as its "top preferred carriers".',
          'The change is to the approved carrier list. It does not touch Ship with Walmart, Walmart\'s discounted label program, which covers USPS, FedEx and UPS for domestic shipments, per Walmart\'s Ship with Walmart overview. The only carrier change inside Ship with Walmart this month went the other way: on October 20 Walmart added UPS Ground Saver rates for eligible lightweight domestic packages, and said those shipments can benefit from Ship with Walmart seller protections.',
          'So sellers now have two separate routes on Walmart. One is a Ship with Walmart label with Walmart-negotiated rates and Walmart\'s protections. The other is a label from any approved carrier, now a longer list, where you keep whatever rate you negotiated and you carry the risk.',
        ],
      },
      {
        id: 'what-you-give-up',
        title: 'What you give up when the label is not Ship with Walmart',
        paragraphs: [
          'Walmart\'s seller protections policy (last updated August 26, 2026) is explicit. If you ship on or before the Ship By date with a Ship with Walmart label, your account is in good standing, it is set up for seamless returns, and you are not disputing the return, late or lost packages do not count against your On-Time Delivery metric. For orders reported lost in transit or after delivery, Walmart will not seek reimbursement from you for up to $100 per qualifying order and handles the carrier claim itself. The same policy lists "orders not shipped with a Ship with Walmart label" and labels made with Bring Your Own Account as ineligible. Damaged-in-transit packages are not covered even on Ship with Walmart labels. Walmart also calls the protections discretionary, not insurance, and says they can be withdrawn.',
          'The rate side: Walmart says eligible Pro, Rising and Advanced sellers get up to 15% off 3-day and up to 35% off 2-day Ship with Walmart labels when the delivery promise matches the shipping speed. On its program page, Walmart also claims its negotiated rates average 60% more cost-effective than standard market rates, citing its own data from June 2025. That is Walmart\'s figure and we have not checked it. Your comparison should use your own quotes, not the market rate.',
          'The metric side matters more than the refund. Walmart\'s Seller Performance Standards require an On-Time Delivery rate of 90% or above, valid tracking on 99% or more of orders, and an Item Not Received rate of 2% or below. Carrier delays are listed as seller-accountable for on-time delivery, and "non-integrated carrier" is listed as a valid-tracking driver. Missing those standards can mean suppression, suspension or termination. With a non-Ship with Walmart label, a regional carrier\'s bad week in December is your metric.',
        ],
        table: {
          caption: 'Ship with Walmart label vs an approved-carrier label you buy yourself · Sources: Walmart Marketplace Learn (Ship with Walmart overview, seller protections policy, Seller Performance Standards, release notes Oct 13 and Oct 20, 2026)',
          headings: ['', 'Ship with Walmart label', 'Approved carrier, your own label'],
          rows: [
            ['Carriers (domestic)', 'USPS, FedEx, UPS (UPS Ground Saver added Oct 20)', 'Approved list, including the eight added Oct 13'],
            ['Rate', 'Walmart-negotiated; Pro/Rising/Advanced up to 15% off 3-day and 35% off 2-day', 'Whatever you negotiate with the carrier'],
            ['Lost in transit or after delivery', 'Walmart doesn\'t seek reimbursement for up to $100 per qualifying order; Walmart files the claim', 'Not covered by Walmart; you file with the carrier'],
            ['Late delivery and On-Time Delivery rate', 'Excluded from the metric when eligibility rules are met', 'Counts against the 90% standard'],
            ['Damaged in transit', 'Not covered', 'Not covered'],
          ],
        },
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters now: the peak calendar',
        paragraphs: [
          'The timing is the point. As our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar) laid out, UPS residential ground peak surcharges start at $0.50 per package on October 25 and rise to $0.75 from November 22 to December 26, and FedEx\'s start at $0.50 on October 26 and rise to $0.80 from November 23 to December 27, per the carriers\' published schedules. Those surcharges apply to UPS and FedEx. The newly approved carriers set their own terms, and only two of them publish anything current on their official pages:',
        ],
        bullets: [
          'GOFO says it is not imposing any peak surcharges in 2026, but it starts a 4% emergency fuel surcharge on base delivery rates across all US regions on October 26. GOFO says it stays in place while US on-highway diesel remains above its August 2026 baseline of $5.46 a gallon, per GOFO\'s October 7 partner notice.',
          'OSM Worldwide charges a monthly indexed fuel surcharge. It is 13.50% from October 5 to November 1, 2026, per OSM\'s fuel surcharge policy page, and it resets on the first Monday of each month. OSM\'s peak-season schedule is not on that public page, so ask your rep for it in writing.',
          'UniUni, SpeedX, Exelot, SwiftX, TForce Final Mile and DoorDash: we did not find current peak or fuel terms on their official public pages. Terms vary by contract and lane. Ask each one for its peak, fuel, residential, oversize and address-correction terms in writing before you route Walmart volume to it.',
        ],
      },
      {
        id: 'the-math',
        title: 'The break-even, in one line',
        paragraphs: [
          'Hypothetical example, not a measurement: a $40 order where a new carrier quotes $1.00 less than the Ship with Walmart label for the same package. Without Walmart\'s cover, one lost package costs you roughly the $40 refund, so the switch pays only if fewer than 1 in 40 packages (2.5%) go missing, before counting any hit to your metrics. At a $15 order the same $1.00 saving allows a loss rate of up to about 6.7%. At $100 it is 1%. Cheap, light, low-value parcels are where a new carrier has room to prove itself. High-value orders are where Walmart\'s up-to-$100 cover does the most work.',
          'Hypothesis, not yet tested: the new carriers will make the most sense for sellers who already use them on other channels and can blend volume across Walmart, their own site and other marketplaces. They will make the least sense for a Walmart-heavy seller close to the 90% on-time line going into December.',
        ],
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'All of this can be done before the October 25–26 surcharge start dates.',
        ],
        bullets: [
          'Pull your actual Ship with Walmart label prices for your three most common package profiles from Walmart\'s shipping calculator, then get written quotes from any new carrier for the same weights and zones, with fuel and peak included. Compare landed cost, not base rate.',
          'Check your On-Time Delivery and Item Not Received rates in Seller Center. If you are within a couple of points of the 90% or 2% standards, keep Walmart volume on Ship with Walmart labels through the peak.',
          'If you test a new carrier, limit it to low-value, lightweight orders on lanes the carrier actually serves, and confirm its tracking reaches Walmart cleanly. Valid tracking must hold at 99% or above.',
          'Price the declared-value gap on anything over $100. Walmart\'s protection stops at $100 per order, and depending on the carrier, optional declared value protection may be available on Ship with Walmart shipments over $100, per Walmart\'s protections policy.',
          'Re-run your Walmart contribution margin with October fee tables. Walmart\'s referral rates became tiered in several categories, including Apparel at 5% for items $15 or less (see our [Walmart fee page](/fees/walmart) and the [fee change log](/fees/changelog)). If you sell on both, the [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart) shows the referral gap before shipping.',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'Forecast F6 on our [forecast scorecard](/intelligence/forecasts) says Walmart extends its fee-cut or WFS-incentive playbook to more categories to sustain marketplace growth above 40%. It resolves by April 30, 2027 and is graded hit or miss on Seller Center policy updates and Walmart\'s Q3/Q4 FY27 results. A longer carrier list is not a fee cut, so on its own it does not count toward F6. We read it as the same strategy, though: making Walmart cheaper and easier to sell on, which the [October Intelligence Dossier](/intelligence/dossier) tied to roughly 14 June referral-fee cuts and marketplace growth above 50%. A fee increase would make F6 a miss.',
          'Whether any of the eight carriers is added to Ship with Walmart itself. That would remove most of the trade-off described here. UPS Ground Saver\'s addition on October 20 shows Walmart is still widening the program.',
          'Forecast F2: effective Q4 residential parcel cost inflation for DTC sellers of 8% or more despite 5.9% GRIs, resolving January 31, 2027. Emergency fuel surcharges like GOFO\'s are part of what we will grade. Logistics coverage is tracked weekly on the [intelligence dashboard](/intelligence) and the [Marketplace Pressure Index](/intelligence/pressure-index).',
        ],
      },
    ],
    sources: [
      { label: 'Walmart Marketplace Learn: Release notes', href: 'https://marketplacelearn.walmart.com/releasenotes', context: 'Oct 13, 2026: eight parcel carriers added to the approved list for seller-fulfilled orders, plus Metropolitan Warehouse & Delivery for freight. Oct 20, 2026: UPS Ground Saver rates added to Ship with Walmart for eligible lightweight packages.' },
      { label: 'Walmart Marketplace Learn: Shipping methods, parcel shipping carriers (updated Oct 13, 2026)', href: 'https://marketplacelearn.walmart.com/guides/Shipping%20&%20fulfillment/Shipping%20methods/Shipping-methods:-parcel-shipping-carriers?locale=en-US', context: 'Full approved parcel carrier list; USPS, FedEx and UPS named as top preferred carriers; valid tracking required on more than 99% of orders.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart overview', href: 'https://marketplacelearn.walmart.com/guides/Seller%20Fulfillment%20Services/Ship%20with%20Walmart/Ship-with-Walmart-Overview', context: 'Domestic carriers (USPS, FedEx, UPS); up to 15% off 3-day and 35% off 2-day labels for eligible Pro, Rising and Advanced sellers; up to $100 protection for lost orders shipped on time.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart program page', href: 'https://marketplacelearn.walmart.com/programs/ship/ship-with-walmart', context: 'Walmart\'s claim that negotiated rates average 60% more cost-effective than standard market rates (Walmart first-party data, June 20, 2025); On-Time Delivery rate protection.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart seller protections policy (updated Aug 26, 2026)', href: 'https://marketplacelearn.walmart.com/guides/ship-with-walmart-seller-protections-policy', context: 'Eligibility rules, $100 per-order limit, Walmart-managed carrier claims, exclusions (non-Ship with Walmart labels, Bring Your Own Account, damage in transit), discretionary nature, optional declared value over $100.' },
      { label: 'Walmart Marketplace Learn: Seller Performance Standards', href: 'https://marketplacelearn.walmart.com/guides/Policies&standards/Performance/Seller-performance-standards', context: 'On-Time Delivery 90% or above, Valid Tracking 99% or above, Item Not Received 2% or below; carrier delays seller-accountable; consequences of missing standards.' },
      { label: 'GOFO: Notice to Partners, Emergency Fuel Surcharge Effective October 26, 2026 (Oct 7, 2026)', href: 'https://www.gofo.com/us/resources/news/Notice+to+Partners:+Emergency+Fuel+Surcharge+Effective+October+26,+2026', context: 'No GOFO peak surcharges in 2026; 4% emergency fuel surcharge on base delivery rates from Oct 26 while diesel stays above the $5.46/gal August 2026 baseline.' },
      { label: 'OSM Worldwide: Fuel surcharge policy', href: 'https://www.osmworldwide.com/fuel-surcharge-policy/', context: 'Monthly indexed fuel surcharge; 13.50% for October 5 to November 1, 2026; adjusted the first Monday of each month.' },
      { label: 'UPS Demand Surcharges, August 26, 2026 update (PDF)', href: 'https://assets.ups.com/adobe/assets/urn:aaid:aem:2c542692-de10-4fa3-b507-3b4f181e0953/original/as/demand-surcharges-us-en.pdf', context: 'UPS Ground Residential and Ground Saver peak amounts and dates.' },
      { label: 'FedEx Demand Surcharges (updated July 22, 2026)', href: 'https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html', context: 'FedEx Ground Residential and Home Delivery peak amounts and dates.' },
      { label: 'MarketplaceBeta: Walmart fee schedule and fee change log (verified Oct 16, 2026)', href: '/fees/changelog', context: 'Walmart tiered referral rates, including Apparel at 5% for items $15 or less, sourced from marketplace.walmart.com/pricing.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: 'Walmart\'s June referral-fee cuts in about 14 categories and 50%+ marketplace growth (Q2 FY27), with the dossier\'s own cited sources; forecast F6.' },
    ],
  },
  {
    slug: 'q4-2026-parcel-surcharge-calendar',
    seoTitle: 'Q4 2026 Parcel Surcharges: A Seller Calendar',
    metaDescription: 'UPS and FedEx residential peak surcharges start Oct 25–26, about 25% above 2025. The dates, the amounts, and what sellers should reprice this week.',
    headline: 'The Q4 parcel surcharge calendar: what starts this weekend, and what to reprice before it does',
    dek: 'Base rates rose 5.9%. The holiday surcharges layered on top rose roughly 25%. Here is the calendar, the arithmetic for small orders, and the four changes worth making this week.',
    publishedOn: '2026-10-20',
    updatedOn: '2026-10-20',
    author: 'MarketplaceBeta Intelligence',
    readTime: '7 min',
    tags: ['logistics', 'parcel', 'peak season', 'fulfillment', 'Q4 2026'],
    takeaway: 'Residential peak surcharges begin October 25 (UPS) and October 26 (FedEx) and step up again November 22–23. Re-price free-shipping thresholds and low-ticket SKUs against the surcharged cost now, not after the first invoice.',
    forecastIds: ['F2', 'F5'],
    newsletterSource: 'campaign_q4_parcel_surcharges',
    sections: [
      {
        id: 'what-changed',
        title: 'What changed',
        paragraphs: [
          'The headline carrier increases for 2026 were 5.9% general rate increases at both UPS and FedEx, as we noted in the [October Intelligence Dossier](/intelligence/dossier). The holiday demand surcharges that sit on top of those rates moved much further. On standard residential ground, both carriers raised the peak-window charge by roughly a quarter versus last year.',
          'UPS published its schedule on August 26: Ground Residential and Ground Saver packages carry $0.50 each from October 25 to November 21, $0.75 from November 22 to December 26, and $0.50 again through January 16, 2027. FedEx Ground Residential and Home Delivery residential packages carry $0.50 from October 26 to November 22, $0.80 from November 23 to December 27, and $0.50 through January 17, 2027. Value Added Resource reported last year\'s equivalents as $0.40 and $0.60 at UPS and $0.40 and $0.65 at FedEx, which puts the peak-window increase at 25% and 23%.',
          'USPS is not a clean escape. Its temporary holiday prices took effect October 4 and run until January 17, 2027, and add between $0.40 and $0.75 to a 0–3 lb Ground Advantage parcel depending on zone and price category, according to the USPS announcement.',
          'Amazon\'s own peak fees started first. Holiday peak FBA and Multi-Channel Fulfillment fees run October 15 through January 14, 2027, averaging $0.32 per unit over non-peak rates, and Amazon\'s 3.5% fuel and logistics surcharge applies on top, per Supply Chain Dive\'s report of Amazon\'s announcement. FBA fees are charged when a unit leaves the fulfillment center, so anything shipping today is already on peak rates.',
        ],
        table: {
          caption: 'Residential ground peak surcharges, per package · Sources: UPS (Aug 26, 2026), FedEx (Jul 22, 2026), Value Added Resource (Aug 29, 2026)',
          headings: ['Carrier and service', 'Shoulder window', 'Peak window', '2025 peak', 'Peak change'],
          rows: [
            ['UPS Ground Residential / Ground Saver', '$0.50 (Oct 25–Nov 21; Dec 27–Jan 16)', '$0.75 (Nov 22–Dec 26)', '$0.60', '+25%'],
            ['FedEx Ground Residential / Home Delivery', '$0.50 (Oct 26–Nov 22; Dec 28–Jan 17)', '$0.80 (Nov 23–Dec 27)', '$0.65', '+23%'],
          ],
        },
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters: the surcharge stack, not the rate card',
        paragraphs: [
          'A per-package surcharge is flat, so its weight depends entirely on what is in the box. As a hypothetical illustration: $0.75 is 3.75% of a $20 order and 1.25% of a $60 order. A seller running a 10% net margin on $20 orders gives up more than a third of that margin to one line item in the peak window. The same charge barely registers on a $150 order.',
          'It also does not arrive alone. The dossier documents a stack that moved further than any headline rate in 2026: FedEx\'s domestic fuel surcharge at 32.25% in September, Amazon\'s 3.5% fuel and logistics surcharge since April, a roughly $0.32 per unit Amazon peak fee, and residential demand surcharges up 23–25%. That is why we logged forecast F2 on our [forecast scorecard](/intelligence/forecasts): effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% GRIs. It resolves January 31, 2027, and we will grade it hit or miss using carrier surcharge tables and shipper invoices.',
          'Hypothesis, not yet measured: the sellers hit hardest will be marketplace and DTC operators with low average order values and free-shipping promises set in spring, because those promises were priced against a parcel cost that no longer exists until mid-January.',
        ],
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'Every item below can be done before the October 25–26 start dates. None of it requires a new tool.',
        ],
        bullets: [
          'Re-set free-shipping thresholds against the surcharged cost. Take your blended residential label cost for a typical order, add $0.50 for the shoulder windows and $0.75–$0.80 for the November 22–December 27 peak, and check whether your threshold still covers it at your margin. If it does not, raise the threshold or the price on the SKUs that sit just under it.',
          'Flag the low-ticket SKUs. Sort your catalog by average order value and find the items where one flat charge takes more than 2–3% of revenue. Those are the candidates for a small price change, a bundle, or a minimum order rather than a margin giveaway.',
          'Check how marketplace fees treat shipping before you pass the cost on. eBay calculates its final value fee on the total amount of the sale, including shipping charged to the buyer, per eBay\'s fee page. At the 13.6% rate in most categories shown on our [eBay fee page](/fees/ebay), passing a $0.75 surcharge to the buyer adds about $0.10 in fees. Small, but it is not zero, and it compounds across a holiday volume.',
          'If you or a client ship more than 20,000 residential packages a week, watch your volume now. FedEx\'s separate Demand – Residential Delivery Charge is set by comparing each week\'s volume to your June 1–28 average, with a two-week lag: volume shipped October 19–25 sets the charge applied November 9–15, from $1.70 to $8.00 per Ground package depending on how far above baseline you run, per FedEx. UPS applies a similar higher-volume table. Agencies and 3PLs running several brands through one account should model this before Cyber Week, not after.',
        ],
      },
      {
        id: 'channel-math',
        title: 'Re-run the channel comparison with peak costs',
        paragraphs: [
          'The dossier\'s 30-day framework recommends running an Amazon vs Walmart vs eBay vs DTC contribution comparison with October fee tables and shifting listing emphasis where a net gap of 1.5 points or more exists. Peak surcharges change that math by fulfillment method: FBA and MCF units carry Amazon\'s peak fee and 3.5% surcharge, while self-fulfilled orders carry the carrier\'s demand surcharge.',
          'Start with the referral side on our [fee pages](/fees), which were re-verified against official sources on October 16 (see the [fee change log](/fees/changelog) for every rate that moved, including eBay\'s shift to 13.6% in most categories and Walmart\'s new tiered rates). Then layer in the fulfillment cost for the window you will actually ship in. The [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart) is a reasonable place to start if you sell on both.',
          'One example from Amazon\'s published table, as reported by Supply Chain Dive: a large-standard t-shirt goes from a $6.14 non-peak fulfillment fee to $6.53 at peak, before the 3.5% surcharge. Applying that surcharge to the peak fee, by our arithmetic, gives roughly $6.76. Amazon\'s Seller Forums announcement says peak rates are now in the Revenue Calculator, so pull the exact figure for your own size tiers there.',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'November 22–23: both carriers step up to their highest residential surcharge. Any mid-season change to those schedules would count against forecast F2, so we will note it on the [scorecard](/intelligence/forecasts).',
          'December–January: Amazon\'s 2027 US fee announcement. Forecast F5 says it will contain no headline referral increase but will raise net cost through surcharge or restructuring layers. A flat, surcharge-free schedule would make it a miss.',
          'Weekly: logistics coverage on the [intelligence dashboard](/intelligence) and the [Marketplace Pressure Index](/intelligence/pressure-index), which compares each topic\'s share of the last seven days of coverage with its usual weekly share over the trailing 12 weeks.',
        ],
      },
    ],
    sources: [
      { label: 'UPS Demand Surcharges, August 26, 2026 update (PDF)', href: 'https://assets.ups.com/adobe/assets/urn:aaid:aem:2c542692-de10-4fa3-b507-3b4f181e0953/original/as/demand-surcharges-us-en.pdf', context: 'UPS Ground Residential and Ground Saver amounts and dates; higher-volume shipper tables.' },
      { label: 'FedEx Demand Surcharges (updated July 22, 2026)', href: 'https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html', context: 'FedEx Ground Residential and Home Delivery amounts and dates; Demand – Residential Delivery Charge thresholds, June baseline and calculation weeks.' },
      { label: 'Value Added Resource: UPS, FedEx raise 2026 holiday shipping surcharges (Aug 29, 2026)', href: 'https://www.valueaddedresource.net/ups-fedex-2026-holiday-surcharges/', context: 'Prior-year (2025) residential surcharge amounts used for the year-over-year comparison.' },
      { label: 'USPS: Temporary price change for 2026 holiday shipping season (Aug 25, 2026)', href: 'https://about.usps.com/newsroom/national-releases/2026/0825-usps-announces-temporary-price-change-for-2026-holiday-shipping-season.htm', context: 'USPS Ground Advantage and Priority Mail temporary increases, October 4, 2026 to January 17, 2027.' },
      { label: 'Supply Chain Dive: Amazon announces 2026 holiday fulfillment fees (Jul 13, 2026)', href: 'https://www.supplychaindive.com/news/amazon-announces-2026-holiday-fulfillment-fees-advises-early-shipping/824962/', context: 'Amazon peak fee window, $0.32 average per-unit increase, 3.5% surcharge on top, and example fees by size tier.' },
      { label: 'Amazon Seller Forums: Holiday 2026 fees and deadlines', href: 'https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff', context: 'Amazon\'s announcement of the October 15–January 14 peak window and that peak rates appear in the Revenue Calculator.' },
      { label: 'eBay selling fees', href: 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822', context: 'Final value fee is calculated on the total amount of the sale, including shipping collected from the buyer.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: '5.9% GRIs, FedEx 32.25% fuel surcharge, Amazon surcharge stack, and the 30/60/90-day framework, each with the dossier\'s own cited sources.' },
    ],
  },
]

/** Newest first by publish date (ties keep file order). */
export function latestAnalysis(limit = ANALYSIS_ARTICLES.length): AnalysisArticle[] {
  return ANALYSIS_ARTICLES.map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.publishedOn.localeCompare(x.a.publishedOn) || x.i - y.i)
    .slice(0, limit)
    .map(({ a }) => a)
}

export function getAnalysis(slug: string): AnalysisArticle | undefined {
  return ANALYSIS_ARTICLES.find(a => a.slug === slug)
}

export type InlinePart = { text: string; href?: string }

/** Split "[label](href)" links out of a paragraph. Anything else stays plain text. */
export function parseInlineLinks(paragraph: string): InlinePart[] {
  const parts: InlinePart[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(paragraph))) {
    if (match.index > last) parts.push({ text: paragraph.slice(last, match.index) })
    parts.push({ text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < paragraph.length) parts.push({ text: paragraph.slice(last) })
  return parts
}
