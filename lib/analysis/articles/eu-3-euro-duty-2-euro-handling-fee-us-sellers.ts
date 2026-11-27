import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
    "slug": "eu-3-euro-duty-2-euro-handling-fee-us-sellers",
    "seoTitle": "EU €3 Duty, €2 Handling Fee: US Sellers",
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
  } satisfies AnalysisArticle
