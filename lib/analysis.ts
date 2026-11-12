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
    "slug": "amazon-030-minimum-referral-fee-categories-2026",
    "seoTitle": "Amazon $0.30 Minimum Referral Fee: When It Kicks In",
    "metaDescription": "Amazon's $0.30 minimum referral fee covers most categories. It only bites below $2 at 15%, $3.75 at 8% and $6 on clothing. Worked examples.",
    "headline": "Amazon's $0.30 minimum referral fee: it covers almost every category, but it only bites on a handful of SKUs",
    "dek": "Amazon charges the category percentage or $0.30 per item, whichever is greater. We re-read Amazon's referral fee table on November 12, 2026, mapped which categories carry the minimum, worked out the sale price where it starts to matter, and found the one fix that beats a price change: pack size.",
    "publishedOn": "2026-11-12",
    "updatedOn": "2026-11-12",
    "author": "MarketplaceBeta Intelligence",
    "reviewMode": "automated",
    "readTime": "6 min",
    "tags": [
      "Amazon",
      "referral fee",
      "minimum fee",
      "low-price items",
      "multipacks",
      "seller fees"
    ],
    "takeaway": "Amazon's referral fee table (re-read November 12, 2026) lists a $0.30 per-item minimum in almost every category. The minimum only takes over when the percentage comes to less than $0.30, which means a total sales price under $2.00 in 15% categories, under $3.75 in 8% tiers such as Beauty, Health and Personal Care at $10 or less, and under $6.00 for Clothing and Accessories at 5%. Outside those bands it costs you nothing. Inside them it can double or triple the rate you think you pay: a hypothetical $1.99 clothing single pays $0.30, or 15.1%, not 5%. The fix is usually pack size, not price. Three of those singles sold as one $5.97 pack pay $0.30 once instead of $0.90.",
    "forecastIds": [
      "F5"
    ],
    "newsletterSource": "campaign_kw_amazon_min_fee",
    "sections": [
      {
        "id": "answer",
        "title": "The short answer",
        "paragraphs": [
          "Amazon's Sell on Amazon pricing page, re-read November 12, 2026, says that for every item sold you pay a percentage of the total price or a minimum amount, whichever is greater. The \"Referral fee minimum amount\" column shows $0.30 in almost every category, from Amazon Device Accessories to Toys and Games to Everything Else. A footnote on the same page defines the total price as the list price plus shipping and any gift-wrapping charges.",
          "Because the minimum is a floor, it only matters when the percentage comes out below $0.30. Divide $0.30 by the category rate and you get the total sales price below which the floor takes over. The table below does that for the rates on Amazon's page. Our [Amazon fee table](/fees/amazon) carries the category rates."
        ],
        "table": {
          "caption": "Where the $0.30 minimum takes over · Source: Amazon referral fee table on sell.amazon.com/pricing (re-read Nov 12, 2026); our arithmetic ($0.30 divided by the rate)",
          "headings": [
            "Referral rate",
            "Example categories on Amazon's table",
            "Minimum applies when the total sales price is below"
          ],
          "rows": [
            [
              "5%",
              "Clothing and Accessories at $15.00 or less",
              "$6.00"
            ],
            [
              "8%",
              "Baby Products and Beauty, Health and Personal Care at $10.00 or less; Computers; Consumer Electronics; Appliances - Full-size",
              "$3.75"
            ],
            [
              "10%",
              "Tires",
              "$3.00"
            ],
            [
              "12%",
              "Automotive and Powersports; Business, Industrial, and Scientific Supplies; Base Equipment Power Tools; 3D Printers up to $200",
              "$2.50"
            ],
            [
              "15%",
              "Home and Kitchen; Toys and Games; Sports and Outdoors; Office Products; Pet Supplies; Everything Else",
              "$2.00"
            ],
            [
              "45%",
              "Amazon Device Accessories",
              "about $0.67"
            ]
          ]
        }
      },
      {
        "id": "what-changed",
        "title": "What changed: the table is wider than most sheets assume",
        "paragraphs": [
          "Amazon's page carries no effective date for the minimum, so we are not calling it a new fee. What we can say is what the table shows today. On November 12, 2026, the minimum column read \"--\" (no minimum) for Grocery and Gourmet, Gift Cards, Media (Books, DVD, Music, Software, Video), Video Games and Gaming Accessories, and Video Game Consoles. Fine Art has its own rule: its row sets a $1.00 minimum on the 20% band up to $100. Every other row we read showed $0.30.",
          "That is broader than the list many seller sheets carry, ours included. Our October 16, 2026 [fee change log](/fees/changelog) entry added the $0.30 minimum for Baby Products, Beauty, Consumer Electronics, Health and Personal Care and Kitchen. Amazon's table now shows the same $0.30 across most other rows too. Where a sheet or calculator differs from Amazon's row, Amazon's row wins.",
          "One more detail from the same page: a product's fee category may not match the category shoppers see in the Amazon store. Before you decide whether a SKU sits in a 5%, 8% or 15% band, check its fee category, not its browse node."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters, and where it doesn't",
        "paragraphs": [
          "For most catalogs the minimum is noise. At $10, a 5% clothing item already pays $0.50 and an 8% beauty item pays $0.80, both above the floor. At $20, nothing on the table above is anywhere near it. If your cheapest Amazon SKU is over $6, you can stop reading here.",
          "Below those lines, the headline rate stops describing what you pay. These are hypothetical single-unit sales with no buyer shipping, worked from Amazon's rates and the $0.30 floor. The minimum is charged per item, so every unit in the order pays it."
        ],
        "table": {
          "caption": "Hypothetical: one unit, $0 buyer shipping, referral fee only · Source: Amazon referral fee table (re-read Nov 12, 2026); our arithmetic, rounded to the cent",
          "headings": [
            "Item",
            "Total sales price",
            "Rate on Amazon's table",
            "Percentage fee",
            "Fee charged",
            "Effective rate"
          ],
          "rows": [
            [
              "Clothing single (hair tie, socks)",
              "$1.99",
              "5%",
              "$0.10",
              "$0.30",
              "15.1%"
            ],
            [
              "Clothing item",
              "$4.99",
              "5%",
              "$0.25",
              "$0.30",
              "6.0%"
            ],
            [
              "Lip balm (Beauty, Health and Personal Care)",
              "$2.99",
              "8%",
              "$0.24",
              "$0.30",
              "10.0%"
            ],
            [
              "Home and Kitchen gadget",
              "$1.49",
              "15%",
              "$0.22",
              "$0.30",
              "20.1%"
            ]
          ]
        },
        "bullets": [
          "Pack size beats price. Three $1.99 clothing singles pay $0.30 each, or $0.90. The same three units sold as one $5.97 pack pay 5% of $5.97, which is $0.2985, so the $0.30 floor applies once. That saves $0.60 in referral fees on three units.",
          "The saving is smaller in 8% bands. Two $2.99 lip balms sold separately pay $0.60. As one $5.98 two-pack they pay 8%, or $0.48, a $0.12 saving.",
          "Buyer-paid shipping can lift you off the floor. A hypothetical $4.99 merchant-fulfilled clothing item with $1.50 buyer shipping has a $6.49 total sales price, and 5% of that is $0.32, so the minimum no longer applies."
        ]
      },
      {
        "id": "our-read",
        "title": "Our read (a hypothesis, not a measured finding)",
        "paragraphs": [
          "We think the minimum is a pricing signal more than a cost line. Amazon's table puts the floor right where a single low-price unit earns Amazon little, and leaves it off only a short list of rows such as Grocery and Gourmet and Media. Read that way, the floor nudges sellers toward multipacks and higher ticket sizes in every other category.",
          "We have not measured how many sellers are affected, and the referral fee is rarely the biggest fixed cost on a low-price unit. Fulfillment fees are fixed per unit too, and they sit outside this piece. If a $1.99 single is already marginal after fulfillment, the $0.30 floor is one more reason to pack it, not the main one."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "Each of these can be done on this week's listings and margin sheets."
        ],
        "bullets": [
          "Sort your Amazon catalog by total sales price (item plus buyer shipping plus gift wrap) and flag every SKU under $6.00. Only those can hit the $0.30 floor.",
          "For each flagged SKU, confirm its fee category on Amazon, then compare 5%, 8%, 10%, 12% or 15% of the total price with $0.30. Use the larger number in your margin sheet.",
          "Check your sheet's category list against Amazon's minimum column, not just the five categories our October 16 [fee change log](/fees/changelog) entry called out. Grocery and Gourmet, Media and the video game rows are the exceptions with no minimum.",
          "For clothing singles under $6.00 and 8%-tier beauty, health and baby items under $3.75, model a two- or three-pack against the single before the holiday rush. Include your fulfillment cost per pack, which this piece does not model.",
          "If you sell merchant-fulfilled, model the order with your buyer shipping charge included. A shipping line can move a sub-$6 clothing item off the floor."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Amazon's 2027 US fee announcement. Forecast F5 on our [forecast scorecard](/intelligence/forecasts) is a dated call that Amazon's 2027 notice raises net cost through surcharge or restructure layering rather than a headline referral increase. Its indicator is the Seller Central fee notice expected December to January. A higher minimum, or new rows gaining one, would be exactly that kind of change, and the low-price SKUs above would feel it first. We will log any change on the [fee change log](/fees/changelog).",
          "The rows with no minimum today. If Grocery and Gourmet or the video game rows gain a $0.30 floor, low-price consumables and accessories in those categories would need the same pack-size review. The current Q4 cost picture for Amazon sellers is on our [holiday peak fees page](/fees/amazon/holiday-peak-2026). Broader fee and channel context is on the [Intelligence hub](/intelligence) and in the [Intelligence Dossier](/intelligence/dossier)."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of November 12, 2026, from Amazon's public referral fee table and our arithmetic."
        ],
        "bullets": [
          "Which Amazon categories have a $0.30 minimum referral fee? Almost all of them. On November 12, 2026, Amazon's table showed $0.30 in every row except Grocery and Gourmet, Gift Cards, Media, Video Games and Gaming Accessories, and Video Game Consoles, which show no minimum, and Fine Art, which has its own $1.00 minimum on its first band.",
          "When does the $0.30 minimum kick in? When the category percentage of the total sales price comes to less than $0.30: below $2.00 at 15%, $2.50 at 12%, $3.00 at 10%, $3.75 at 8% and $6.00 at 5%.",
          "Is the minimum per item or per order? Per item. Amazon's page says that for every item sold you pay the percentage or the minimum, whichever is greater.",
          "Does shipping count toward the total sales price? Yes. Amazon's footnote says the total price includes the list price, shipping costs and any gift-wrapping charges.",
          "What does Amazon take on a $4.99 clothing item? On a hypothetical one-unit sale with no buyer shipping, 5% would be $0.25, so the $0.30 minimum applies. That is an effective 6.0%.",
          "Do multipacks help? Yes, under the floor. Three hypothetical $1.99 clothing singles pay $0.90 in referral fees, while one $5.97 three-pack pays $0.30.",
          "Does the minimum apply at $10? Not in any category on the table. At $10, the lowest rate shown (5% on clothing) is $0.50, above the floor. Our [$10 sale page](/fees/amazon/on-a-10-sale) shows category totals at that price."
        ]
      },
      {
        "id": "methods",
        "title": "How this was made",
        "paragraphs": [
          "We re-read the referral fee table on Amazon's US Sell on Amazon pricing page on November 12, 2026, including the minimum-amount column and its footnotes, and compared it with our [Amazon fee table](/fees/amazon) and the October 16, 2026 entries on our [fee change log](/fees/changelog). The thresholds are $0.30 divided by each published rate. The worked examples are hypothetical single-unit or single-pack sales with no buyer shipping unless stated, rounded to the cent. They cover the referral fee only, not fulfillment, storage, advertising or returns.",
          "Prepared through an automated research and editorial process with evidence checks. No individual human review of this revision is claimed. Suggested citation: MarketplaceBeta Intelligence, \"Amazon's $0.30 minimum referral fee: it covers almost every category, but it only bites on a handful of SKUs,\" November 12, 2026, with the canonical article URL. Attribute fee rules to Amazon and check your own fee category in Seller Central before you repack or reprice."
        ]
      }
    ],
    "sources": [
      {
        "label": "Amazon: Sell on Amazon pricing, referral fees (re-read Nov 12, 2026)",
        "href": "https://sell.amazon.com/pricing",
        "context": "Referral fee is a percentage of the total price or a minimum amount, whichever is greater, for every item sold; $0.30 minimum in most rows; no minimum shown for Grocery and Gourmet, Gift Cards, Media, Video Games and Gaming Accessories, Video Game Consoles; Fine Art $1.00 minimum on its first band; total price includes list price, shipping and gift wrap; fee category may differ from the store category."
      },
      {
        "label": "MarketplaceBeta: Amazon fees by category",
        "href": "/fees/amazon",
        "context": "Category referral rates and tiers used for the thresholds in this piece."
      },
      {
        "label": "MarketplaceBeta: Fee change log (Oct 16, 2026 entries)",
        "href": "/fees/changelog",
        "context": "Added the $0.30 minimum referral fee for Baby Products, Beauty, Consumer Electronics, Health and Personal Care and Kitchen."
      },
      {
        "label": "MarketplaceBeta: What Amazon takes on a $10 sale",
        "href": "/fees/amazon/on-a-10-sale",
        "context": "Category totals at $10, a price where no category on Amazon's table hits the $0.30 floor."
      },
      {
        "label": "MarketplaceBeta: Amazon holiday peak fees 2026",
        "href": "/fees/amazon/holiday-peak-2026",
        "context": "Q4 2026 Amazon fulfillment cost context for low-price SKUs."
      },
      {
        "label": "MarketplaceBeta forecast scorecard",
        "href": "/intelligence/forecasts",
        "context": "F5: Amazon's 2027 US fee announcement, a dated call scored hit or miss."
      },
      {
        "label": "MarketplaceBeta Intelligence hub",
        "href": "/intelligence",
        "context": "Operator analysis index."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier",
        "href": "/intelligence/dossier",
        "context": "Broader marketplace fee and channel context."
      }
    ]
  },
  {
    "slug": "ebay-watch-fees-2026-15-percent-to-1000",
    "seoTitle": "eBay Watch Fees 2026: 15% to $1,000, Then Less",
    "metaDescription": "eBay watch fees in 2026: 15% to $1,000, 6.5% to $7,500, 3% above. Worked at $500, $2,500 and $10,000, plus where Walmart is cheaper.",
    "headline": "eBay watch fees in 2026: 15% to $1,000, 6.5% to $7,500, 3% above, and where Walmart costs less",
    "dek": "Watches, Parts & Accessories has its own marginal fee schedule on eBay, separate from Jewelry. We re-read eBay's and Walmart's fee pages on November 9, 2026, worked three sale prices, and found the price where Walmart becomes the cheaper watch fee.",
    "publishedOn": "2026-11-09",
    "updatedOn": "2026-11-09",
    "author": "MarketplaceBeta Intelligence",
    "reviewMode": "automated",
    "readTime": "7 min",
    "tags": [
      "eBay",
      "watches",
      "final value fee",
      "Walmart Marketplace",
      "seller fees",
      "high-ticket"
    ],
    "takeaway": "On eBay, a watch does not pay one flat rate. Per eBay's selling fees page (re-read November 9, 2026), Watches, Parts & Accessories pay 15% on the first $1,000, 6.5% on the portion from $1,000 to $7,500, and 3% above, plus the $0.40 per-order fee. On a hypothetical $2,500 sale that is $247.90 (9.9%), not the $375.40 a flat 15% would cost. Price from the blended rate, not the headline 15%. Walmart's published watch schedule (15% to $1,500, 3% above) comes out cheaper once a sale passes roughly $2,700. Before you reprice, confirm the listing sits in the Watches, Parts & Accessories category, because eBay's other Jewelry rows work differently.",
    "forecastIds": [],
    "newsletterSource": "campaign_kw_ebay_watches",
    "sections": [
      {
        "id": "answer",
        "title": "The short answer",
        "paragraphs": [
          "eBay's selling fees page, re-read November 9, 2026, lists Jewelry & Watches > Watches, Parts & Accessories at 15% on the total amount of the sale up to $1,000 per item, 6.5% on the portion over $1,000 up to $7,500, and 3% on the portion over $7,500. The same page adds a per-order fee of $0.30 on orders of $10.00 or less and $0.40 on larger orders, so every watch sale pays $0.40. Our [eBay watches calculator](/fees/ebay/watches) and the [eBay fee table](/fees/ebay) use the same schedule.",
          "The rates are marginal. Each rate applies only to the slice of the price inside its band, so there is no price at which the fee jumps. The blended rate falls as the price rises. The table below works three hypothetical sales: one item, no buyer shipping, no sales tax. Because eBay calculates the fee on the total amount of the sale, including sales tax and shipping collected from the buyer, your real fee will be higher than these rows."
        ],
        "table": {
          "caption": "Hypothetical: one watch per order, $0 buyer shipping, $0 tax · Sources: eBay selling fees page (re-read Nov 9, 2026); our arithmetic",
          "headings": [
            "Sale price",
            "15% band (first $1,000)",
            "6.5% band ($1,000 to $7,500)",
            "3% band (above $7,500)",
            "Per-order fee",
            "Total eBay fees",
            "Effective rate"
          ],
          "rows": [
            [
              "$500",
              "$75.00",
              "$0.00",
              "$0.00",
              "$0.40",
              "$75.40",
              "15.1%"
            ],
            [
              "$2,500",
              "$150.00",
              "$97.50",
              "$0.00",
              "$0.40",
              "$247.90",
              "9.9%"
            ],
            [
              "$10,000",
              "$150.00",
              "$422.50",
              "$75.00",
              "$0.40",
              "$647.90",
              "6.5%"
            ]
          ]
        }
      },
      {
        "id": "what-changed",
        "title": "What changed: our tables, not eBay's rule",
        "paragraphs": [
          "This is not a new eBay announcement. What moved was our own model. Our [fee change log](/fees/changelog) records that on October 16, 2026 we re-verified our tables against eBay's selling fees page and split Watches, Parts & Accessories out of the old Jewelry & Watches row: before, 15% flat; after, 15% through $1,000, 6.5% from $1,000 to $7,500, and 3% above. The log entry does not say when eBay itself introduced the schedule, and we have not found an eBay statement that dates it, so we do not claim a date for it.",
          "If you built a watch margin sheet from an older source, or from a calculator that applies 15% to the whole price, check it against eBay's current page. On a $2,500 sale, a flat 15% gives $375.40 including the per-order fee. The marginal schedule gives $247.90. That is a $127.50 difference on one sale (hypothetical, our arithmetic)."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: the blended rate, the category check and the Walmart crossover",
        "paragraphs": [
          "The blended rate is what you should price against. At $500 eBay keeps about 15.1% of the sale. At $2,500 it keeps about 9.9%, and at $10,000 about 6.5%. A seller quoting \"eBay takes 15% on watches\" is right only below $1,000.",
          "The category check matters more than the rate. eBay's page gives the general Jewelry row (everything in Jewelry & Watches except Watches, Parts & Accessories) a different structure: 15% on the whole amount if the sale is $5,000 or less, and 9% on the whole amount if it is over $5,000. That is a whole-amount rule, not a marginal one. On a hypothetical $2,500 item, the Jewelry row costs $375.40 and the watch row costs $247.90. The Jewelry row also has its own cliff: $750.40 at $5,000.00 and $450.40 at $5,000.01 (our arithmetic, one item, no shipping or tax), because the lower rate applies to the whole amount once the sale passes $5,000. The watch schedule has no such step. Check which row your listing's category falls under before you copy numbers from either.",
          "Walmart is the obvious comparison. Walmart Marketplace's pricing page, re-read November 9, 2026, lists Watches at 15% of the portion of the total sales price up to $1,500 and 3% of the portion above $1,500. The page does not list a per-order fee, and says total sales price includes shipping, handling, gift wrap and other charges. Our [Walmart fee table](/fees/walmart) matches (verified October 16, 2026). On the same three hypothetical sales Walmart costs $75.00 at $500, $255.00 at $2,500 and $480.00 at $10,000. By our arithmetic eBay is cheaper only for sales between roughly $1,005 and $2,700; Walmart is cheaper below that band (by about the $0.40 per-order fee) and above it. At $10,000 the gap is $167.90 in Walmart's favor.",
          "Fees are not the whole decision. This comparison ignores shipping, insurance, returns, advertising, payment or authentication costs, eligibility or approval requirements for the category, and, above all, whether the watch will sell at the same price and speed on each channel. It only tells you where the referral fee stops being the deciding factor. Broader fee context sits on the [Intelligence hub](/intelligence) and in the [Intelligence Dossier](/intelligence/dossier). None of our open [forecasts](/intelligence/forecasts) is a watch-category call, so we do not tie this piece to one."
        ],
        "table": {
          "caption": "Hypothetical: one watch, $0 buyer shipping, $0 tax, referral/final value fees only · Sources: eBay selling fees page and Walmart Marketplace pricing page (both re-read Nov 9, 2026); our arithmetic",
          "headings": [
            "Sale price",
            "eBay Watches, Parts & Accessories",
            "Walmart Watches",
            "Cheaper on fees"
          ],
          "rows": [
            [
              "$500",
              "$75.40",
              "$75.00",
              "Walmart, by $0.40"
            ],
            [
              "$2,500",
              "$247.90",
              "$255.00",
              "eBay, by $7.10"
            ],
            [
              "$10,000",
              "$647.90",
              "$480.00",
              "Walmart, by $167.90"
            ]
          ]
        }
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "Each step is a spreadsheet or listing check you can finish in an afternoon."
        ],
        "bullets": [
          "Replace any flat 15% watch assumption with the three-band schedule above. Check the result against our [eBay watches calculator](/fees/ebay/watches).",
          "Open every active watch listing and confirm its category. Parts and accessories sit with the watch row under eBay's page; other jewelry does not. A listing in the wrong category is priced on the wrong schedule.",
          "Add the fee on shipping and tax to your model. eBay calculates the fee on the total amount of the sale, so a $2,500 watch with $25 of shipping collected pays fees on $2,525. Pull a real recent order from Seller Hub and compare it to your model before you trust the sheet.",
          "For any watch you could list on both channels, price the Walmart fee against the eBay fee side by side, then weigh the sell-through, returns and eligibility factors that fees do not capture. The fee gap is small under about $2,700 and grows quickly above it: $167.90 at $10,000.",
          "If you sell jewelry as well, keep a separate row for it. The whole-amount rule and the $5,000 step make it the one place where a one-cent price move changes the fee by hundreds of dollars.",
          "Re-pull eBay's selling fees page before you reprice a large catalog. Our [fee change log](/fees/changelog) will record any change we find."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Any change to eBay's Watches, Parts & Accessories bands or to the per-order fee. We re-check eBay's selling fees page when eBay posts a fees update and log differences in the [fee change log](/fees/changelog).",
          "Walmart's watch schedule, which our log shows changed from 15% flat to a two-band structure in our October 16, 2026 re-verification. If Walmart moves the $1,500 breakpoint or the 3% rate, the roughly $2,700 crossover moves with it.",
          "How the holiday season treats high-ticket categories generally. We have not measured watch demand, so that stays a question, not a claim. Overall channel signals live on the [Intelligence hub](/intelligence)."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of November 9, 2026, from eBay's selling fees page, Walmart Marketplace's pricing page and our fee tables."
        ],
        "bullets": [
          "What are eBay's watch fees in 2026? For Watches, Parts & Accessories: 15% of the total amount of the sale up to $1,000, 6.5% of the portion over $1,000 up to $7,500, and 3% of the portion over $7,500, plus a $0.40 per-order fee on orders over $10.00.",
          "Is the 15% charged on the whole price? No. For watches it applies only to the first $1,000. The portion above $1,000 is charged at a lower rate. Other eBay jewelry works differently.",
          "What does eBay charge on a $500 watch? On a hypothetical sale with no shipping or tax: $75.00 plus $0.40, or $75.40 (15.1%).",
          "What does eBay charge on a $2,500 watch? Same assumptions: $150.00 plus $97.50 plus $0.40, or $247.90 (9.9%).",
          "What does eBay charge on a $10,000 watch? Same assumptions: $150.00 plus $422.50 plus $75.00 plus $0.40, or $647.90 (6.5%).",
          "Do shipping and sales tax count? Yes. eBay says the total amount of the sale includes item price, handling, shipping collected from the buyer (some exceptions apply) and sales tax. The fee is calculated on that total.",
          "How is non-watch jewelry different? eBay charges 15% on the whole amount at $5,000 or less and 9% on the whole amount above $5,000, so the fee drops at the threshold. Watches, Parts & Accessories use the marginal schedule instead.",
          "Is Walmart cheaper for watches? Above roughly $2,700 by our arithmetic, and also below roughly $1,005, where the gap is just eBay's $0.40 per-order fee. Between those prices eBay is cheaper. Walmart's published schedule is 15% up to $1,500 and 3% above, and its pricing page lists no per-order fee. This covers referral fees only.",
          "Where can I check the rates myself? eBay's selling fees page and Walmart Marketplace's pricing page, both linked in Sources, and our [eBay fee table](/fees/ebay)."
        ]
      },
      {
        "id": "methods",
        "title": "How this was made",
        "paragraphs": [
          "We fetched eBay's US selling fees help page and Walmart Marketplace's pricing page on November 9, 2026 and compared the watch rows with our [eBay](/fees/ebay) and [Walmart](/fees/walmart) tables (both verified October 16, 2026) and the October 16 entries on our [fee change log](/fees/changelog). They match. Worked dollars are our arithmetic from those rates for one item with $0 buyer shipping and $0 tax, rounded to the cent. They are hypothetical illustrations, not measured seller settlements. The roughly $1,005 and $2,700 crossovers solve eBay's $0.40 plus its three bands against Walmart's two bands. It is approximate and applies to referral fees only. We did not use forecast data, and we did not measure watch demand.",
          "Published through an automated research and editorial process with evidence checks. No individual human review of this revision is claimed. Suggested citation: MarketplaceBeta Intelligence, \"eBay watch fees in 2026,\" November 9, 2026, with a link to the canonical article. Re-check your own Seller Hub fee lines before you reprice."
        ]
      }
    ],
    "sources": [
      {
        "label": "eBay Help: Selling fees (re-read Nov 9, 2026)",
        "href": "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
        "context": "Watches, Parts & Accessories: 15% up to $1,000, 6.5% from $1,000 to $7,500, 3% above $7,500; per-order fee $0.30 for orders $10.00 or less and $0.40 above; total amount of the sale includes shipping collected and sales tax; general Jewelry 15% at $5,000 or less and 9% above."
      },
      {
        "label": "Walmart Marketplace: Pricing (re-read Nov 9, 2026)",
        "href": "https://marketplace.walmart.com/pricing/",
        "context": "Watches: 15% of the portion up to $1,500 and 3% above $1,500; total sales price includes shipping, handling, gift wrap and other charges."
      },
      {
        "label": "MarketplaceBeta: eBay fees by category (verified Oct 16, 2026)",
        "href": "/fees/ebay",
        "context": "eBay table including the Watches, Parts & Accessories schedule."
      },
      {
        "label": "MarketplaceBeta: eBay watches fee calculator",
        "href": "/fees/ebay/watches",
        "context": "Calculator for the three-band watch schedule."
      },
      {
        "label": "MarketplaceBeta: Walmart fees by category (verified Oct 16, 2026)",
        "href": "/fees/walmart",
        "context": "Walmart watch schedule used in the comparison."
      },
      {
        "label": "MarketplaceBeta: Fee change log",
        "href": "/fees/changelog",
        "context": "October 16, 2026 entries for eBay Watches, Parts & Accessories and Walmart Watches."
      },
      {
        "label": "MarketplaceBeta forecast scorecard",
        "href": "/intelligence/forecasts",
        "context": "No open forecast is a watch-category call."
      },
      {
        "label": "MarketplaceBeta Intelligence hub",
        "href": "/intelligence",
        "context": "Operator analysis index."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier",
        "href": "/intelligence/dossier",
        "context": "Broader marketplace fee and channel context."
      }
    ]
  },
  {
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
  },
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
          "The line most small sellers should read first is on UPS's Small Business Rates page. From December 21, those rates rise 4.5%, and a 5% domestic and international fuel surcharge will apply to all of them. The same page still describes these rates as inclusive of the Delivery Area Surcharge and the fuel surcharge.",
          "FedEx has published everything, including full 2027 list rates and a surcharge table. Its paper-document fees follow on January 18 ($25 per shipment for non-electronic trade documents, $5 for manual paper air waybills), and zone classifications change for select US origin-destination ZIP pairs on February 1, per the FedEx rate changes page."
        ],
        "table": {
          "caption": "FedEx Home Delivery list price, before fuel and discounts: transportation rate plus the residential surcharge · Sources: FedEx Standard List Rates 2026 and 2027; FedEx 2027 surcharge and fee changes. Totals and percentages are our arithmetic.",
          "headings": [
            "Package",
            "2026 list",
            "2027 list (from Jan 4)",
            "Change"
          ],
          "rows": [
            [
              "1 lb, zone 5",
              "$14.00 + $6.45 = $20.45",
              "$14.91 + $6.90 = $21.81",
              "+$1.36 (6.65%)"
            ],
            [
              "2 lb, zone 5",
              "$15.66 + $6.45 = $22.11",
              "$16.68 + $6.90 = $23.58",
              "+$1.47 (6.65%)"
            ],
            [
              "2 lb, zone 8",
              "$17.37 + $6.45 = $23.82",
              "$18.53 + $6.90 = $25.43",
              "+$1.61 (6.76%)"
            ],
            [
              "5 lb, zone 5",
              "$18.53 + $6.45 = $24.98",
              "$19.73 + $6.90 = $26.63",
              "+$1.65 (6.61%)"
            ]
          ]
        }
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: 5.9% is an average, and small sellers are not average",
        "paragraphs": [
          "The 5.9% is an average across every service, weight and zone. The packages small sellers ship most, light and residential, sit above it. Across the 1 to 5 lb rows of FedEx's Ground and Home Delivery table, zones 2 through 8, the transportation rate rises between 5.92% and 6.73%, by our arithmetic from FedEx's 2026 and 2027 list rate PDFs, with a simple average of 6.49%. That matches the 6.49% figure for 1 to 5 lb FedEx Ground packages from logistics data platform Loop, cited by Supply Chain Dive. The FedEx Ground and Home Delivery residential surcharge then rises faster, from $6.45 to $6.90, or 6.98%, per FedEx's 2027 surcharge table.",
          "Delivery area charges move further at the edges. FedEx's residential Delivery Area Surcharge goes from $6.60 to $7.00 (6.1%), and the extended residential charge from $8.80 to $9.60 (9.1%), per the same table. Fuel surcharges are a percentage on top of those charges, so a bigger base means more fuel dollars even if the weekly fuel percentage does not move.",
          "UPS Small Business Rates may move most. Here is the arithmetic on a hypothetical $10.00 Small Business Rates label, assuming the new 5% fuel surcharge is applied to the increased rate: $10.00 × 1.045 = $10.45, then $10.45 × 1.05 = $10.97, an increase of about 9.7%. UPS has not published the 2027 Small Business Rates yet, so treat that as the shape of the change, not a quote. The point is that a program sold as fuel-inclusive now carries a fuel line.",
          "The carriers are telling you where they want to go. Reporting on FedEx's quarterly results this week, FreightWaves said a 4% decline in Ground Economy volume was intentional, as FedEx price increases discouraged budget-conscious retailers, and that management expects more bottom-line capture from peak surcharges and the 5.9% increase. A quarter of FedEx's revenue growth in the quarter came from higher fuel surcharges, per the same report.",
          "Hypothesis, not yet measured: sellers who buy labels through a marketplace, a shipping platform or a carrier small-business program will see their discounted rates reset around these dates too, but not necessarily by the list percentage. The only way to know is to price your own top five package profiles on your own account once the new rates load."
        ]
      },
      {
        "id": "calendar",
        "title": "The calendar",
        "paragraphs": [
          "The UPS change lands inside peak. UPS's residential demand surcharge is $0.75 per Ground Residential and Ground Saver package from November 22 to December 26, as laid out in our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar), so the last week before Christmas carries both the new base rate and the peak charge. USPS's temporary holiday prices run until January 17, 2027, and its weekly fuel surcharge starts in January, as covered in our [USPS January 2027 piece](/intelligence/analysis/usps-january-2027-price-change-fuel-surcharge)."
        ],
        "table": {
          "caption": "2027 parcel price changes for US sellers · Sources: UPS shipping rates, Small Business Rates and fuel surcharge pages; FedEx rate changes page; USPS dates via our January 2027 analysis",
          "headings": [
            "Date",
            "Carrier",
            "What changes"
          ],
          "rows": [
            [
              "Nov 2, 2026",
              "UPS",
              "New fuel surcharge tables for US Ground, Ground Saver and domestic Air"
            ],
            [
              "Early Nov 2026",
              "UPS",
              "Details and origin ZIP codes for the new Ground and Ground Saver origin surcharge"
            ],
            [
              "Dec 21, 2026",
              "UPS",
              "Daily rates up an average net 5.9%; Small Business Rates up 4.5% plus a 5% fuel surcharge; Additional Handling minimum 50 lb; new Area Surcharge ZIP and zone lists"
            ],
            [
              "Jan 4, 2027",
              "FedEx",
              "List rates up an average 5.9%; surcharge and fee changes"
            ],
            [
              "Jan 4, 2027",
              "UPS",
              "Paper Air Shipping Documents $5 per package; paper 3 Day Select and Ground Shipping Documents $10 per package"
            ],
            [
              "Jan 18, 2027",
              "FedEx",
              "$25 paper document fee; $5 paper air waybill fee"
            ],
            [
              "Feb 1, 2027",
              "FedEx",
              "Zone changes for select US ZIP pairs"
            ]
          ]
        }
      },
      {
        "id": "forecasts",
        "title": "Where this lands on our forecast scorecard",
        "paragraphs": [
          "Forecast F2 on our [forecast scorecard](/intelligence/forecasts) says effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% general rate increases. UPS's December 21 date puts part of the 2027 increase inside that Q4 window, on top of the peak surcharges and fuel. It resolves January 31, 2027, and we will grade it hit or miss against carrier surcharge tables and shipper invoices. Our [October Intelligence Dossier](/intelligence/dossier) made the same point in September terms: headline 5.9% increases understate parcel inflation because surcharges are rising faster than base rates."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "None of this needs a new tool. It needs an hour with your shipping settings and last month's label history."
        ],
        "bullets": [
          "Find out which rate card you actually pay. List rates, UPS Small Business Rates, a FedEx account discount, or labels bought through a marketplace or shipping platform all change differently. Write down your top five package profiles by weight and zone, and the label cost for each today.",
          "If you are on UPS Small Business Rates, model the change at about 9.7% (our arithmetic above, assuming the 5% fuel surcharge applies to the increased rate) until UPS posts the 2027 preview, then price the same five profiles against FedEx, USPS and your platform's labels.",
          "Re-price shipping templates and free-shipping thresholds for anything that ships after December 21. Orders placed in the last days before Christmas will ship on the new UPS rates plus the $0.75 peak surcharge. On a hypothetical $25 free-shipping order, a $1.47 label increase like FedEx's 2 lb, zone 5 example above is almost 6% of revenue (our arithmetic).",
          "If you pass the increase to buyers, count the fee drag. Amazon's referral fee and eBay's final value fee are both calculated on totals that include buyer-paid shipping, per our [fee pages](/fees). At the 13.6% rate shown on our [eBay fee page](/fees/ebay), passing $1.47 to the buyer adds about $0.20 in eBay fees (our arithmetic). Compare channels at your real price points on the [fee comparison by item price](/fees/compare-by-item-price).",
          "Check heavy and bulky SKUs. UPS's Additional Handling minimum billable weight rises from 40 lb to 50 lb on December 21, and FedEx's US dimension- and weight-based Additional Handling charges rise 7.1% to 7.6% (for example $46.00 to $49.50 for weight-based, zone 2), per FedEx's surcharge table and our arithmetic. If you send bulky stock in by parcel, compare the cost of sending it with Amazon's own fulfillment at peak rates on our [Amazon holiday peak fee page](/fees/amazon/holiday-peak-2026).",
          "Retire paper shipping documents now. UPS charges $5 per package for paper Air Shipping Documents and $10 for paper Ground or 3 Day Select documents from January 4, and FedEx charges $5 for a manual paper air waybill from January 18. Print labels from an electronic shipping system instead."
        ]
      },
      {
        "id": "what-were-watching",
        "title": "What we're watching next",
        "paragraphs": [
          "We will update this piece as UPS fills in the blanks. The dates we are tracking:"
        ],
        "bullets": [
          "Early November: UPS's origin-based Ground and Ground Saver surcharge, the amount and which origin ZIP codes it covers.",
          "The UPS 2027 daily rate guide and Small Business Rates preview, which will show whether light residential packages sit above 5.9% at UPS as they do at FedEx.",
          "November 2: UPS's new fuel surcharge tables, and weekly diesel prices from the US Energy Information Administration, which our dossier lists as a leading signal for forecast F2.",
          "Late January: forecast F2 resolves. Follow the scorecard and the [intelligence hub](/intelligence) for the grade."
        ]
      },
      {
        "id": "faq",
        "title": "Questions sellers ask",
        "paragraphs": [
          "Answers as of October 30, 2026."
        ],
        "bullets": [
          "When does the UPS 2027 rate increase start? December 21, 2026, for UPS daily rates and Small Business Rates, per UPS. That is during the holiday peak, two weeks before FedEx.",
          "When does the FedEx 2027 rate increase start? January 4, 2027, for standard list rates and most surcharges, per FedEx. New paper-document fees follow on January 18 and zone changes on February 1.",
          "Is the 2027 increase really 5.9%? It is an average. On FedEx's published list rates, 1 to 5 lb Ground and Home Delivery packages rise 5.92% to 6.73% in zones 2 to 8 before surcharges, by our arithmetic, and the residential surcharge rises 6.98%. UPS has not published its detailed 2027 rates yet.",
          "What changes for UPS Small Business Rates? From December 21 they rise 4.5% and a 5% fuel surcharge applies, per UPS. If the surcharge applies to the increased rate, that works out to about 9.7% by our arithmetic."
        ]
      },
      {
        "id": "note",
        "title": "How this was made",
        "paragraphs": [
          "AI-assisted, human-reviewed. Figures come from the linked sources below, dated as shown. Package totals, percentage changes, the UPS Small Business Rates example and the eBay fee example are our arithmetic from the cited rates. Examples labeled hypothetical are illustrations, not quotes. Statements labeled as hypotheses have not been measured."
        ]
      }
    ],
    "sources": [
      {
        "label": "FedEx: Shipping rate changes (2027)",
        "href": "https://www.fedex.com/en-us/shipping/rate-changes.html",
        "context": "Average 5.9% list rate increase from Jan 4, 2027; surcharge and fee changes; $25 paper document and $5 paper air waybill fees from Jan 18; zone changes from Feb 1, 2027."
      },
      {
        "label": "FedEx: 2027 changes to surcharges and fees (PDF)",
        "href": "https://www.fedex.com/content/dam/fedex/us-united-states/services/surcharge_and_fee_changes_2027.pdf",
        "context": "Ground and Home Delivery residential charge $6.45 to $6.90; Delivery Area Surcharge residential $6.60 to $7.00 and extended residential $8.80 to $9.60; Additional Handling $46.00 to $49.50 (weight, zone 2)."
      },
      {
        "label": "FedEx Standard List Rates 2027 (PDF)",
        "href": "https://www.fedex.com/content/dam/fedex/us-united-states/services/FedEx_Standard_List_Rates_2027.pdf",
        "context": "FedEx Ground and Home Delivery rates by weight and zone, effective Jan 4, 2027."
      },
      {
        "label": "FedEx Standard List Rates 2026 (PDF)",
        "href": "https://www.fedex.com/content/dam/fedex/us-united-states/services/FedEx_Standard_List_Rates_2026.pdf",
        "context": "2026 FedEx Ground and Home Delivery rates used for the year-on-year comparison."
      },
      {
        "label": "UPS: Shipping zones and rates (2027 changes)",
        "href": "https://www.ups.com/us/en/support/shipping-support/shipping-costs-rates",
        "context": "Daily rates up an average net 5.9% from Dec 21, 2026; Area Surcharge ZIP and zone list changes; Additional Handling minimum 40 lb to 50 lb; origin-based Ground and Ground Saver surcharge details due early November; paper ASD ($5) and GSD ($10) surcharges from Jan 4, 2027."
      },
      {
        "label": "UPS: Small Business Rates",
        "href": "https://www.ups.com/us/en/shipping/zones-and-rates/small-business-rates",
        "context": "Small Business Rates up 4.5% and a 5% fuel surcharge from Dec 21, 2026; program described as inclusive of Delivery Area and fuel surcharges."
      },
      {
        "label": "UPS: Fuel surcharges",
        "href": "https://www.ups.com/us/en/support/shipping-support/shipping-costs-rates/fuel-surcharges",
        "context": "US Ground, Ground Saver and domestic Air fuel surcharge tables change Nov 2, 2026; weekly adjustment tied to EIA diesel prices."
      },
      {
        "label": "Supply Chain Dive: UPS plans 5.9% rate increase on Dec. 21 (Oct 26, 2026)",
        "href": "https://www.supplychaindive.com/news/ups-plans-59-rate-increase-on-dec-21/872751/",
        "context": "UPS 5.9% average increase from Dec 21; Small Business Rates up 4.5% with a 5% fuel surcharge; origin ZIP surcharge."
      },
      {
        "label": "Logistics Management: UPS announces 5.9% average rate increase for 2027, effective December 21 (Oct 26, 2026)",
        "href": "https://www.logisticsmgmt.com/article/ups_announces_5.9_average_rate_increase_for_2027_effective_december_21",
        "context": "UPS issued the 2027 increase the prior week; effective date a full week earlier than in recent years."
      },
      {
        "label": "Supply Chain Dive: FedEx preps 5.9% rate hike, surcharge increases for 2027 (Sept 21, 2026)",
        "href": "https://www.supplychaindive.com/news/fedex-preps-59-rate-hike-surcharge-increases-for-2027/830903/",
        "context": "FedEx Jan 4 increase and surcharge examples; Loop analysis that 1 to 5 lb FedEx Ground packages rise 6.49%."
      },
      {
        "label": "FreightWaves: FedEx cashes in on premium logistics services, fuel surcharges (Oct 29, 2026)",
        "href": "https://www.freightwaves.com/news/fedex-cashes-in-on-premium-logistics-services-fuel-surcharges",
        "context": "A quarter of FedEx revenue growth from higher fuel surcharges; intentional 4% Ground Economy volume decline; expected capture from peak surcharges and the 5.9% increase."
      },
      {
        "label": "MarketplaceBeta: The Q4 parcel surcharge calendar (Oct 20, 2026)",
        "href": "/intelligence/analysis/q4-2026-parcel-surcharge-calendar",
        "context": "UPS $0.75 residential peak surcharge Nov 22 to Dec 26, with UPS and FedEx sources."
      },
      {
        "label": "MarketplaceBeta: USPS January 2027 price change (Oct 27, 2026)",
        "href": "/intelligence/analysis/usps-january-2027-price-change-fuel-surcharge",
        "context": "USPS temporary holiday prices end Jan 17, 2027; weekly fuel surcharge starts in January, with USPS sources."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "Headline 5.9% increases understate parcel inflation as surcharges rise faster; EIA diesel as a leading signal for forecast F2."
      },
      {
        "label": "MarketplaceBeta fee pages: eBay",
        "href": "/fees/ebay",
        "context": "13.6% final value fee in most categories, calculated on totals including buyer-paid shipping (checked Oct 16, 2026)."
      }
    ]
  },
  {
    slug: "la-long-beach-rail-backlog-strike-holiday-inventory",
    seoTitle: "LA–Long Beach Backlog and Strike Risk: Q4 Stock Plan",
    metaDescription: "Contract extended to Nov 20; PMA's Nov. 6 statement does not announce a settlement. LA–Long Beach rail backlog elevated. Cyber Week checklist.",
    headline: "Your Cyber Week stock may be stuck at LA–Long Beach. Plan as if it misses.",
    dek: "A rail backlog is still holding thousands of import containers for nine days or more at Los Angeles and Long Beach, and PMA and ILWU Local 26 have extended the watchmen's contract a third time, now through November 20, and PMA's November 6 statement does not announce a settlement. Here is how to triage inventory, promotions and ad spend before Black Friday.",
    publishedOn: "2026-10-29",
    updatedOn: "2026-11-07",
    author: "MarketplaceBeta Intelligence",
    reviewMode: "automated",
    readTime: "6 min",
    tags: ["logistics", "ports", "inventory", "peak season", "Q4 2026"],
    takeaway: "If any Cyber Week inventory is still at Los Angeles or Long Beach, or on a ship headed there, treat its arrival date as unknown. This week, find those purchase orders, move promotions and ad budget onto stock that is already in a fulfillment center, and decide which SKUs you would rather run out of than pay to expedite.",
    forecastIds: ["F2", "F1"],
    newsletterSource: "campaign_port_backlog_q4",
    sections: [
      {
        id: "update-2026-11-07",
        title: "Update, November 7, 2026: a two-week extension to November 20, and PMA's statement does not announce a settlement",
        paragraphs: [
          "On November 6 the Pacific Maritime Association said it and ILWU Local 26 had agreed to extend the watchmen's contract through November 20, with additional talks scheduled during that period. PMA's statement gives the date but not a time of day, so we are not assuming one. The Journal of Commerce reported the same November 20 extension on November 7. This is the third postponement since the original November 1 deadline. PMA's November 6 statement does not announce a settlement; it says PMA remains committed to reaching a fair agreement. PMA's November 4 statement described terminals handling about 85% of Long Beach cargo and 33% of Los Angeles cargo.",
          "The rail queue moved in opposite directions at the two ports. The Port of Los Angeles' own on-dock rail report, as of November 6, shows 23,716 import containers waiting for on-dock trains at Los Angeles terminals, 8,172 of them for nine days or more (34.5%, per The Dwell). Those are Los Angeles-only figures, and both are up from the November 4 counts in the previous update (22,885 and 7,947). At Long Beach, The Dwell's compilation of the port's rail report dated November 5 shows 21,736 waiting, 4,063 of them for nine days or more (18.7%). Those are Long Beach-only figures, and both are down from November 4 (23,383 and 4,245). Because the two ports' latest reports carry different dates, we are not adding them into a single complex total this time. Most of the long-waiting boxes at both ports are BNSF-bound: 6,384 of the 8,172 at Los Angeles and 2,973 of the 4,063 at Long Beach, per The Dwell.",
          "November 20 is one week before Black Friday on November 27. Hypothesis, not yet measured: a strike that started on or after November 20 would mostly hit inventory that is already too late for Cyber Week receiving, so the bigger strike risk for sellers has shifted toward December replenishment. The rail backlog is the problem that is here today, and at Los Angeles it grew this week.",
          "The checklist in this piece still holds. PMA's November 6 statement extends the contract through November 20 and does not state a time of day. Use the period before that date to get firm answers from your forwarder on every rail-bound Cyber Week container, especially at Los Angeles.",
        ],
      },
      {
        id: "update-2026-11-05",
        title: "Update, November 5, 2026: the strike deadline moved again, to Friday, November 6",
        paragraphs: [
          "No strike started on Wednesday, November 4. Later that day the Pacific Maritime Association said it and ILWU Local 26 had agreed to extend the watchmen's contract through midnight Pacific Time on Friday night, November 6 (3 a.m. Eastern on Saturday, November 7), with negotiations continuing Friday with the Federal Mediation and Conciliation Service. Local 26 covers about 250 watchmen, roughly 2% of the ILWU workforce at the two ports, at terminals that handle more than half the complex's cargo, including about 85% of Long Beach and 33% of Los Angeles, per PMA. Transport Topics, citing Bloomberg, confirmed the new Friday midnight deadline on November 5. This is another postponement, not a deal. Everything below about the strike now applies to Friday midnight instead of Wednesday afternoon, and we will update this piece again after the new deadline.",
          "The rail queue is still elevated, and Long Beach is separately countable again. The Dwell's compilation of the ports' daily on-dock rail reports — page revised November 5, last observation November 4 — shows 22,885 import containers awaiting on-dock rail at Los Angeles, with 7,947 of them waiting nine days or more (34.7%), and 23,383 awaiting at Long Beach, with 4,245 at nine days or more (18.2%). Those are daily inventory counts, not average dwell. Against the Los Angeles-only October 30 figures in the November 2 update (21,683 awaiting, 8,937 at nine days or more), total Los Angeles waiting rose while the nine-day-plus count fell. Our arithmetic on the November 4 split: 46,268 containers awaiting across both ports and 12,192 at nine days or more.",
          "The checklist in this piece still holds, with Friday midnight Pacific as the new cutoff. If a Cyber Week load can leave an affected terminal before midnight Pacific on November 6, that is the one to push your forwarder on today.",
        ],
      },
      {
        id: "update-2026-11-02",
        title: "Update, November 2, 2026: the strike deadline moved to Wednesday, November 4",
        paragraphs: [
          "No strike started on November 1. On October 30 the Pacific Maritime Association said it and ILWU Local 26 had agreed to extend the watchmen's contract through 5 p.m. Pacific on Wednesday, November 4 (8 p.m. Eastern), with talks continuing with the help of the Federal Mediation and Conciliation Service, per PMA's statement and reports in the Journal of Commerce and Bloomberg Law. This is a postponement, not a deal. Everything below about the strike now applies to Wednesday afternoon instead of Sunday, and we will update this piece again after the new deadline.",
          "The rail queue has not cleared. The Port of Los Angeles' own on-dock rail report shows 21,683 import containers waiting for on-dock trains at its terminals as of October 30, and 8,937 of them, about 41% by our arithmetic, had waited nine days or more. That is Los Angeles only. We have not found a combined Los Angeles and Long Beach count published after the October 26 figures in the table below, so the 35,688 complex total is still the latest we can cite.",
          "The checklist in this piece still holds, with Wednesday as the new cutoff. If a Cyber Week load can leave an affected terminal before 5 p.m. Pacific on November 4, that is the one to push your forwarder on today.",
        ],
      },
      {
        id: "what-changed",
        title: "What changed",
        paragraphs: [
          "Two things hit the country's busiest container port complex in the same week. The first is already happening. On October 26, 35,688 import containers were waiting for on-dock trains at the ports of Los Angeles and Long Beach, and 10,562 of them had been on the terminals for at least nine days, according to FreightWaves' report of The Dwell's compilation of the ports' daily rail reports. Los Angeles was worse: 8,133 of its 19,626 rail-bound containers had waited nine days or longer, or 41.4%, against 15.1% at Long Beach.",
          "The queue has been building. Average dwell for containers leaving by rail rose to 7.19 days in September from 6.75 days in August, and for containers leaving by local truck to 3.18 days from 2.95, per Pacific Merchant Shipping Association data cited by FreightWaves. C.H. Robinson's October market update named Southern California intermodal railcar shortages as the constraint, and said truck-bound containers were moving relatively normally by comparison.",
          "The cause is volume. Los Angeles handled 1,042,652 TEU in September, its busiest month on record, and Long Beach handled a record 997,177 TEU. Loaded imports across the complex totalled 1,055,086 TEU, up 24.4% year on year, per the World Ports Organization.",
          "The second thing is a deadline. About 250 watchmen in International Longshore and Warehouse Union Local 26 have authorized a strike that could start at 5 p.m. Pacific on Sunday, November 1 (8 p.m. Eastern), when their latest contract extension expires. The Pacific Maritime Association, which represents the employers, says they are about 2% of the ILWU workforce at the two ports but work at terminals handling roughly 85% of Long Beach's cargo and 33% of Los Angeles' cargo, and that it expects other ILWU members to honor picket lines, which could halt vessel, yard and gate operations at those terminals. Talks were continuing with federal mediators as of October 28, per FreightWaves and the Long Beach Post.",
        ],
        table: {"caption": "Import containers awaiting on-dock rail, October 26, 2026 · Source: FreightWaves (Oct 28, 2026), citing The Dwell's compilation of the ports' daily rail reports", "headings": ["Port", "Awaiting rail", "Waiting 9+ days", "Share waiting 9+ days"], "rows": [["Los Angeles", "19,626", "8,133", "41.4%"], ["Long Beach", "16,062", "2,429", "15.1%"], ["Complex total", "35,688", "10,562", "about 30% (our arithmetic)"]]},
      },
      {
        id: "why-it-matters",
        title: "Why it matters: the calendar is shorter than the queue",
        paragraphs: [
          "Black Friday is November 27. That is 29 days from today, and inventory has to clear the port, move inland, and be received at a fulfillment center before it can sell. For the 10,562 containers already past nine days on the terminal, more than a week of that runway is gone before a train is even assigned.",
          "Amazon's own date has already passed. For Prime badge eligibility during Black Friday Week and Cyber Monday, Amazon asked that FBA inventory sent with Amazon-optimized shipment splits arrive by October 28, as we noted in our [Q4 holiday forecasts piece](/intelligence/analysis/q4-2026-holiday-forecasts-marketplace-sellers). Anything still sitting at a Southern California terminal today arrives after that date.",
          "The strike, if it happens, turns a slow lane into a stopped one at the terminals involved. The FreightWaves strike report notes that the complex is already contending with the rail backlog, which raises concerns about getting holiday merchandise to the eastern United States. Note the split, though. Truck-bound boxes are moving relatively normally, per C.H. Robinson. The rail lane is the one that is jammed.",
          "Hypothesis, not yet measured: the sellers most exposed are importers who land goods in Southern California and rail them to Midwest or East Coast warehouses, especially those with one or two containers of Cyber Week stock and no buffer. Large importers can reroute or split shipments. A small seller with one late container usually cannot.",
          "The cost side does not ease either. Our [October Intelligence Dossier](/intelligence/dossier) recorded diesel at an all-time high of $6.53 a gallon in late September and FedEx's domestic fuel surcharge at 32.25%. Fuel executives at the WEX OTR Summit this week warned diesel could stay elevated into spring 2027, and Dow Jones Energy's Denton Cinquegrana said US refineries have been running above 95% of capacity, per FreightWaves. Every workaround for a stuck container, whether transloading to truck, splitting shipments, or air freight on a few SKUs, costs more than the plan it replaces.",
        ],
      },
      {
        id: "forecasts",
        title: "Where this lands on our forecast scorecard",
        paragraphs: [
          "Two calls on our [forecast scorecard](/intelligence/forecasts) are exposed. Forecast F2 says effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% general rate increases. A port disruption does not change parcel rate cards directly, but expedited and rerouted freight pushes the same way on landed cost. Forecast F1 says US online holiday sales from November 1 to December 31 grow at least 6% year on year. Demand is not the variable a port problem moves. Available inventory is. Both resolve January 31, 2027, and we will grade them hit or miss in public.",
        ],
      },
      {
        id: "what-to-do-this-week",
        title: "What to do this week",
        paragraphs: [
          "Do these before November 20, the contract date in PMA's November 6 statement, which gives no time of day, not after the first missed delivery date.",
        ],
        bullets: [
          "List every open purchase order with goods on the water or at a terminal. For each one, ask your forwarder three things: which port and terminal, whether it leaves by rail or truck, and the current estimate to your warehouse or fulfillment center. The Local 26 strike notice named eight locations, per the World Ports Organization: APM Terminals, Long Beach Container Terminal, Total Terminals International, SSA C-60, SSA A-90, SSA LB 206, Pacific Container Terminal and OH 55.",
          "For rail-bound containers that matter for Cyber Week, ask for a price to transload to truck out of Southern California. Truck-bound containers are the lane that is still moving, per C.H. Robinson. Compare the extra cost per unit with the margin on those units at your planned deal price, not at full price.",
          "Move promotions and ad budget onto stock you already have. Do not commit a Cyber Week deal or a budget increase to a SKU whose replenishment is in the rail queue. On Amazon, a Black Friday Week or Cyber Monday deal carries a $100 upfront fee plus 1.5% of promotional sales, capped at $5,000, as covered in our [holiday forecasts piece](/intelligence/analysis/q4-2026-holiday-forecasts-marketplace-sellers), and you pay to run a deal you may not be able to fill.",
          "If a SKU sells on more than one channel and stock will be short, allocate units to the channel that keeps the most margin at peak fees. Start with our [Amazon holiday peak fee page](/fees/amazon/holiday-peak-2026), the [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart) and the [fee change log](/fees/changelog).",
          "Decide now which SKUs justify air freight or a domestic reorder, and which you will let run out. Make that list while you have options, before November 20, rather than after a strike starts.",
          "On channels where you set your own handling time, lengthen it on SKUs that depend on stuck replenishment instead of cancelling orders later.",
        ],
      },
      {
        id: "what-were-watching",
        title: "What we're watching next",
        paragraphs: [
          "We will update this piece again after November 20, and sooner if a strike starts or a cited source announces a settlement. The signals we are tracking:",
        ],
        bullets: [
          "The November 20 date in PMA's November 6 contract extension (the prior extension ran through midnight Pacific on November 6), and whether other ILWU members honor Local 26 picket lines if that date passes without a settlement in the statements cited here.",
          "The ports' daily rail reports, specifically whether the count of containers waiting nine days or more starts to fall.",
          "Weekly diesel prices from the US Energy Information Administration, which our dossier lists as a leading signal for forecast F2.",
          "Cyber Week sales tracking against forecast F1. See the full context on the [intelligence hub](/intelligence).",
        ],
      },
      {
        id: "note",
        title: "How this was made",
        paragraphs: [
          "Figures come from the linked sources below, dated as shown. The share of containers waiting nine days or more across the whole complex is our arithmetic from FreightWaves' figures and, for the November 4 counts, from The Dwell. Statements labeled as hypotheses have not been measured. Updated November 2, 2026 with the deadline extension and the Port of Los Angeles' October 30 rail count. Updated November 5, 2026 with PMA's further extension through midnight Pacific on November 6 and The Dwell's November 4 Los Angeles and Long Beach rail counts. Updated November 7, 2026 with PMA's extension through November 20, the Port of Los Angeles' November 6 rail count and Long Beach's November 5 rail count via The Dwell.",
        ],
      },
    ],
    sources: [
      {"label": "FreightWaves: Backlog grows as 35,000 containers await rail service at LA–Long Beach (Oct 28, 2026)", "href": "https://www.freightwaves.com/news/backlog-grows-as-35000-containers-await-rail-service-at-la-long-beach", "context": "35,688 containers awaiting rail on Oct 26, 10,562 for nine days or more; port splits; PMSA dwell data (7.19 vs 6.75 days rail, 3.18 vs 2.95 truck); C.H. Robinson on Southern California railcar shortages and truck-bound containers moving relatively normally."},
      {"label": "FreightWaves: Strike threat by port security workers at Los Angeles–Long Beach (Oct 28, 2026)", "href": "https://www.freightwaves.com/news/strike-threat-by-port-security-workers-at-los-angeles-long-beach", "context": "About 250 ILWU Local 26 watchmen; strike possible from 5 p.m. Pacific Nov 1; PMA figures of 2% of the workforce and terminals handling about 85% of Long Beach and 33% of Los Angeles cargo; talks continuing with federal mediators."},
      {"label": "Long Beach Post: Strike vote by security workers threatens to halt most cargo at Port of Long Beach (Oct 28, 2026)", "href": "https://lbpost.com/news/business/trade-transportation/strike-port-security-la-long-beach-cargo-halt", "context": "Negotiations since July 2025; PMA and Port of Long Beach statements; no deal as of Oct 28."},
      {"label": "World Ports Organization: 250 watchmen authorise strike at busiest US container port complex", "href": "https://www.worldports.org/250-watchmen-authorise-strike-at-busiest-us-container-port-complex/", "context": "Eight locations named in Local 26's Oct 23 notice; September volumes of 1,042,652 TEU (Los Angeles) and 997,177 TEU (Long Beach); loaded imports of 1,055,086 TEU, up 24.4% year on year."},
      {"label": "FreightWaves: Diesel prices may stay elevated into spring 2027, fuel executives warn (Oct 28, 2026)", "href": "https://www.freightwaves.com/news/diesel-prices-may-stay-elevated-into-spring-2027-fuel-executives-warn", "context": "WEX OTR Summit panel; diesel elevated into spring 2027; US refineries above 95% of capacity per Dow Jones Energy."},
      {"label": "Amazon Seller Forums: Holiday 2026 fees and deadlines", "href": "https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff", "context": "Oct 28 inbound arrival date for Prime badge eligibility with Amazon-optimized splits; deal fees of $100 upfront plus 1.5% of promotional sales, capped at $5,000."},
      {"label": "PMA: Statement on Contract Extension With ILWU Local 26 (Oct 30, 2026, distributed via Public)", "href": "https://www.pubt.io/view/B1D61AAD2416C64FD19D59DB80483258C4503FFE", "context": "PMA's Oct 30 statement announcing the contract extension with Local 26."},
      {"label": "Journal of Commerce: Strike deadline at LA-LB ports delayed until Nov. 4: PMA (Oct 30, 2026)", "href": "https://www.joc.com/article/strike-deadline-at-la-lb-ports-delayed-until-nov-4-pma-6315329", "context": "Nov 1 deadline reset to Nov 4; talks continue with the Federal Mediation and Conciliation Service."},
      {"label": "Bloomberg Law: Port Workers, Employers Push Long Beach Strike Threat to Nov. 4 (Oct 30, 2026)", "href": "https://news.bloomberglaw.com/daily-labor-report/port-workers-employers-push-long-beach-strike-threat-to-nov-4", "context": "Extension signed through 5 p.m. on Nov 4, per PMA's Friday statement; previous agreement expired July 2025."},
      {"label": "Port of Los Angeles: Import On-Dock Rail Awaiting Loading (as of Oct 30 and Nov 6, 2026)", "href": "https://kentico.portoflosangeles.org/getmedia/e738dff4-39ec-4290-a54c-f3ca57be77f4/import-on-dock-rail-report", "context": "Oct 30: 21,683 import containers awaiting on-dock rail at Los Angeles terminals, 8,937 for nine days or more. Nov 6: 23,716 awaiting, 8,172 for nine days or more (BNSF 16,090 with 6,384 at 9+ days; Union Pacific 7,626 with 1,788). Los Angeles only."},
      {"label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)", "href": "/intelligence/dossier", "context": "Record diesel of $6.53 a gallon in late September and FedEx's 32.25% domestic fuel surcharge, with the dossier's own cited sources; EIA diesel as a leading indicator for forecast F2."},
      {"label": "PMA: Updated Statement on Negotiations With ILWU Local 26 (Nov 4, 2026)", "href": "https://www.pmanet.org/press_releases/updated-statement-on-negotiations-with-ilwu-local-26/", "context": "Contract extended through midnight Pacific Time Friday night, November 6; negotiations continue Friday with FMCS; Local 26 about 250 watchmen (~2% of ILWU workforce) at terminals handling more than half the ports' cargo, including about 85% of Long Beach and 33% of Los Angeles."},
      {"label": "Transport Topics: Strike Deadline at Port of LA Extended to Friday (Nov 5, 2026)", "href": "https://www.ttnews.com/articles/strike-deadline-port-la", "context": "Confirms the Friday midnight Pacific extension after the Nov 4 deadline passed without a deal or a strike; Bloomberg-sourced trade press."},
      {"label": "The Dwell: Rail dwell, Los Angeles vs Long Beach (checked Nov 5 and Nov 7, 2026)", "href": "https://the-dwell.com/boxdwell/rail-dwell-la-long-beach", "context": "Nov 4 observation: Los Angeles 22,885 awaiting on-dock rail, 7,947 at 9+ days (34.7%); Long Beach 23,383 awaiting, 4,245 at 9+ days (18.2%). Page revised Nov 7: Los Angeles 23,716 (8,172 at 9+ days, 34.5%, report of Nov 6); Long Beach 21,736 (4,063 at 9+ days, 18.7%, report of Nov 5). Daily inventory counts compiled from the ports' on-dock rail reports, not average dwell."},
      {"label": "PMA: Statement on Negotiations with ILWU Local 26 at the Ports of LA and Long Beach (Nov 6, 2026)", "href": "https://www.pmanet.org/press_releases/statement-from-the-pacific-maritime-association-on-negotiations-with-ilwu-local-26-at-the-ports-of-la-and-long-beach/", "context": "Contract extended through Nov. 20, with additional talks scheduled during that period; no time of day stated."},
      {"label": "Journal of Commerce: PMA, ILWU Local 26 extend contract to Nov. 20 as talks continue (Nov 7, 2026)", "href": "https://www.joc.com/article/pma-ilwu-local-26-extend-contract-to-nov-20-as-talks-continue-6319573", "context": "Corroborates the November 20 extension and that talks continue."},
    ],
  },
  {
    "slug": "eu-3-euro-duty-2-euro-handling-fee-us-sellers",
    "seoTitle": "EU €3 Duty and €2 Handling Fee: What US Sellers Pay",
    "metaDescription": "From Nov 1, 2026 the EU adds a €2 handling fee to the €3 duty, per distinct item. Worked examples for US sellers shipping to EU buyers.",
    "headline": "From November 1, each distinct item you ship to an EU buyer carries €5 in fixed charges. Small mixed orders take the hit",
    "dek": "Since July 1, every distinct item in a low-value parcel entering the EU has paid a flat €3 customs duty. From November 1, 2026, the EU adds a €2 Union handling fee per item, at any order value, and it is not temporary. Both are charged per declaration line, not per parcel. For a US maker sending a €39 order with three different products to France, that is €15 before VAT. Here is the math, what your channels do with it, and what to change before Sunday.",
    "publishedOn": "2026-10-28",
    "updatedOn": "2026-10-28",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "6 min",
    "tags": [
      "EU customs",
      "cross-border",
      "Etsy",
      "eBay",
      "USPS",
      "landed cost"
    ],
    "takeaway": "Before November 1, re-price EU orders on a per-distinct-item basis, not per parcel: budget €5 for every different product in a parcel up to €150, and €2 per distinct item plus the normal duty above €150. Then decide which small, mixed EU orders you still want. Ship them duty-paid, with one consistent description for variants of the same product, or stop offering them.",
    "forecastIds": [
      "F10"
    ],
    "newsletterSource": "campaign_kw_eu_3_duty",
    "sections": [
      {
        "id": "what-changed",
        "title": "What changed",
        "paragraphs": [
          "Two EU charges now sit on top of VAT for goods a non-EU seller ships to an EU consumer. The first is old news. Since July 1, 2026, the EU has charged a temporary €3 customs duty per item on consignments worth up to €150, replacing the duty exemption that applied until June 30, per the European Commission's guidance. \"Item\" means a tariff classification, not a unit: five T-shirts are €3, three T-shirts and a watch are €6, per the Commission. The flat duty runs until July 1, 2028, when normal tariff rates take over, per the Council of the EU.",
          "The second is new. Commission Delegated Regulation (EU) 2026/2152, published in the Official Journal on October 22, sets a Union handling fee of €2 per item, and it applies from November 1, 2026, as VATupdate and the Commission's own customs reform page report. The Commission's October 5 guidance says the fee applies per item like the €3 duty but regardless of value, so parcels above €150 pay it too, and that, unlike the €3 duty, it \"is not temporary\". Ireland's Revenue says it is non-refundable, \"even where goods are faulty\". Estonia's tax and customs board says it applies to business-to-consumer parcels, not to business-to-business trade or gifts between private people, and that a parcel whose customs declaration is lodged on or after November 1 pays it even if it was ordered earlier.",
          "Both charges are counted per declaration line. The Commission's guidance says that, because of IT limits, the €3 duty and the handling fee \"will automatically apply per declaration line irrespective of the quantity\", and that grouping different items under the highest rate is not allowed where the €3 duty applies. Identical goods may be grouped on one line, but if they are split across two lines they are charged twice, per Commission Delegated Regulation (EU) 2026/1022. The same date brings one more requirement: from November 1, product identifiers become mandatory for each item in distance sales up to €150, with enforcement starting that day, per the Commission's guidance."
        ]
      },
      {
        "id": "why-it-matters",
        "title": "Why it matters: a fixed per-item charge punishes small, mixed orders",
        "paragraphs": [
          "A percentage duty scales with price. A flat charge per distinct item does not, so it lands hardest on cheap goods and on orders that mix product types. That describes much of what makers sell to Europe: a printed planter, a keychain and a set of cable clips in one envelope. Our [de minimis analysis](/intelligence/analysis/de-minimis-suspension-small-sellers-2026) covered the same change on the US side, where the $800 exemption is suspended and repealed by statute from July 2027. In 2026 both sides of the Atlantic ended duty-free small parcels.",
          "The first seller data point is not encouraging. Grindstore, a North Norfolk online retailer with 25 staff, told ChannelX it received 2,371 EU retail orders from July 1 to October 8, against 6,128 in the same period of 2025, a 61.3% fall, after EU orders had been up 40% year over year in January and February. It says its average shipping charge on euro orders rose from €4.09 to €11.07 to cover the new customs and handling costs. That is one company's self-reported figures, and it attributes the whole drop to the charges, which we cannot verify. Goods from Great Britain face the same EU charges as goods from the US, per Ireland's Revenue, so it is the closest comparison available.",
          "The EU says the volume problem behind this is real: 5.9 billion low-value e-commerce items were imported in 2025, four times the 2022 volume, per the Commission's customs reform page. Our October [Intelligence Dossier](/intelligence/dossier) put the lesson of 2026 this way: cost-of-goods certainty now decays in weeks. For cross-border sellers, this is another example."
        ]
      },
      {
        "id": "the-math",
        "title": "The math, per order",
        "paragraphs": [
          "Worked examples below are hypothetical: a US maker shipping to an EU consumer, euro values, before VAT and before any carrier or duty-paid service fees. The €3 and €2 amounts are from the Commission's guidance and Delegated Regulation 2026/2152. How variants are counted follows eBay's published examples, where two cotton T-shirts of different colours and sizes count as one item type, and a cotton and a polyester T-shirt count as two."
        ],
        "table": {
          "caption": "Fixed EU charges per order, before VAT (hypothetical orders) · Sources: European Commission guidance (Oct 5, 2026); Delegated Regulation (EU) 2026/2152; eBay item-type examples",
          "headings": [
            "Order (hypothetical)",
            "Goods value",
            "Distinct items",
            "Since Jul 1 (€3 per item)",
            "From Nov 1 (€3 + €2 per item)",
            "Share of goods value from Nov 1"
          ],
          "rows": [
            [
              "One printed planter",
              "€25",
              "1",
              "€3",
              "€5",
              "20%"
            ],
            [
              "Three planters, same product in three colours, one description",
              "€75",
              "1",
              "€3",
              "€5",
              "about 7%"
            ],
            [
              "Planter + keychain + cable clips, three different products",
              "€39",
              "3",
              "€9",
              "€15",
              "about 38%"
            ],
            [
              "One €160 lamp (above €150)",
              "€160",
              "1",
              "Normal duty rate for its tariff line, no €3 flat duty",
              "Normal duty + €2",
              "Depends on the duty rate"
            ]
          ]
        }
      },
      {
        "id": "who-pays",
        "title": "Who pays, by channel",
        "paragraphs": [
          "The law puts the charges on the business, not the shopper. The Commission says the €3 duty is paid by the declarant, meaning the seller, the IOSS holder or their representative. Revenue says the handling fee is paid by the e-commerce seller or the business delivering the goods, which may pass it on. The buyer then sees it either at checkout or at the door. Whichever it is, the landed price to the buyer goes up.",
          "Etsy collects VAT at checkout on EU-bound orders up to €150 and says the €3 duty \"may be included in the amount paid at checkout or collected upon delivery\", depending on how the seller ships, per its help pages. Labels bought on Etsy transmit Etsy's IOSS number automatically. eBay says import charges, including the €3 duty, are collected at checkout for items sent through eBay International Shipping or the Global Shipping Programme. With other shipping methods, the provider may charge the seller before shipment or the buyer before delivery. eBay's Global Shipping team told sellers on October 19 to contact their shipping provider to learn how the €2 fee will be collected, and to consider adjusting prices or shipping charges. Neither platform has said publicly how the €2 fee appears at checkout. We checked on October 28.",
          "USPS made Delivered Duty Paid mandatory from July 1 for dutiable items sent by Priority Mail Express International, Priority Mail International and First-Class Package International Service to Germany, France, Belgium, Denmark, Finland, Luxembourg, Portugal, Monaco, Andorra and the French overseas departments. It is optional for Austria, Estonia, Italy, Malta, the Netherlands, Slovakia, Spain and Sweden, per Postal Bulletin 22707. USPS says its systems assign a tariff code from your item descriptions and assess the €3 duty \"for each unique HS Code\", that opting in adds a third-party service fee, and that overpaid amounts are not refunded. Its prepaid-duties page, checked October 28, describes the €3 duty but does not yet mention the €2 fee. Our hypothesis is that duty-paid quotes will include it from November 1. Check a real quote on November 1 before you assume so."
        ]
      },
      {
        "id": "what-to-do-this-week",
        "title": "What to do this week",
        "paragraphs": [
          "This is not customs or tax advice. For classification questions, use a licensed customs broker or your carrier's guidance. For most small sellers, this is pricing work:"
        ],
        "bullets": [
          "Pull your last 90 days of EU orders and count distinct products per parcel, not units. That count times €5 is your new fixed cost per order from November 1. Add it to your margin math with the [product profitability guide](/guides/product-profitability) and your [Etsy](/fees/etsy) or [eBay](/fees/ebay) fee page.",
          "Price EU shipping per distinct item, not per parcel. A flat EU shipping rate built for one item will lose money on a three-product order. If your channel allows it, add an EU-specific additional-item charge sized to the €5, or set a minimum EU order value.",
          "Write one accurate description for variants of the same product (colour, size) so they can be declared on one line, which eBay's examples count as one item type. Do not merge genuinely different products under one description or tariff code to save fees. That is misdeclaration, and the Commission's guidance says grouping different items is not allowed where the €3 duty applies.",
          "Ship EU orders duty-paid where your channel or carrier offers it, so buyers are not asked to pay at the door. Grindstore's experience suggests buyers react to the total landed price, however it is collected, so duty-paid alone will not protect demand. It will reduce refused parcels and complaints.",
          "Check that your label tool sends a product identifier for every line from November 1. The Commission's guidance says the merchant product identifier, the one assigned by the seller or platform, is required in all cases. Ask your carrier or label provider what they transmit.",
          "Run the cut list. If an EU order of €20 or less with mixed products no longer clears your margin after €5 or more per item, stop offering it, or offer only single-product bundles to the EU. If you have steady EU volume, it is worth costing EU-held stock. Revenue says goods already in an EU member state when ordered carry no customs duty or handling fee. That route brings VAT and registration obligations, so treat it as a hypothesis to price with an adviser, not a recommendation.",
          "Log the change. Our [fee change log](/fees/changelog) tracks marketplace fee moves. Treat this one as a dated cost line in your own records too: €3 since July 1, plus €2 from November 1."
        ]
      },
      {
        "id": "what-we-are-watching",
        "title": "What we are watching next",
        "paragraphs": [
          "Forecast F10 on our [forecast scorecard](/intelligence/forecasts) is the US side of this story: de minimis is not restored before the statutory repeal takes effect in July 2027. It was logged on October 14, resolves July 1, 2027, and will be graded hit or miss against the Federal Register and CBP record. The EU's move does not test F10, but it points the same way: as written, neither the EU rules nor the US rules bring back duty-free small parcels.",
          "Dated checkpoints: November 1, when the €2 fee and the product-identifier requirement start, and when we will check how Etsy, eBay and USPS duty-paid quotes show the new fee; the Commission's two-year cost reports, which can change the €2 amount, per VATupdate; and July 1, 2028, when the €3 flat duty is due to give way to normal tariff rates and the handling fee is due to be lower for goods sold from an EU customs warehouse for distance sales, per the Commission's guidance. Any new marketplace or carrier notices will show up on the [intelligence dashboard](/intelligence)."
        ]
      }
    ],
    "sources": [
      {
        "label": "European Commission: The temporary EUR 3 customs duty and the Union handling fee, Guidance for Member States and Trade (version of Oct 5, 2026)",
        "href": "https://taxation-customs.ec.europa.eu/document/download/053e5b4e-f0be-4f20-9a23-3e3b659a6676_en?filename=Customs+Guidance+on+EUR+3+customs+duty.pdf",
        "context": "UHF fixed at €2 per item and expected from Nov 1, 2026; applies regardless of value and is not temporary; €3 duty and UHF apply per declaration line irrespective of quantity; grouping under the highest rate not allowed; definition of item; product identifiers mandatory from Nov 1, 2026 for distance sales up to €150, merchant PID required in all cases, deliberately misleading PIDs an infringement; UHF part of the VAT taxable amount (IOSS treatment); lower UHF from customs warehouses for distance sales from Jul 1, 2028."
      },
      {
        "label": "European Commission, Taxation and Customs Union: Guidance and legal text on the temporary flat fee on low-value imports (Jun 8, 2026; updated Jul 20, 2026)",
        "href": "https://taxation-customs.ec.europa.eu/news/guidance-and-legal-text-temporary-flat-fee-low-value-imports-which-will-apply-until-1-july-2028-2026-06-08_en",
        "context": "€3 per item (tariff classification, not quantity) on consignments up to €150 from Jul 1, 2026 until Jul 1, 2028; T-shirt and watch examples; declarant (seller, IOSS holder or representative) pays."
      },
      {
        "label": "European Commission: EU Customs Reform",
        "href": "https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en",
        "context": "Oct 7, 2026 notice: the EU applies the €2 Union handling fee from Nov 1, 2026; 5.9 billion low-value e-commerce items imported in 2025, four times 2022."
      },
      {
        "label": "Council of the EU: Council gives final green light to new customs duty rules for small parcels (Feb 11, 2026)",
        "href": "https://www.consilium.europa.eu/en/press/press-releases/2026/02/11/council-gives-final-green-light-to-new-customs-duty-rules-for-small-parcels/",
        "context": "Interim €3 duty per item category in parcels under €150 from Jul 1, 2026 to Jul 1, 2028; normal tariffs once the customs data hub is operational."
      },
      {
        "label": "Official Journal of the EU: Commission Delegated Regulation (EU) 2026/2152 (OJ L, Oct 22, 2026)",
        "href": "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202602152",
        "context": "Sets the Union handling fee at €2 per item; enters into force on publication and applies from the tenth day after."
      },
      {
        "label": "VATupdate: European Union introduces €2 handling fee for distance-sale imports from 1 November 2026 (Oct 27, 2026)",
        "href": "https://www.vatupdate.com/2026/10/27/european-union-introduces-e2-handling-fee-for-distance-sale-imports-from-1-november-2026/",
        "context": "Delegated Regulation 2026/2152 adopted Sep 21, published Oct 22, applies Nov 1, 2026; amount reviewable using two-yearly Commission cost reports."
      },
      {
        "label": "EUR-Lex: Commission Delegated Regulation (EU) 2026/1022 on definitions, customs declarations and data elements for the EUR 3 customs duty (OJ L, 2026)",
        "href": "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202601022",
        "context": "Defines item; the €3 duty applies to each item, including when identical items are declared on separate lines, though identical items may be grouped on one line."
      },
      {
        "label": "Revenue (Ireland): Union Handling Fee press release (Sep 29, 2026)",
        "href": "https://www.revenue.ie/en/corporate/press-office/press-releases/2026/pr-092926-handling-fee.aspx",
        "context": "€2 per distinct item from Nov 1, 2026, in addition to the €3 duty; non-refundable even where goods are faulty; paid by the seller or delivering business, who may pass it on; applies to goods from Great Britain; no duty or fee where goods are in an EU member state when ordered; worked examples."
      },
      {
        "label": "Estonian Tax and Customs Board: EU to introduce handling fee for parcels ordered from non-EU countries from 1 November (Oct 26, 2026)",
        "href": "https://www.emta.ee/en/news/eu-introduce-handling-fee-parcels-ordered-non-eu-countries-1-november",
        "context": "€2 per item line; B2C only, not B2B or private gifts; applies where the declaration is lodged on or after Nov 1."
      },
      {
        "label": "eBay Global Shipping: EU Customs Update, New Union Handling Fee (Oct 19, 2026)",
        "href": "https://www.ebayglobalshipping.com/announcements/20603122",
        "context": "€2 per distinct item from Nov 1, 2026, regardless of value; sellers told to contact their shipping provider and consider price or shipping-charge changes."
      },
      {
        "label": "eBay UK: Taxes and import charges (help page)",
        "href": "https://www.ebay.co.uk/help/fees-billing/sell-fees-payments/payments-taxes-import-charges?id=4121",
        "context": "€3 duty collected at checkout via eBay International Shipping and the Global Shipping Programme; other methods may charge the seller or buyer; item-type examples (two cotton T-shirts of different colour and size = 1 item type)."
      },
      {
        "label": "Etsy Help: Will I have to pay for tax, customs, or tariffs on my order?",
        "href": "https://help.etsy.com/hc/en-gb/articles/115015691007-Will-I-Have-to-Pay-for-Tax-Customs-or-Tariffs-on-My-Order",
        "context": "Etsy charges VAT at checkout on EU-bound purchases under €150; €3 duty may be included at checkout or collected on delivery depending on how the seller ships."
      },
      {
        "label": "Etsy Help: Custom fees and physical VAT collection",
        "href": "https://help.etsy.com/hc/en-us/articles/360000337247-Custom-Fees-and-Physical-VAT-Collection",
        "context": "Etsy's IOSS number transmitted automatically on Etsy labels; €3 duty collection varies by provider; no customs duty on goods sold within the EU."
      },
      {
        "label": "USPS Postal Bulletin 22707: IMM revision, availability of USPS Delivered Duty Paid (effective Jul 1, 2026)",
        "href": "https://about.usps.com/postal-bulletin/2026/pb22707/html/updt_002.htm",
        "context": "DDP required for dutiable PMEI, PMI and FCPIS items to Germany, France, Belgium, Denmark, Finland, Luxembourg, Portugal, Monaco, Andorra and French overseas departments; available for Austria, Estonia, Italy, Malta, Netherlands, Slovakia, Spain and Sweden."
      },
      {
        "label": "USPS: Prepay import duties, taxes and fees (checked Oct 28, 2026)",
        "href": "https://www.usps.com/international/prepaid-import-duties.htm",
        "context": "€3 duty assessed per unique HS code assigned from item descriptions; third-party service fee added when opting in; overpayments not refunded; prepayment may be required to buy postage; no mention yet of the €2 fee."
      },
      {
        "label": "ChannelX: Grindstore reports 61% fall in EU orders since new customs charges took effect (Oct 26, 2026)",
        "href": "https://channelx.world/2026/10/grindstore-reports-61-fall-in-eu-orders-since-new-customs-charges-took-effect/",
        "context": "Company-reported: 2,371 EU retail orders Jul 1 to Oct 8, 2026 vs 6,128 a year earlier (-61.3%); EU orders +40% YoY in Jan-Feb 2026; average euro shipping charge €4.09 to €11.07; 25 staff."
      },
      {
        "label": "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        "href": "/intelligence/dossier",
        "context": "Permanent end of US de minimis and COGS certainty decaying in weeks; forecast F10."
      }
    ]
  },
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
    "slug": "usps-foreign-duty-billing-2026",
    "seoTitle": "USPS Can Bill You for Unpaid Foreign Duties: What Changed",
    "metaDescription": "Since Oct 19, 2026 USPS can bill senders for unpaid foreign duties, even on lost or returned parcels, plus 6% interest. Who's exposed and what DDP covers.",
    "headline": "USPS can now bill you for the duties your overseas buyer did not pay, even if the package was lost or sent back",
    "dek": "A USPS rule in effect since October 19, 2026 lets the Postal Service invoice the sender for unpaid foreign duties, taxes and import fees, with 6% a year interest on late payment and no way to contest the foreign amount through USPS. It was written because of the EU's new low-value parcel charges, but its text names no country. Here is who is exposed, what prepaying through USPS Delivered Duty Paid does and does not cover, and what to change this week.",
    "publishedOn": "2026-10-27",
    "updatedOn": "2026-10-27",
    "author": "MarketplaceBeta Intelligence",
    "readTime": "8 min",
    "tags": [
      "USPS",
      "international shipping",
      "customs",
      "duties",
      "2026"
    ],
    "takeaway": "Before your next international order, check whether the destination is one where USPS Delivered Duty Paid (DDP) is required or available, and prepay where you can. Where you cannot, the buyer still pays at the door, as before. What is new is that if the buyer does not pay and someone in the destination country goes after you or USPS, USPS now invoices you for it, whether the parcel was delivered, lost, damaged or returned. Price that risk into those destinations, or stop shipping there.",
    "forecastIds": [],
    "newsletterSource": "campaign_kw_usps_duty_billing",
    "sections": [
      {
        "id": "what-changed",
        "title": "What changed on October 19",
        "paragraphs": [
          "Since October 19, 2026, USPS can send you an invoice for duties, taxes or import fees on a package you mailed abroad if a customs authority, postal operator, customs broker or customs representative in the destination country asks you or USPS for them and they were not paid in full. You must pay the whole invoice by its due date even if you dispute it, and you owe it whether the item is delivered, lost, damaged or returned. Late payment carries 6% a year interest, and USPS can recover its collection costs. The source is USPS's interim final rule, [91 FR 66000 (document 2026-21310)](https://www.federalregister.gov/documents/2026/10/19/2026-21310/customs-requirements-and-payment-procedures-for-certain-customs-charges), published and effective October 19, 2026. It adds section 424 to the International Mail Manual (IMM), and USPS is taking comments until November 18, 2026.",
          "USPS's stated reason is the EU. Its notice says the European Commission eliminated the de minimis exemption for most low-value goods as of July 1, 2026, that some EU postal operators now require a delivered duty paid solution, and that when an item is sent duty unpaid and the charges cannot be recovered from the addressee, the destination postal operator may seek the unpaid amount from the mailer. Section 424 itself is not limited to the EU. It applies when any \"relevant party in the destination country\" seeks the money.",
          "This is the outbound side. The US ending de minimis, and the January 20, 2027 deadline for some mail shipments, concern goods coming into the US, and we cover them in our [de minimis analysis](/intelligence/analysis/de-minimis-suspension-small-sellers-2026). The 12.5% Section 301 duty discussed there does not apply to what you mail abroad."
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
export function latestAnalysis(limit = ANALYSIS_ARTICLES.length, articles: readonly AnalysisArticle[] = ANALYSIS_ARTICLES): AnalysisArticle[] {
  return articles.map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.publishedOn.localeCompare(x.a.publishedOn) || x.i - y.i)
    .slice(0, Math.max(0, limit))
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
