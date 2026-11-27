import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
    slug: 'ieepa-tariff-refunds-marketplace-sellers',
    seoTitle: 'IEEPA Tariff Refunds: Amazon & Marketplace Sellers',
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
  } satisfies AnalysisArticle
