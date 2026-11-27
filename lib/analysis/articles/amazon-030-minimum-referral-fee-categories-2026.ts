import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "amazon-030-minimum-referral-fee-categories-2026",
  "seoTitle": "Amazon $0.30 Minimum Referral Fee 2026",
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
        "Because the minimum is a floor, it only matters when the percentage comes out below $0.30. Divide $0.30 by the category rate and you get the total sales price below which the floor takes over. The table below does that for the rates on Amazon's page. Our [Amazon fee table](/fees/amazon) carries the category rates. Pet Supplies charges 22% on veterinary diets, so there the floor only applies below about $1.36."
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
        "We think the minimum is a pricing signal more than a cost line. Amazon's table puts the floor right where a single low-price unit earns Amazon little, and leaves it off only a short list of rows such as Grocery and Gourmet, Gift Cards, Media and the video game rows. Read that way, the floor nudges sellers toward multipacks and higher ticket sizes in every other category.",
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
        "Check your sheet's category list against Amazon's minimum column, not just the five categories our October 16 [fee change log](/fees/changelog) entry called out. Grocery and Gourmet, Gift Cards, Media and the video game rows are the exceptions with no minimum.",
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
} satisfies AnalysisArticle
