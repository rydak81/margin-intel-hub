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
    slug: "usps-january-2027-price-change-fuel-surcharge",
    seoTitle: "USPS January 2027 Price Change: The Fuel Surcharge Arrives",
    metaDescription: "USPS's temporary 8% and holiday prices end Jan 17, 2027, and a weekly fuel surcharge starts in January. What it means for sellers' shipping costs.",
    headline: "January 17 is not a USPS price cut. It is the day your shipping cost starts moving every week.",
    dek: "Two temporary USPS increases roll off on January 17, 2027. A permanent, weekly fuel surcharge is coming in the same month, and UPS and FedEx raise rates on either side of it. Here is the calendar, the one number to watch, and what to fix before peak ends.",
    publishedOn: "2026-10-27",
    updatedOn: "2026-10-27",
    author: "MarketplaceBeta Intelligence",
    readTime: "6 min",
    tags: [
      "logistics",
      "USPS",
      "parcel",
      "shipping costs",
      "2027",
    ],
    takeaway: "Do not plan for cheaper USPS labels after January 17, 2027. Price shipping for January as a range, not a number, until USPS publishes its first fuel-surcharge percentage, and treat 8% as the line: a fuel surcharge under 8% of base postage leaves January labels cheaper than they were all summer, and one above it leaves them dearer.",
    forecastIds: [
      "F2",
      "F5",
    ],
    newsletterSource: "campaign_kw_usps_2027",
    sections: [
      {
        id: "what-changed",
        title: "What changed",
        paragraphs: [
          "On October 26 the Postal Service published a fuel surcharge FAQ on its PostalPro site: a surcharge on its competitively priced packages, calculated as a percentage of base postage and updated weekly from diesel and jet fuel prices published by the US Energy Information Administration. Supply Chain Dive reported the same day that it starts in January 2027 and covers USPS Ground Advantage, Priority Mail, Priority Mail Express and Parcel Select, domestic only, with negotiated contracts that \"may have customized language\".",
          "Value Added Resource, reading the same FAQ, reported that Ground Advantage and Parcel Select will follow diesel while Priority Mail and Priority Mail Express follow jet fuel, that each week's percentage will be announced only three to five days ahead for diesel and three to four days ahead for jet fuel, and that USPS has not disclosed the starting percentage, the formula, or any cap or floor. As of October 27 we have not seen a published start date beyond \"January\".",
          "This lands on top of two temporary increases that both end at 12:00 a.m. Central on January 17, 2027. The first is the 8% across-the-board increase on base postage for the same four products that took effect April 26, which USPS called in its March 25 notice a \"bridge to a permanent mechanism\". The second is the holiday pricing that started October 4, which adds $0.40 to $0.75 to a 0–3 lb Ground Advantage label depending on zone and price category, per the USPS announcement of August 25. In other words, the fuel surcharge is the permanent mechanism the 8% was bridging to.",
          "The private carriers move on either side of that date. UPS raises daily rates an average 5.9% on December 21, in the middle of peak, according to Supply Chain Dive's October 26 report of UPS's notice. FedEx list rates rise an average 5.9% on January 4, 2027, with its residential delivery charge going from $6.95 to $7.35 and its residential delivery area surcharge from $6.60 to $7.00, per FedEx as reported by Supply Chain Dive. Their residential peak demand surcharges end January 16 (UPS) and January 17 (FedEx), as we laid out in our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar).",
        ],
        table: {
          caption: "The winter parcel price calendar · Sources: USPS (Mar 25, Aug 25 and Oct 26, 2026), FedEx, UPS via Supply Chain Dive (Sep 21 and Oct 26, 2026)",
          headings: [
            "Date",
            "Carrier",
            "What happens",
          ],
          rows: [
            [
              "Dec 21, 2026",
              "UPS",
              "Daily rates up an average 5.9% (ground, air, international)",
            ],
            [
              "Jan 4, 2027",
              "FedEx",
              "List rates up an average 5.9%; residential delivery charge $6.95 to $7.35; residential delivery area surcharge $6.60 to $7.00",
            ],
            [
              "Jan 16–17, 2027",
              "UPS, FedEx",
              "Residential peak demand surcharges end",
            ],
            [
              "Jan 17, 2027, 12:00 a.m. CT",
              "USPS",
              "Temporary 8% increase and holiday prices both roll back",
            ],
            [
              "January 2027, date not yet published",
              "USPS",
              "Weekly fuel surcharge begins, as a percentage of base postage",
            ],
            [
              "Feb 1, 2027",
              "FedEx",
              "Zone changes for select US origin-destination ZIP pairs",
            ],
          ],
        },
      },
      {
        id: "why-it-matters",
        title: "Why it matters: the 8% line",
        paragraphs: [
          "Until now, a USPS label had one price that changed on dates announced well in advance; even this year's two temporary increases were filed weeks or months before they took effect. From January, USPS behaves like UPS and FedEx, with a cost that can move every week on a few days' notice.",
          "The arithmetic for the January rollback is simple, because the 8% and the fuel surcharge are both percentages of base postage. Take any label whose pre-April base price is B. From April 26 to January 16 it costs 1.08 × B, plus the holiday add-on from October 4. After January 17 it costs B × (1 + the fuel percentage). So a fuel surcharge below 8% leaves your January labels cheaper than your summer labels, and anything above 8% leaves them more expensive. That 8% is the number to watch when USPS publishes its first rate.",
          "We do not know where it will start, and neither does anyone else outside USPS. For scale only: in its March filing USPS cited FedEx's ground fuel surcharge at 25.50% and UPS's at 26.00%, and described its own 8% as less than one-third of what competitors charge for fuel alone. Hypothesis, not a forecast: USPS will price the surcharge below the private carriers' fuel rates to protect its share of light parcels, but Postmaster General David Steiner told the Governors in August, as Supply Chain Dive reported, that USPS has \"more price to take in the marketplace\". Plan for both.",
          "This is the pattern our [forecast scorecard](/intelligence/forecasts) has been tracking. Forecast F2 says effective Q4 residential parcel cost inflation for DTC sellers lands at or above 8% despite 5.9% general rate increases, and resolves January 31, 2027. Forecast F5 says Amazon's 2027 US fee announcement raises net cost through surcharge or restructuring layers rather than a headline referral increase. USPS has just made the same move: the headline temporary increase goes away and a variable surcharge takes its place. Each forecast is a dated call we will grade hit or miss in public.",
          "Marketplace fees amplify any shipping change you pass on. eBay calculates its final value fee on the total amount of the sale including shipping charged to the buyer, and Etsy charges its 6.5% transaction fee on the shipping price as well as the item price, per each marketplace's fee pages. If a fuel surcharge pushes you to raise buyer-paid shipping by $0.50, you pay roughly $0.07 of it back to eBay at 13.6% or about $0.03 to Etsy at 6.5% (our arithmetic, hypothetical). See our [eBay fees](/fees/ebay) and [Etsy fees](/fees/etsy) pages for the current rates.",
        ],
      },
      {
        id: "what-to-do-this-week",
        title: "What to do this week",
        paragraphs: [
          "None of this needs a new tool, and most of it is a spreadsheet change you can make before peak gets loud.",
        ],
        bullets: [
          "Price January shipping as a range. For your three highest-volume USPS label types, write down today's price, the pre-April base (today's price minus the holiday add-on, divided by 1.08), and the January cost at three hypothetical fuel rates, say 0%, 8% and 15%. If a free-shipping promise or flat shipping charge only works in the 0% case, fix it now.",
          "Do not cut shipping prices in a January promo plan on the assumption that USPS gets cheaper on the 17th. It may, by a little, if the first fuel rate is under 8%. It may not.",
          "Ask your label provider, marketplace label program or 3PL two questions in writing: will negotiated rates carry the USPS fuel surcharge, and what happens to a label bought before a weekly change and mailed after it? Value Added Resource reports the USPS FAQ says items must have correct postage at the time of mailing and short-paid items are subject to postage due. Until you have an answer, stop buying labels days ahead of ship date from January.",
          "Watch the December 21 to January 17 window if you ship UPS. UPS's 5.9% increase lands while USPS is still on holiday pricing, so the carrier comparison you ran in October will be wrong for the last week of peak. Re-run it with December 21 rates once UPS posts them.",
          "Agencies and multi-brand operators: add a weekly line for each carrier's fuel percentage to client reporting from January. A cost that moves weekly needs to be seen weekly.",
        ],
      },
      {
        id: "what-we-are-watching",
        title: "What we are watching next",
        paragraphs: [
          "USPS's first published fuel percentage and its start date. That single number decides whether January labels go up or down against the 8% line. We will add it to the [fee change log](/fees/changelog) and to the [intelligence dashboard](/intelligence) when it appears.",
          "Whether marketplace label programs and negotiated contracts are exempt, discounted or fully exposed. USPS says contracts \"may have customized language\"; that sentence matters more to most sellers than the base rule.",
          "Whether USPS files a separate January 2027 price change for shipping products. As of October 19, resellerindex.com reported no filing for stamps or Media Mail, and we have seen none for packages.",
          "January 31, 2027: forecast F2 resolves on the [scorecard](/intelligence/forecasts). December–January: Amazon's 2027 US fee notice, which tests F5. Background on both is in the October [Intelligence Dossier](/intelligence/dossier), and logistics coverage share is tracked weekly in the [Marketplace Pressure Index](/intelligence/pressure-index).",
        ],
      },
    ],
    sources: [
      {
        label: "USPS PostalPro: Fuel Surcharge Implementation FAQ (Oct 26, 2026)",
        href: "https://postalpro.usps.com/fuel-surcharge-faqs",
        context: "Fuel surcharge on competitively priced packages, a percentage of base postage, updated weekly from EIA diesel and jet fuel prices.",
      },
      {
        label: "Supply Chain Dive: USPS to debut weekly fuel fee in 2027 (Oct 26, 2026)",
        href: "https://www.supplychaindive.com/news/usps-to-debut-weekly-fuel-fee-in-2027-matching-fedex-ups-practices/872778/",
        context: "January 2027 start; products covered; domestic only; contracts may have customized language; publication lead times; Steiner quote from the August Governors meeting.",
      },
      {
        label: "Value Added Resource: USPS plans weekly variable fuel surcharge for 2027",
        href: "https://www.valueaddedresource.net/usps-weekly-variable-fuel-surcharge/",
        context: "Diesel vs jet fuel by product; starting percentage, formula and caps not disclosed; postage due on short-paid items.",
      },
      {
        label: "USPS: Transportation-related, time-limited price change (Mar 25, 2026)",
        href: "https://about.usps.com/newsroom/national-releases/2026/0325-usps-announces-transportation-related-time-limited-price-change.htm",
        context: "8% increase on base postage for four products, April 26, 2026 to January 17, 2027; \"bridge to a permanent mechanism\".",
      },
      {
        label: "USPS notice to the Postal Regulatory Commission, Docket CP2026-4 (Mar 25, 2026)",
        href: "https://prc.arkcase.com/api/prc-dockets/filing/downloadFile?fileId=252397&inline=true",
        context: "Rollback on January 17, 2027; FedEx ground fuel surcharge cited at 25.50% and UPS at 26.00%.",
      },
      {
        label: "USPS: Temporary price change for 2026 holiday shipping season (Aug 25, 2026)",
        href: "https://about.usps.com/newsroom/national-releases/2026/0825-usps-announces-temporary-price-change-for-2026-holiday-shipping-season.htm",
        context: "Holiday add-ons from October 4, 2026 to January 17, 2027, including $0.40 to $0.75 on a 0–3 lb Ground Advantage label depending on zone and price category.",
      },
      {
        label: "Supply Chain Dive: UPS plans 5.9% rate increase on Dec. 21 (Oct 26, 2026)",
        href: "https://www.supplychaindive.com/news/ups-plans-59-rate-increase-on-dec-21/872751/",
        context: "UPS average 5.9% increase on ground, air and international daily rates from December 21, 2026.",
      },
      {
        label: "Supply Chain Dive: FedEx preps 5.9% rate hike, surcharge increases for 2027 (Sep 21, 2026)",
        href: "https://www.supplychaindive.com/news/fedex-preps-59-rate-hike-surcharge-increases-for-2027/830903/",
        context: "FedEx average 5.9% from January 4, 2027; residential delivery and delivery area surcharge changes.",
      },
      {
        label: "FedEx: Shipping rate changes",
        href: "https://www.fedex.com/en-us/shipping/rate-changes.html",
        context: "January 4, 2027 rate increase and February 1, 2027 zone changes.",
      },
      {
        label: "resellerindex.com: USPS price increase 2027, what's known as of Oct 19, 2026",
        href: "https://resellerindex.com/rates/usps-price-change-2027/",
        context: "No January 2027 stamp or Media Mail filing as of October 19, 2026.",
      },
      {
        label: "eBay selling fees",
        href: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
        context: "Final value fee is calculated on the total amount of the sale, including shipping charged to the buyer.",
      },
      {
        label: "Etsy fees and payments policy",
        href: "https://www.etsy.com/legal/fees/",
        context: "6.5% transaction fee applies to the item price and the shipping and gift-wrap price.",
      },
      {
        label: "MarketplaceBeta: Q4 2026 parcel surcharge calendar (Oct 20, 2026)",
        href: "/intelligence/analysis/q4-2026-parcel-surcharge-calendar",
        context: "UPS and FedEx residential peak demand surcharge windows ending January 16 and 17, 2027, with carrier sources.",
      },
      {
        label: "MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)",
        href: "/intelligence/dossier",
        context: "Parcel cost stack and forecasts F2 and F5, with the dossier's own cited sources.",
      },
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
