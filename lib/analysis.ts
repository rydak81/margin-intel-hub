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
    "slug": "etsy-offsite-ads-fees-2026",
    "seoTitle": "Etsy Offsite Ads Fees 2026: 15%, 12%, $100 Cap, Opt-Out",
    "metaDescription": "Etsy takes 15% of the whole order, shipping included, or 12% above $10,000 in sales, capped at $100. Who can opt out, plus the pricing math.",
    "headline": "Etsy's Offsite Ads fee takes 12% to 15% of the whole order, shipping included, and you can only opt out below $10,000",
    "dek": "On any order placed within 30 days of a click on one of Etsy's Offsite Ads, Etsy charges 15% of item price plus shipping, or 12% once your shop has made $10,000 in sales over 365 days, capped at $100 an order. Here is the math on a $20, $50 and $100 sale, how to price for it, and what to check in your dashboard this week.",
    "publishedOn": "2026-10-27",
    "updatedOn": "2026-10-27",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "8 min",
    "tags": [
      "Etsy",
      "fees",
      "Offsite Ads",
      "advertising",
      "2026"
    ],
    "takeaway": "If your Etsy shop has never reached $10,000 in sales over 365 days, you can still opt out of Offsite Ads, and you lose that choice for the life of the shop once you cross the line. Either way, price for a fee that runs on the whole order, shipping included: an order sold through an ad needs a price about 20% higher at the 15% rate, or about 15% higher at the 12% rate, to leave you the same money.",
    "forecastIds": [],
    "newsletterSource": "campaign_kw_etsy_offsite_ads",
    "sections": [
      {
        "id": "what-changed",
        "title": "The answer, and what has and has not changed",
        "paragraphs": [
          "Etsy charges an advertising fee on any order a buyer places within 30 days of clicking one of its Offsite Ads, and the fee is a percentage of the whole order: the price of the item plus the shipping and gift wrapping you charge. It is 15% if your shop has always made less than $10,000 in sales in any 365-day period and 12% once it has made $10,000 or more, and it never exceeds $100 on one order. Below $10,000 you can opt out. At $10,000 you cannot, for the life of the shop. All of that comes from Etsy's own [Offsite Ads help page](https://help.etsy.com/hc/en-us/articles/360000338367-How-Etsy-s-Offsite-Ads-Work) and [Fees & Payments Policy](https://www.etsy.com/legal/fees/), read on October 27, 2026.",
          "We found no change to those numbers. The copy of the Fees & Payments Policy we read is headed \"Last updated on Oct 5, 2026\" and carries the same 15%, 12%, $10,000 and $100 figures as the help page. We did not have the earlier version to compare, so we cannot say what the October 5 edit touched. What Etsy has announced is tooling: its seller-updates page lists a redesigned Offsite Ads dashboard that shows revenue, fees, visits, top channels and listings, and traffic from ads that did not end in a sale.",
          "Offsite Ads are optional only below the $10,000 line. Per Etsy's help page, that stops being true once the shop has made $10,000 or more in any consecutive 365-day period."
        ]
      },
      {
        "id": "how-the-fee-works",
        "title": "The rules, in one table",
        "paragraphs": [
          "Eight rules decide what you pay. Each row is Etsy's wording or a close paraphrase, and the right-hand column says where it appears."
        ],
        "table": {
          "caption": "Etsy Offsite Ads rules, checked October 27, 2026",
          "headings": [
            "Rule",
            "What Etsy says",
            "Where"
          ],
          "rows": [
            [
              "Rate below the line",
              "15% of the order total, for a shop that has always made less than $10,000 in any consecutive 365-day period.",
              "Help page; Fees & Payments Policy"
            ],
            [
              "Rate at or above the line",
              "12%. Participation is required for the lifetime of the shop, even if sales later fall back below $10,000.",
              "Help page; Fees & Payments Policy"
            ],
            [
              "Opt-out",
              "Only while the shop is below $10,000: Shop Manager, Settings, Offsite Ads, Opt out. If you opted out earlier and then reach $10,000, the opt-out no longer applies.",
              "Help page; Fees & Payments Policy"
            ],
            [
              "Attribution",
              "A buyer clicks an ad and orders from your shop within 30 days. One click can produce several attributed orders, and each can be charged. If the buyer's last click before buying was an Etsy Ads click, only the Etsy Ads fee applies.",
              "Help page; Fees & Payments Policy"
            ],
            [
              "Cap",
              "The fee on any one order never exceeds $100, whatever the order total.",
              "Help page; Fees & Payments Policy"
            ],
            [
              "Fee base",
              "The price shown for each listing plus the shipping and gift wrapping you charge, plus any personalization fee. US sellers: not sales tax. Sellers outside the US: taxes included in listing prices are in the base.",
              "Fees & Payments Policy"
            ],
            [
              "How the $10,000 is counted",
              "Item price times quantity, minus discounts and cancelled orders. It excludes shipping, taxes, gift wrap, Etsy fees, Pattern orders and in-person orders. The policy says it is calculated on the first day of each month over the prior 365 days; the help page says any consecutive 365-day period.",
              "Fees & Payments Policy; help page"
            ],
            [
              "Your controls",
              "No budget setting. You cannot choose which listings are advertised. You pay only when an attributed order happens.",
              "Help page"
            ]
          ]
        }
      },
      {
        "id": "the-math",
        "title": "What it does to a $20, $50 and $100 sale",
        "paragraphs": [
          "Hypothetical US seller on Etsy Payments, one item per order, no buyer-paid shipping, no sales tax. Etsy's other fees come from our [Etsy fee table](/fees/etsy): 6.5% transaction fee, $0.20 listing fee, and 3% plus $0.25 payment processing. They match our [$20 sale](/fees/etsy/on-a-20-sale) and [$50 sale](/fees/etsy/on-a-50-sale) pages. The Offsite Ads fee is Etsy's rate applied to the order total. All amounts are before product cost and postage.",
          "Read the table as an add-on. On a $20 sale, Etsy's other fees take $2.35, or 11.8% of the sale. An attributed order at 15% takes another $3.00, which lifts total Etsy fees to 26.8% of the sale. At 12% the total is 23.8%."
        ],
        "table": {
          "caption": "Hypothetical: what is left from one order, with and without an Offsite Ads fee",
          "headings": [
            "Item price",
            "Other Etsy fees",
            "Left after those",
            "Ad fee at 15%",
            "Left at 15%",
            "Ad fee at 12%",
            "Left at 12%"
          ],
          "rows": [
            [
              "$20",
              "$2.35",
              "$17.65",
              "$3.00",
              "$14.65",
              "$2.40",
              "$15.25"
            ],
            [
              "$50",
              "$5.20",
              "$44.80",
              "$7.50",
              "$37.30",
              "$6.00",
              "$38.80"
            ],
            [
              "$100",
              "$9.95",
              "$90.05",
              "$15.00",
              "$75.05",
              "$12.00",
              "$78.05"
            ]
          ]
        }
      },
      {
        "id": "price-to-hold",
        "title": "Why it matters: the fee is a share of the price you raise",
        "paragraphs": [
          "Covering the fee takes more than the fee itself, because the fee grows with the price. An attributed order needs a price about 20% higher at 15%, or about 15% higher at 12%, to leave the same money as an order with no ad fee (our arithmetic, same assumptions as above). The table shows the exact prices."
        ],
        "table": {
          "caption": "Hypothetical: price needed on an attributed order to leave the same amount",
          "headings": [
            "Price today",
            "At the 15% rate",
            "At the 12% rate"
          ],
          "rows": [
            [
              "$20",
              "$23.97 (+19.8%)",
              "$23.06 (+15.3%)"
            ],
            [
              "$50",
              "$59.93 (+19.9%)",
              "$57.64 (+15.3%)"
            ],
            [
              "$100",
              "$119.87 (+19.9%)",
              "$115.29 (+15.3%)"
            ]
          ]
        }
      },
      {
        "id": "blend",
        "title": "You cannot price attributed orders separately",
        "paragraphs": [
          "Etsy decides which listings it advertises and where. There is no budget and no per-listing switch. The levers you hold are the opt-out below $10,000, your prices, and what you charge for shipping. Hypothesis, not an Etsy rule: for most shops the fee is best modeled as a blend, meaning the share of your orders attributed to Offsite Ads times the rate. Your Offsite Ads dashboard shows that share. We cannot.",
          "The table shows what a blend does to a hypothetical $50 item. Raising the price lifts the fee base on every order, so the figures include that. They ignore any change in how many buyers purchase at the higher price."
        ],
        "table": {
          "caption": "Hypothetical: $50 item, price that holds take-home if a share of orders are attributed",
          "headings": [
            "Share of orders attributed",
            "Blended fee at 15%",
            "Price at 15%",
            "Blended fee at 12%",
            "Price at 12%"
          ],
          "rows": [
            [
              "10%",
              "1.5%",
              "$50.84 (+1.7%)",
              "1.2%",
              "$50.67 (+1.3%)"
            ],
            [
              "25%",
              "3.75%",
              "$52.16 (+4.3%)",
              "3%",
              "$51.71 (+3.4%)"
            ],
            [
              "50%",
              "7.5%",
              "$54.52 (+9.0%)",
              "6%",
              "$53.55 (+7.1%)"
            ]
          ]
        }
      },
      {
        "id": "shipping-and-the-line",
        "title": "Shipping, the cap and the $10,000 line",
        "paragraphs": [
          "Shipping is in the fee base. Hypothetical: a $26 item with $50 of buyer-paid shipping is a $76 order. At 15% the Offsite Ads fee is $11.40, and at 12% it is $9.12, not the $3.90 or $3.12 you would get from the item price alone. Etsy's other fees also run on the shipping, so they come to $7.67 on that order by our fee table. The seller keeps $56.93 at 15% or $59.21 at 12%, before paying for postage. Moving cost from the price into the shipping charge does not get around the fee, because the fee covers both.",
          "At 15% the $100 cap binds at an order total of $666.67, and at 12% at $833.33 (our arithmetic: $100 divided by the rate). Above those totals the effective rate falls. For most small shops the cap never applies.",
          "The $10,000 line and the fee base are not the same measure. The line counts item price only, per the policy, so shipping charges never move you toward it. The fee runs on the whole order, so shipping charges always add to what you pay. And the line is a one-way door: Etsy's policy says a shop that opted out and then reaches $10,000 \"will be required to participate\" and that the earlier opt-out \"will no longer apply.\" Our reading: for a shop approaching $10,000, an opt-out has a short shelf life."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "None of this needs a new tool. It needs three numbers from your own shop and one spreadsheet column."
        ],
        "bullets": [
          "Pull your share. In Shop Manager, open Marketing, then Offsite Ads, which is the dashboard path in Etsy's help page. For a period you choose, note attributed orders, attributed revenue and fees, then divide attributed orders by all orders. That share times 15% or 12% is your blended fee.",
          "Find your line. Etsy's help center tells you to set a custom 365-day range on your Stats page. The policy counts item price times quantity and excludes shipping, taxes and gift wrap, so check that your Stats figure uses the same definition before you rely on it. We did not verify what the Stats page includes.",
          "If you are under $10,000, decide on the opt-out on purpose. Offsite Ads charge nothing until a sale happens, and opting out removes that traffic as well as the fee. Etsy says you can re-enroll with Turn on Offsite Ads. Whether the traffic is worth the fee is a question about your margins and your dashboard. Etsy's pages do not say how much traffic Offsite Ads bring to any given shop.",
          "Reprice the thin items first. Any listing whose margin after Etsy's other fees is smaller than the ad fee loses money on an attributed order: on a $20 item that is $3.00 at 15%. Use the tables above to set a floor, then compare with what the same item nets on [eBay](/fees/compare/ebay-vs-etsy).",
          "Check what you charge for shipping. If you charge more than postage costs, the fee runs on the surplus as well, and the surplus does not count toward the $10,000 line.",
          "After a refund, read your payment account. Etsy's Payments Policy says that on seller refunds the payment processing fee is recalculated and \"Other applicable fees will be refunded to the seller's payment account.\" It does not say in so many words how a partial refund affects an Offsite Ads fee, so check the entry rather than assume."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask about Etsy Offsite Ads",
        "paragraphs": [
          "Answers are from Etsy's help page, its Fees & Payments Policy and its Payments Policy, read October 27, 2026. Where Etsy's pages are silent, we say so."
        ],
        "bullets": [
          "Can I opt out of Etsy Offsite Ads? Only if your shop has always made less than $10,000 in any consecutive 365-day period. Go to Shop Manager, Settings, Offsite Ads, then Opt out. If you reach $10,000 later, you are required to participate for the lifetime of the shop and the earlier opt-out no longer applies.",
          "What is the difference between the 15% and 12% rate? Both apply to the same base, the order total. Shops below $10,000 pay 15%. Shops at or above $10,000 pay 12%, which Etsy calls a discount, and cannot opt out. On $50 of order total that is $7.50 against $6.00.",
          "Does the 30-day window apply to custom or repeat orders? Etsy's policy says it applies to \"any orders\" a buyer places from your shop within 30 days of the ad click, and the help page says each order in that window can be charged. Neither page carves out custom or repeat orders. Your Offsite Ads dashboard lists the orders attributed to ads.",
          "Is the fee charged on shipping? Yes. Etsy's policy says the fee is a percentage of the total order amount, which is the listing price plus the shipping and gift wrapping you charge. US sellers do not pay it on sales tax. Sellers outside the US pay it on taxes included in listing prices.",
          "How do I price items so Offsite Ads do not wipe out my margin? Work out the share of your orders that are attributed, multiply by 15% or 12%, and raise prices so your take-home holds at that blended fee. The tables above show the method for a hypothetical $50 item.",
          "Does this apply to 3D-printed items I sell? The rate and the opt-out depend on your shop's sales, not on the type of item. The Etsy pages we read list no exemption for 3D-printed items or any other item type. Whether a given 3D print may be listed on Etsy at all is a separate question that this piece does not cover.",
          "Can I choose which listings are advertised or set a budget? No. Etsy's help page says listings are advertised based on what performs best on each channel, and that Offsite Ads have no budget setting. The only cost control is the cap of $100 per order and, below $10,000, the opt-out.",
          "Do I get the fee back if I refund the order? Etsy's Payments Policy says that when a seller refunds a buyer, the processing fee is recalculated and other applicable fees are refunded, but that for full refunds Etsy itself covers, such as through its protection program, the fees \"including without limitation: transaction fee, offsite ads fee, etc.\" are not credited back. It does not spell out the partial-refund case for the Offsite Ads fee, so check your payment account."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Any edit to the 15%, 12%, $10,000 or $100 figures. Etsy last updated its Fees & Payments Policy on October 5, 2026, and we will log any rate change on the [fee change log](/fees/changelog) with the old and new values.",
          "Our Etsy calculators do not yet include an Offsite Ads line, so the tables above are computed from the same fee table plus Etsy's ad rate. Fee-layering is a theme we track on the [forecast scorecard](/intelligence/forecasts), where Forecast F5 covers Amazon's 2027 fee announcement. No forecast covers Etsy today. Our broader marketplace analysis is in the October [Intelligence Dossier](/intelligence/dossier), and the rest of our operator analysis is on the [intelligence dashboard](/intelligence).",
          "How Etsy's redesigned Offsite Ads dashboard reports attributed orders. Etsy's description is brief, so we have not tested what it shows. Compare your own dashboard with your payment account entries for a few orders before you build prices on it."
        ]
      }
    ],
    "sources": [
      {
        "label": "Etsy Help: How Etsy's Offsite Ads Work (read Oct 27, 2026)",
        "href": "https://help.etsy.com/hc/en-us/articles/360000338367-How-Etsy-s-Offsite-Ads-Work",
        "context": "15% below $10,000 and 12% at or above, in any consecutive 365-day period; opt-out only below $10,000 and required participation for the life of the shop at $10,000; 30-day attribution, each attributed order can be charged; Etsy Ads last-click rule; $100 cap per order; no budget setting; listings advertised at Etsy's discretion; opt-out path."
      },
      {
        "label": "Etsy: Fees & Payments Policy (archived copy headed \"Last updated on Oct 5, 2026\", read Oct 27, 2026)",
        "href": "https://www.etsy.com/legal/fees/",
        "context": "Direct fetch was blocked, so we read a web-archive copy. Offsite Ads fee tiers, the $10,000 definition and monthly calculation, lifetime 12% rule, fee base (listing price plus shipping and gift wrapping, taxes by jurisdiction), $100 cap; also $0.20 listing fee, 6.5% transaction fee and payment processing on the order total."
      },
      {
        "label": "Etsy Help: What are the Fees and Taxes for Selling on Etsy?",
        "href": "https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy",
        "context": "Search-result excerpt read Oct 27, 2026: 15% below $10,000, 12% at or above, $100 cap per order. Page not opened in full."
      },
      {
        "label": "Etsy Help: How to Set Up and Manage an Etsy Ads Campaign",
        "href": "https://help.etsy.com/hc/en-us/articles/360033701174-How-to-Set-Up-and-Manage-an-Etsy-Ads-Campaign",
        "context": "Search-result excerpt read Oct 27, 2026: all sellers are enrolled automatically; opt-out depends on revenue; how to check 365-day earnings on the Stats page. Page not opened in full."
      },
      {
        "label": "Etsy Help: What are Payment Processing Fees for Selling on Etsy?",
        "href": "https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy",
        "context": "Search-result excerpt read Oct 27, 2026: United States 3% plus $0.25, charged on the total sale price including shipping and sales tax."
      },
      {
        "label": "Etsy: Payments Policy",
        "href": "https://www.etsy.com/legal/etsy-payments/",
        "context": "Search-result excerpt read Oct 27, 2026: fee treatment on refunds, including the exception for full refunds Etsy covers. Page not opened in full."
      },
      {
        "label": "Etsy Help: Newly Crafted, Etsy Updates for Your Shop",
        "href": "https://help.etsy.com/hc/en-us/articles/10603291042967-Newly-Crafted-Etsy-Updates-for-Your-Shop",
        "context": "Seller-updates page read Oct 27, 2026; lists a redesigned Offsite Ads dashboard (revenue, fees, visits, top channels and listings, traffic that did not end in a sale). The page does not date that item; it appears in its 2026 update sections."
      },
      {
        "label": "MarketplaceBeta Etsy fee table",
        "href": "/fees/etsy",
        "context": "Our figures for the other Etsy fees used in the tables, last checked Oct 16, 2026 against Etsy's published fees."
      }
    ]
  },
  {
    "slug": "usps-january-2027-price-change-fuel-surcharge",
    "seoTitle": "USPS January 2027 Price Change: The Fuel Surcharge Arrives",
    "metaDescription": "USPS's temporary 8% and holiday prices end Jan 17, 2027, and a weekly fuel surcharge starts in January. What it means for your shipping costs.",
    "headline": "January 17 may not be a USPS price cut. A weekly fuel surcharge starts the same month.",
    "dek": "Two temporary USPS increases end on January 17, 2027, and USPS says a weekly fuel surcharge starts in January. It has not published a start date, a first percentage or a formula. UPS and FedEx general rate increases land before then, on December 21 and January 4. Here is the calendar, the one number to watch, and what to fix before peak ends.",
    "publishedOn": "2026-10-27",
    "updatedOn": "2026-10-27",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "6 min",
    "tags": [
      "logistics",
      "USPS",
      "parcel",
      "shipping costs",
      "2027"
    ],
    "takeaway": "Do not plan for cheaper USPS labels after January 17, 2027. Price January shipping as a range, not a number, until USPS publishes the surcharge's start date and first percentage. As a rough guide, treat 8% of base postage as the line: a first fuel surcharge under 8% would leave January labels cheaper than they were this summer, and one above it would leave them dearer.",
    "forecastIds": [
      "F2",
      "F5"
    ],
    "newsletterSource": "campaign_kw_usps_2027",
    "sections": [
      {
        "id": "what-changed",
        "title": "What changed",
        "paragraphs": [
          "On October 26 the Postal Service published a [fuel surcharge FAQ](https://postalpro.usps.com/fuel-surcharge-faqs) on its PostalPro site. It says the surcharge \"will be charged on all competitively priced packages and calculated as a percentage of the base postage,\" updated weekly from the diesel and jet fuel prices on the US Energy Information Administration's website. The FAQ gives the start as \"January 2027\" and lists Priority Mail Express, Priority Mail, USPS Ground Advantage and Parcel Select, including their return services. It applies to retail and commercial shippers, domestic only, and says negotiated service agreements \"may have customized language\". Supply Chain Dive reported the same points the same day.",
          "The FAQ says Ground Advantage and Parcel Select follow diesel, Priority Mail and Priority Mail Express follow jet fuel, and each week's percentage is published \"3-4 days prior to implementation for jet fuel, 3-5 days for diesel\". It gives no starting percentage, formula, cap or floor, and no start date beyond \"January\". We searched the Federal Register on October 27 and found no USPS or Postal Regulatory Commission (PRC) notice that mentions a fuel surcharge. We could not check the Postal Bulletin or the PRC docket list directly, so treat \"not published\" as \"not found\".",
          "This lands on top of two temporary increases that are separate and stack. USPS's August 25 notice to the PRC (Docket CP2026-10) says the holiday prices are \"in addition\" to the transportation-related increase from March. Both end at 12:00 a.m. Central on January 17, 2027. The first is the increase on base postage for the same four products that took effect April 26, which USPS's Governors set at 8.0% on average and which USPS called in its March 25 release \"a necessary bridge to a permanent mechanism\". The second is the holiday pricing that started October 4, which the Governors set at 6.0% on average and which adds $0.40 to $0.75 to a 0–3 lb Ground Advantage label depending on zone and retail or commercial pricing, per the USPS announcement of August 25. Both Governors' decisions say prices \"will be rolled back to approved levels\" on January 17, and the restored prices apply \"unless the Governors take further action to adjust prices.\"",
          "USPS has not said the fuel surcharge is the permanent mechanism the 8% was bridging to, and the FAQ does not mention the 8%. It is the only such mechanism USPS has announced, and Value Added Resource reads it that way. Treat that link as our inference, not a USPS statement.",
          "UPS and FedEx general rate increases both land before January 17. UPS's rates page says its daily rates for Ground, Air and International services rise \"an average net 5.9%\" on December 21, 2026, with \"more detailed rate previews\" to come later. FedEx's rate-changes page says standard list rates for US, US export and US import services rise an average of 5.9% on January 4, 2027. In FedEx's 2027 surcharge table the residential delivery charge goes from $6.95 to $7.35 for U.S. Package Services and from $6.45 to $6.90 for FedEx Ground, Home Delivery and International Ground, and the residential delivery area surcharge goes from $6.60 to $7.00. Both increases are averages on base rates, and UPS says the impact varies by shipper. Their residential peak demand surcharges run through January 16 (UPS) and January 17 (FedEx), as we laid out in our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar)."
        ],
        "table": {
          "caption": "The winter parcel price calendar · Sources: USPS (Mar 25, Aug 25 and Oct 26, 2026) and PRC Docket CP2026-10; UPS and FedEx rate and demand surcharge pages (checked Oct 27, 2026)",
          "headings": [
            "Date",
            "Carrier",
            "What happens"
          ],
          "rows": [
            [
              "Nov 22–Dec 26, 2026 (UPS); Nov 23–Dec 27, 2026 (FedEx)",
              "UPS, FedEx",
              "Highest residential peak demand surcharges: UPS Ground Residential $0.75 per package, FedEx Ground and Home Delivery residential $0.80 per package"
            ],
            [
              "Dec 21, 2026",
              "UPS",
              "Daily rates for Ground, Air and International up an average net 5.9%; detailed rate tables to follow"
            ],
            [
              "Jan 4, 2027",
              "FedEx",
              "Standard list rates up an average 5.9%; residential delivery charge $6.95 to $7.35 (U.S. Package Services) or $6.45 to $6.90 (Ground, Home Delivery); residential delivery area surcharge $6.60 to $7.00"
            ],
            [
              "Through Jan 16, 2027 (UPS); through Jan 17, 2027 (FedEx)",
              "UPS, FedEx",
              "Last days of the residential peak demand surcharges"
            ],
            [
              "Jan 17, 2027, 12:00 a.m. CT",
              "USPS",
              "Temporary 8% increase and holiday prices both end; prices roll back to approved levels unless the Governors act again"
            ],
            [
              "January 2027, date not published",
              "USPS",
              "Weekly fuel surcharge begins, as a percentage of base postage; starting percentage and formula not published"
            ],
            [
              "Feb 1, 2027",
              "FedEx",
              "Zone changes for select US origin-destination ZIP pairs"
            ]
          ]
        }
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: the 8% line",
        "paragraphs": [
          "Until now, USPS's published prices changed on dates announced in advance; this year's two temporary increases were announced 32 and 40 days ahead (March 25 to April 26, August 25 to October 4, our count from USPS's releases). Negotiated rates have moved faster: Value Added Resource reported some September increases with one day's notice. From January, USPS plans to behave more like UPS and FedEx, with a cost that can move every week on three to five days' notice.",
          "The arithmetic for the January rollback is a rough guide, because the 8% and the fuel surcharge are both percentages of base postage. Take a typical label whose base price after the January 17 rollback is B. From April 26 it costs about 1.08 × B. From October 4 it also carries the holiday add-on, which the Governors set at 6.0% on average and the PRC notice says is on top of the 8%, so a typical peak label costs about 1.08 × 1.06 × B, or roughly 1.145 × B. After the rollback it costs B × (1 + the fuel percentage), once the surcharge has started. So a first fuel surcharge below 8% would leave your January labels cheaper than your summer labels, and one above 8% would leave them dearer. Below roughly 14.5% would leave them cheaper than peak labels. This is our arithmetic on averages; the holiday add-ons are flat dollar amounts and individual labels will differ.",
          "Four things can break that line. First, USPS has not said when in January the surcharge starts. If it starts before January 17, it would sit on top of the 8% and holiday prices; that is a hypothesis, and nothing published says it. Second, the Governors can act again before January 17. Third, we have not checked the restored price schedules in the PRC filings (Dockets CP2026-4 and CP2026-10) label by label, so the base price you land on after the rollback may not equal your price today minus the add-ons divided by 1.08. Fourth, negotiated rates may carry the surcharge differently, since USPS says they \"may have customized language\".",
          "We do not know where the surcharge will start, and neither does anyone else outside USPS. For scale only: in its March notice to the PRC, USPS cited FedEx's ground fuel surcharge at 25.50% and UPS's at 26.00% as of that date, and in its March 25 release called its 8% \"less than one-third of what our competitors charge for fuel alone\". Hypothesis, not a forecast: USPS will price the surcharge below the private carriers' fuel rates to protect its share of light parcels. But Postmaster General David Steiner told the Governors in August, as Supply Chain Dive reported, that USPS has \"more price to take in the marketplace\". Plan for both.",
          "This is the pattern our [forecast scorecard](/intelligence/forecasts) has been tracking. Forecast F2 says effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% general rate increases, and resolves January 31, 2027. Forecast F5 says Amazon's 2027 US fee announcement raises net cost through surcharge or restructuring layers rather than a headline referral increase. USPS may be making a similar move: the headline temporary increase goes away and a variable surcharge may take its place. Each forecast is a dated call we will grade hit or miss in public.",
          "Marketplace fees amplify any shipping change you pass on. eBay's fee page says its final value fee is a percentage of the total amount of the sale, which includes shipping costs collected from the buyer (with some exceptions, such as free domestic shipping offered alongside international or 1-day options). For most categories that percentage is 13.6% on the first $7,500 per item, per a copy of the page archived October 25, 2026; some categories differ, for example 15.3% for books, movies and music. Etsy's help page says its 6.5% transaction fee applies to shipping and gift wrapping as well as the item price, and its Fees & Payments Policy (last updated October 5, 2026) says the same. Etsy's US payment processing fee of 3% + $0.25 is also taken from the total sale price including shipping. Worked example (hypothetical, our arithmetic): if a fuel surcharge pushes you to raise buyer-paid shipping by $0.50, you would pay about $0.07 more to eBay (13.6% × $0.50 = $0.068, most categories) or about $0.03 more to Etsy in transaction fees (6.5% × $0.50 = $0.0325), plus about $0.015 in Etsy payment processing (3% × $0.50). Rates change, so check the marketplaces' own pages before you rely on them. Our own [eBay fees](/fees/ebay) and [Etsy fees](/fees/etsy) pages list the rates we last checked."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "None of this needs a new tool, and most of it is a spreadsheet change you can make before peak gets loud."
        ],
        "bullets": [
          "Price January shipping as a range. For your three highest-volume USPS label types, write down today's price, the holiday add-on, and an estimate of the base price after January 17 (today's price minus the add-on, divided by 1.08; an estimate, since the 8% was an average and not exactly 8% on every price). Then work out the January cost at three hypothetical fuel rates, say 0%, 8% and 15%. If a free-shipping promise or flat shipping charge only works in the 0% case, fix it now.",
          "Do not cut shipping prices in a January promo plan on the assumption that USPS gets cheaper on the 17th. It may, by a little, if the first fuel rate is under 8% and the surcharge has not started earlier. It may not.",
          "Ask your label provider, marketplace label program or 3PL two questions in writing: will negotiated rates carry the USPS fuel surcharge, and what happens to a label bought before a weekly change and mailed after it? The USPS FAQ says items \"should have the correct postage and fees paid for at the time of mailing\" and that items carrying the old surcharge amount will be postage due. Until you have an answer, stop buying labels days ahead of ship date from January.",
          "Watch the December 21 to January 17 window if you ship UPS. UPS's 5.9% average increase lands while USPS is still on holiday pricing, so the carrier comparison you ran in October will be wrong for the last weeks of peak. Re-run it with December 21 rates once UPS posts its detailed rate tables.",
          "Agencies and multi-brand operators: add a weekly line for each carrier's fuel percentage to client reporting from January. A cost that moves weekly needs to be seen weekly."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "USPS's start date and first published fuel percentage. Those two facts decide whether January labels go up or down against the 8% line. We will add them to the [fee change log](/fees/changelog) and to the [intelligence dashboard](/intelligence) when they appear.",
          "Whether marketplace label programs and negotiated contracts are exempt, discounted or fully exposed. USPS says contracts \"may have customized language\"; that sentence matters more to most sellers than the base rule.",
          "Whether the Governors act again before January 17. Their decisions say prices roll back \"unless the Governors take further action.\" The PRC's September 9 order says USPS must publish a Governors' decision in the Federal Register at least 30 days before new rates take effect, which for January 17 means about December 18 (our arithmetic). On stamps and Media Mail, resellerindex.com reported no January 2027 filing as of October 26, and we have seen none for packages.",
          "January 31, 2027: forecast F2 resolves on the [scorecard](/intelligence/forecasts). December–January: Amazon's 2027 US fee notice, which tests F5. Background on both is in the October [Intelligence Dossier](/intelligence/dossier), and logistics coverage share is tracked weekly in the [Marketplace Pressure Index](/intelligence/pressure-index)."
        ]
      }
    ],
    "sources": [
      {
        "label": "USPS PostalPro: Fuel Surcharge Implementation FAQ (Oct 26, 2026)",
        "href": "https://postalpro.usps.com/fuel-surcharge-faqs",
        "context": "Surcharge on all competitively priced packages, a percentage of base postage, updated weekly from EIA diesel and jet fuel prices; \"January 2027\"; products, retail and commercial, domestic only; NSAs \"may have customized language\"; percentage published 3-5 days ahead (diesel), 3-4 days (jet fuel); postage due on items with the old surcharge. No starting percentage, formula or start date."
      },
      {
        "label": "USPS PostalPro: Fuel Surcharge FAQ, PDF",
        "href": "https://postalpro.usps.com/mnt/glusterfs/2026-10/FAQ%20-%20Fuel%20Surcharge%20-%20Final.pdf",
        "context": "Full question-and-answer text of the October 26 FAQ."
      },
      {
        "label": "Supply Chain Dive: USPS to debut weekly fuel fee in 2027 (Oct 26, 2026)",
        "href": "https://www.supplychaindive.com/news/usps-to-debut-weekly-fuel-fee-in-2027-matching-fedex-ups-practices/872778/",
        "context": "Trade-press report of the FAQ; Steiner quote from the August Governors meeting."
      },
      {
        "label": "Value Added Resource: USPS plans weekly variable fuel surcharge for 2027",
        "href": "https://www.valueaddedresource.net/usps-weekly-variable-fuel-surcharge/",
        "context": "Trade-press reading of the FAQ; reports no starting percentage, formula or caps disclosed; links the surcharge to the 8% \"bridge\"; reports some negotiated increases with one day's notice."
      },
      {
        "label": "USPS: Transportation-related, time-limited price change (Mar 25, 2026)",
        "href": "https://about.usps.com/newsroom/national-releases/2026/0325-usps-announces-transportation-related-time-limited-price-change.htm",
        "context": "8% increase on base postage for four products, April 26, 2026 to January 17, 2027; \"bridge to a permanent mechanism\"."
      },
      {
        "label": "USPS notice to the Postal Regulatory Commission, Docket CP2026-4 (Mar 25, 2026)",
        "href": "https://prc.arkcase.com/api/prc-dockets/filing/downloadFile?fileId=252397&inline=true",
        "context": "8% across the board April 26, 2026 to January 17, 2027; \"bridge to the eventual implementation of a permanent mechanism\"; prices restored January 17 \"unless the Governors take further action\"; FedEx ground fuel surcharge cited at 25.50% and UPS at 26.00%."
      },
      {
        "label": "Federal Register: Governors' Decision on the time-limited 8% increase (91 FR 15646, Mar 30, 2026)",
        "href": "https://www.federalregister.gov/documents/2026/03/30/2026-06025/change-in-rates-of-general-applicability-for-competitive-products",
        "context": "8.0 percent on average; \"will be rolled back to approved levels at 12:00 a.m. on January 17, 2027\"."
      },
      {
        "label": "USPS: Temporary price change for 2026 holiday shipping season (Aug 25, 2026)",
        "href": "https://about.usps.com/newsroom/national-releases/2026/0825-usps-announces-temporary-price-change-for-2026-holiday-shipping-season.htm",
        "context": "Holiday add-ons from October 4, 2026 to January 17, 2027, including $0.40 to $0.75 on a 0–3 lb Ground Advantage label depending on zone and price category."
      },
      {
        "label": "USPS notice to the PRC, Docket CP2026-10 (Aug 25, 2026)",
        "href": "https://prc.arkcase.com/api/prc-dockets/filing/downloadFile?fileId=256305&inline=true",
        "context": "Holiday prices October 4, 2026 to January 17, 2027, \"in addition\" to the March transportation-related changes, which \"will remain in place\"."
      },
      {
        "label": "PRC Order approving CP2026-10 price adjustments (Sep 9, 2026)",
        "href": "https://prc.arkcase.com/api/prc-dockets/filing/downloadFile?fileId=257079&inline=true",
        "context": "Approves the holiday prices; revert to existing levels January 17, 2027; Governors' decisions must be published in the Federal Register at least 30 days before new rates."
      },
      {
        "label": "Federal Register: Governors' Decision on the holiday price change (91 FR 55636, Aug 28, 2026)",
        "href": "https://www.federalregister.gov/documents/2026/08/28/2026-17640/change-in-rates-of-general-applicability-for-competitive-products",
        "context": "6.0 percent on average; \"will be rolled back to approved levels at 12:00 a.m. on January 17, 2027\"; restored \"unless the Governors take further action to adjust prices\"."
      },
      {
        "label": "UPS: Shipping Zones and Rates",
        "href": "https://www.ups.com/us/en/support/shipping-support/shipping-costs-rates",
        "context": "Effective December 21, 2026, Daily Rates for UPS Ground, UPS Air and International services \"will increase an average net 5.9%\"; \"More detailed rate previews will be available at a later date\"; Additional Handling minimum billable weight 40 to 50 lbs."
      },
      {
        "label": "UPS: Demand surcharges (Aug 26, 2026 update, PDF)",
        "href": "https://assets.ups.com/adobe/assets/urn:aaid:aem:2c542692-de10-4fa3-b507-3b4f181e0953/original/as/demand-surcharges-us-en.pdf",
        "context": "UPS Ground Residential and Ground Saver $0.50, then $0.75 from November 22 through December 26, 2026, then $0.50 through January 16, 2027."
      },
      {
        "label": "FedEx: Shipping rate changes",
        "href": "https://www.fedex.com/en-us/shipping/rate-changes.html",
        "context": "Effective January 4, 2027, package standard list rates for U.S., U.S. export and U.S. import services \"will increase an average of 5.9%\"; zone changes February 1, 2027."
      },
      {
        "label": "FedEx: 2027 changes to surcharges & fees (PDF)",
        "href": "https://www.fedex.com/content/dam/fedex/us-united-states/services/surcharge_and_fee_changes_2027.pdf",
        "context": "Residential Delivery Charge $6.95 to $7.35 (U.S. Package Services) and $6.45 to $6.90 (FedEx Ground, Home Delivery, International Ground); residential Delivery Area Surcharge $6.60 to $7."
      },
      {
        "label": "FedEx: Demand surcharges",
        "href": "https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html",
        "context": "FedEx Ground and Home Delivery residential demand surcharge $0.50, then $0.80 from November 23 through December 27, 2026, then $0.50 through January 17, 2027."
      },
      {
        "label": "resellerindex.com: USPS price increase 2027, what's known as of Oct 26, 2026",
        "href": "https://resellerindex.com/rates/usps-price-change-2027/",
        "context": "No January 2027 stamp or Media Mail filing as of October 26, 2026."
      },
      {
        "label": "eBay selling fees (copy archived Oct 25, 2026)",
        "href": "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
        "context": "Final value fee is 13.6% of the total amount of the sale up to $7,500 per item in most categories, plus a $0.30 or $0.40 per-order fee; the total includes shipping collected from the buyer, with exceptions."
      },
      {
        "label": "Etsy Fees & Payments Policy (last updated Oct 5, 2026)",
        "href": "https://www.etsy.com/legal/fees/",
        "context": "6.5% transaction fee applies to the listing price plus shipping and gift wrapping charged."
      },
      {
        "label": "Etsy Help: Fees and taxes for selling on Etsy",
        "href": "https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy",
        "context": "Transaction fee is 6.5% of the total order amount and applies to shipping and gift wrapping; payment processing fees are taken from the total sale price including shipping (US: 3% + $0.25, per Etsy's payment processing help page)."
      },
      {
        "label": "MarketplaceBeta: Q4 2026 parcel surcharge calendar (Oct 20, 2026)",
        "href": "/intelligence/analysis/q4-2026-parcel-surcharge-calendar",
        "context": "UPS and FedEx residential peak demand surcharge windows ending January 16 and 17, 2027, with carrier sources."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "Parcel cost stack and forecasts F2 and F5, with the dossier's own cited sources."
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
