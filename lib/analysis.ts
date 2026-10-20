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
