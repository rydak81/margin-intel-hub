/**
 * Data and math behind /fees/amazon/holiday-peak-2026.
 *
 * Rates are transcribed from Amazon's Seller Central help page "2026 US FBA
 * fulfillment fee changes" (non-apparel tables), re-read on CHECKED_ON. Amazon
 * publishes them before the 3.5% fuel and logistics-related surcharge, which is
 * applied here on top. Every dollar figure on the page comes from this file.
 */
import { computeFeeBreakdown, getMarketplace } from '@/lib/marketplace-fees'

export const AMAZON_PEAK_PATH = '/fees/amazon/holiday-peak-2026'
export const AMAZON_PEAK_SOURCE_KEY = 'campaign_kw_amazon_peak_fee_2026'
export const AMAZON_PEAK_CTA = `/newsletter?source=${AMAZON_PEAK_SOURCE_KEY}#subscribe`

export const CHECKED_ON = '2026-10-21'
export const PUBLISHED_ON = '2026-10-21'

export const PEAK_START = '2026-10-15'
export const PEAK_END = '2027-01-14'
export const NON_PEAK_RESUMES = '2027-01-15'
export const SURCHARGE_PCT = 3.5
export const SURCHARGE_FBA_START = '2026-04-17'
export const SURCHARGE_BWP_MCF_START = '2026-05-02'
export const AVG_PEAK_INCREASE = 0.32
export const AVG_SURCHARGE_PER_UNIT = 0.17

export interface Source { id: string; publisher: string; title: string; url: string; says: string; official: boolean }

export const SOURCES: Source[] = [
  {
    id: 'sc-2026-fee-changes',
    publisher: 'Amazon Seller Central',
    title: '2026 US FBA fulfillment fee changes',
    url: 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW?locale=en-US',
    says: 'Peak and non-peak FBA fulfillment fee tables by size tier, shipping weight and price band (under $10, $10 to $50, over $50), shown before the 3.5% surcharge. Peak applies October 15, 2026 to January 14, 2027.',
    official: true,
  },
  {
    id: 'sc-fba-fee',
    publisher: 'Amazon Seller Central',
    title: 'FBA fulfillment fee',
    url: 'https://sellercentral.amazon.com/help/hub/reference/external/GPDC3KPYAGDTVDJP?locale=en-US',
    says: 'The fee is charged per unit when the buyer\u2019s order ships. Peak applies to FBA, Remote Fulfillment with FBA into Canada and Mexico, MCF and Buy with Prime, and the surcharge applies to peak fees.',
    official: true,
  },
  {
    id: 'sc-holiday-2026',
    publisher: 'Amazon Seller Central (News and Announcements)',
    title: 'Holiday 2026: Same fees, same eligibility, earlier deadlines',
    url: 'https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff',
    says: 'Peak fees return October 15, 2026 to January 14, 2027, with the same per-unit increase over non-peak as last year, averaging $0.32 per unit. The 3.5% surcharge applies on top.',
    official: true,
  },
  {
    id: 'sc-surcharge',
    publisher: 'Amazon Seller Central (News and Announcements)',
    title: 'Fuel and logistics-related surcharge: FBA, MCF, and BWP in US and CA',
    url: 'https://sellercentral.amazon.com/seller-forums/discussions/t/7cbc0233-ee5b-4359-978a-dee7cad5c6f4',
    says: 'A 3.5% surcharge on fulfillment fees from April 17, 2026 for FBA in the US and Canada and Remote Fulfillment with FBA, and from May 2, 2026 for Buy with Prime and MCF. It is calculated on fulfillment fees, not the sale price, and averages $0.17 per US FBA unit.',
    official: true,
  },
  {
    id: 'sc-storage',
    publisher: 'Amazon Seller Central',
    title: 'Monthly inventory storage fees',
    url: 'https://sellercentral.amazon.com/help/hub/reference/external/G3EDYEF6KUCFQTNM?locale=en-US',
    says: 'Base storage for non-dangerous goods is $0.78 per cubic foot (standard-size) and $0.56 (oversize) January to September, rising to $2.40 and $1.40 in October to December. A storage utilization surcharge applies on top for some sellers.',
    official: true,
  },
  {
    id: 'sell-pricing',
    publisher: 'Amazon',
    title: 'Selling on Amazon fee schedule',
    url: 'https://sell.amazon.com/pricing',
    says: 'Category referral fees used in the worked examples (via our verified Amazon fee table).',
    official: true,
  },
  {
    id: 'supply-chain-dive',
    publisher: 'Supply Chain Dive',
    title: 'Amazon announces 2026 holiday fulfillment fees, advises early shipping',
    url: 'https://www.supplychaindive.com/news/amazon-announces-2026-holiday-fulfillment-fees-advises-early-shipping/824962/',
    says: 'Reports that an Amazon representative told sellers on Seller Central that the surcharge will stay in effect until further notice.',
    official: false,
  },
]

export const sourceById = (id: string) => SOURCES.find(s => s.id === id)!

export type PriceBand = 'under10' | 'from10to50' | 'over50'
export const PRICE_BANDS: { band: PriceBand; label: string }[] = [
  { band: 'under10', label: 'Under $10' },
  { band: 'from10to50', label: '$10 to $50' },
  { band: 'over50', label: 'Over $50' },
]

export function priceBand(price: number): PriceBand {
  return price < 10 ? 'under10' : price <= 50 ? 'from10to50' : 'over50'
}

type Triple = [number, number, number]

export interface FlatRateRow { tier: 'Small standard' | 'Large standard'; weight: string; nonPeak: Triple; peak: Triple }

/** Non-apparel, 2026 non-peak (Jan 15 to Oct 14, 2026) vs 2026 peak (Oct 15, 2026 to Jan 14, 2027). Before the surcharge. */
export const STANDARD_ROWS: FlatRateRow[] = [
  { tier: 'Small standard', weight: '2 oz or less', nonPeak: [2.43, 3.32, 3.58], peak: [2.62, 3.51, 3.77] },
  { tier: 'Small standard', weight: '2+ to 4 oz', nonPeak: [2.49, 3.42, 3.68], peak: [2.68, 3.61, 3.87] },
  { tier: 'Small standard', weight: '4+ to 6 oz', nonPeak: [2.56, 3.45, 3.71], peak: [2.76, 3.65, 3.91] },
  { tier: 'Small standard', weight: '6+ to 8 oz', nonPeak: [2.66, 3.54, 3.80], peak: [2.86, 3.74, 4.00] },
  { tier: 'Small standard', weight: '8+ to 10 oz', nonPeak: [2.77, 3.68, 3.94], peak: [2.98, 3.89, 4.15] },
  { tier: 'Small standard', weight: '10+ to 12 oz', nonPeak: [2.82, 3.78, 4.04], peak: [3.03, 3.99, 4.25] },
  { tier: 'Small standard', weight: '12+ to 14 oz', nonPeak: [2.92, 3.91, 4.17], peak: [3.14, 4.13, 4.39] },
  { tier: 'Small standard', weight: '14+ to 16 oz', nonPeak: [2.95, 3.96, 4.22], peak: [3.17, 4.18, 4.44] },
  { tier: 'Large standard', weight: '4 oz or less', nonPeak: [2.91, 3.73, 3.99], peak: [3.15, 3.97, 4.23] },
  { tier: 'Large standard', weight: '4+ to 8 oz', nonPeak: [3.13, 3.95, 4.21], peak: [3.39, 4.21, 4.47] },
  { tier: 'Large standard', weight: '8+ to 12 oz', nonPeak: [3.38, 4.20, 4.46], peak: [3.66, 4.48, 4.74] },
  { tier: 'Large standard', weight: '12+ to 16 oz', nonPeak: [3.78, 4.60, 4.86], peak: [4.07, 4.89, 5.15] },
  { tier: 'Large standard', weight: '1+ to 1.25 lb', nonPeak: [4.22, 5.04, 5.30], peak: [4.52, 5.34, 5.60] },
  { tier: 'Large standard', weight: '1.25+ to 1.5 lb', nonPeak: [4.60, 5.42, 5.68], peak: [4.91, 5.73, 5.99] },
  { tier: 'Large standard', weight: '1.5+ to 1.75 lb', nonPeak: [4.75, 5.57, 5.83], peak: [5.07, 5.89, 6.15] },
  { tier: 'Large standard', weight: '1.75+ to 2 lb', nonPeak: [5.00, 5.82, 6.08], peak: [5.33, 6.15, 6.41] },
  { tier: 'Large standard', weight: '2+ to 2.25 lb', nonPeak: [5.10, 5.92, 6.18], peak: [5.47, 6.29, 6.55] },
  { tier: 'Large standard', weight: '2.25+ to 2.5 lb', nonPeak: [5.28, 6.10, 6.36], peak: [5.67, 6.49, 6.75] },
  { tier: 'Large standard', weight: '2.5+ to 2.75 lb', nonPeak: [5.44, 6.26, 6.52], peak: [5.84, 6.66, 6.92] },
  { tier: 'Large standard', weight: '2.75+ to 3 lb', nonPeak: [5.85, 6.67, 6.93], peak: [6.26, 7.08, 7.34] },
]

export interface FormulaRow { tier: string; weight: string; nonPeakBase: Triple; peakBase: Triple; perInterval: number; interval: string }

/** Base + per-interval rows. Non-apparel, before the surcharge. */
export const FORMULA_ROWS: FormulaRow[] = [
  { tier: 'Large standard', weight: '3+ to 20 lb', nonPeakBase: [6.15, 6.97, 7.23], peakBase: [6.69, 7.51, 7.77], perInterval: 0.08, interval: 'per 4 oz above the first 3 lb' },
  { tier: 'Small bulky', weight: '0 to 50 lb', nonPeakBase: [6.78, 7.55, 7.55], peakBase: [7.82, 8.59, 8.59], perInterval: 0.38, interval: 'per lb above the first lb' },
  { tier: 'Large bulky', weight: '0 to 50 lb', nonPeakBase: [8.58, 9.35, 9.35], peakBase: [9.62, 10.39, 10.39], perInterval: 0.38, interval: 'per lb above the first lb' },
  { tier: 'Extra-large', weight: '0 to 50 lb', nonPeakBase: [25.56, 26.33, 26.33], peakBase: [28.29, 29.06, 29.06], perInterval: 0.38, interval: 'per lb above the first lb' },
  { tier: 'Extra-large', weight: '50+ to 70 lb', nonPeakBase: [36.55, 37.32, 37.32], peakBase: [39.36, 40.13, 40.13], perInterval: 0.75, interval: 'per lb above 51 lb' },
  { tier: 'Extra-large', weight: '70+ to 150 lb', nonPeakBase: [50.55, 51.32, 51.32], peakBase: [54.97, 55.74, 55.74], perInterval: 0.75, interval: 'per lb above 71 lb' },
  { tier: 'Extra-large', weight: '150+ lb', nonPeakBase: [194.18, 194.95, 194.95], peakBase: [202.69, 203.46, 203.46], perInterval: 0.19, interval: 'per lb above 151 lb' },
]

export const BAND_INDEX: Record<PriceBand, 0 | 1 | 2> = { under10: 0, from10to50: 1, over50: 2 }

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Amazon doesn't publish how it rounds the surcharge; we round to the nearest cent. */
export function withSurcharge(fee: number): number {
  return cents(fee * (1 + SURCHARGE_PCT / 100))
}

export interface Example {
  id: string
  label: string
  price: number
  categorySlug: string
  sizeNote: string
  nonPeakFee: number
  peakFee: number
}

const flat = (weight: string, tier: FlatRateRow['tier'], price: number) => {
  const r = STANDARD_ROWS.find(x => x.weight === weight && x.tier === tier)!
  const i = BAND_INDEX[priceBand(price)]
  return { nonPeak: r.nonPeak[i], peak: r.peak[i] }
}

const smallBulky = (lb: number, price: number) => {
  const r = FORMULA_ROWS.find(x => x.tier === 'Small bulky')!
  const i = BAND_INDEX[priceBand(price)]
  const extra = Math.max(0, Math.ceil(lb) - 1) * r.perInterval
  return { nonPeak: cents(r.nonPeakBase[i] + extra), peak: cents(r.peakBase[i] + extra) }
}

function example(id: string, label: string, price: number, categorySlug: string, sizeNote: string, fees: { nonPeak: number; peak: number }): Example {
  return { id, label, price, categorySlug, sizeNote, nonPeakFee: fees.nonPeak, peakFee: fees.peak }
}

export const EXAMPLES: Example[] = [
  example('accessory', 'Phone accessory', 8.99, 'electronics-accessories', 'Small standard, 2+ to 4 oz', flat('2+ to 4 oz', 'Small standard', 8.99)),
  example('kitchen', 'Kitchen gadget', 20, 'kitchen', 'Small standard, 6+ to 8 oz', flat('6+ to 8 oz', 'Small standard', 20)),
  example('toy', 'Toy', 34, 'toys-games', 'Large standard, 1+ to 1.25 lb', flat('1+ to 1.25 lb', 'Large standard', 34)),
  example('bulky', 'Home & garden item', 59, 'home-garden', 'Small bulky, 10 lb shipping weight', smallBulky(10, 59)),
]

export interface ExampleMath {
  example: Example
  categoryLabel: string
  referral: number
  nonPeakWithSurcharge: number
  peakWithSurcharge: number
  peakIncrease: number
  surchargeOnPeak: number
  totalNonPeak: number
  totalPeak: number
  extraPerUnit: number
  keptNonPeak: number
  keptPeak: number
  takeRateNonPeak: number
  takeRatePeak: number
}

export function exampleMath(e: Example): ExampleMath {
  const amazon = getMarketplace('amazon')!
  const category = amazon.categories.find(c => c.slug === e.categorySlug)!
  const referral = computeFeeBreakdown({ salePrice: e.price, unitCost: 0, marketplace: amazon, category }).lines[0].amount
  const nonPeakWithSurcharge = withSurcharge(e.nonPeakFee)
  const peakWithSurcharge = withSurcharge(e.peakFee)
  const totalNonPeak = cents(referral + nonPeakWithSurcharge)
  const totalPeak = cents(referral + peakWithSurcharge)
  return {
    example: e,
    categoryLabel: category.label,
    referral,
    nonPeakWithSurcharge,
    peakWithSurcharge,
    peakIncrease: cents(e.peakFee - e.nonPeakFee),
    surchargeOnPeak: cents(peakWithSurcharge - e.peakFee),
    totalNonPeak,
    totalPeak,
    extraPerUnit: cents(totalPeak - totalNonPeak),
    keptNonPeak: cents(e.price - totalNonPeak),
    keptPeak: cents(e.price - totalPeak),
    takeRateNonPeak: cents((totalNonPeak / e.price) * 100),
    takeRatePeak: cents((totalPeak / e.price) * 100),
  }
}

/** Storage: base monthly rates, non-dangerous goods, per cubic foot. */
export const STORAGE = { standardJanSep: 0.78, standardOctDec: 2.40, oversizeJanSep: 0.56, oversizeOctDec: 1.40 }

/** Base monthly storage for one standard-size unit, before any utilization surcharge. */
export function storagePerUnit(cubicFeet: number) {
  return { janSep: cents(cubicFeet * STORAGE.standardJanSep), octDec: cents(cubicFeet * STORAGE.standardOctDec) }
}

export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function faqs(): { question: string; answer: string }[] {
  const kitchen = exampleMath(EXAMPLES.find(e => e.id === 'kitchen')!)
  return [
    {
      question: 'When do Amazon\u2019s 2026 holiday peak fulfillment fees apply?',
      answer: `From ${formatDate(PEAK_START)} to ${formatDate(PEAK_END)}, for FBA, Remote Fulfillment with FBA, Multi-Channel Fulfillment and Buy with Prime. Amazon charges the FBA fulfillment fee when the order ships, so the ship date decides which rate applies. Non-peak rates return on ${formatDate(NON_PEAK_RESUMES)}.`,
    },
    {
      question: 'How much higher are the 2026 peak fees?',
      answer: `Amazon says the peak increase is the same as last year, averaging $${AVG_PEAK_INCREASE.toFixed(2)} per unit. In its rate card, small standard items rise $0.19 to $0.22 a unit, large standard items $0.24 to $0.54 depending on weight, small and large bulky items $1.04 at the base rate, and extra-large items $2.73 to $8.51. Those figures are before the surcharge.`,
    },
    {
      question: 'Does the 3.5% fuel and logistics surcharge apply on top of peak fees?',
      answer: `Yes. Amazon says the 3.5% surcharge applies on top of holiday peak fulfillment fees. It is calculated on the fulfillment fee, not the sale price. For a $20 small standard kitchen item weighing 6 to 8 oz, the peak fee is ${money(kitchen.example.peakFee)} and ${money(kitchen.peakWithSurcharge)} with the surcharge.`,
    },
    {
      question: 'Is Amazon\u2019s 3.5% fuel surcharge still in effect?',
      answer: `Yes, as of ${formatDate(CHECKED_ON)}. Amazon\u2019s FBA fee pages still list it, and Amazon has announced no end date. It started on ${formatDate(SURCHARGE_FBA_START)} for FBA in the US and Canada and on ${formatDate(SURCHARGE_BWP_MCF_START)} for Buy with Prime and MCF. Amazon put the average at $${AVG_SURCHARGE_PER_UNIT.toFixed(2)} per US FBA unit.`,
    },
    {
      question: 'Does the surcharge apply to referral or storage fees?',
      answer: 'Amazon describes it as a surcharge on fulfillment fees, calculated on those fees rather than on the sale price. It does not describe it as applying to referral fees. Storage has its own seasonal increase: base storage for standard-size items is $2.40 per cubic foot a month from October to December, against $0.78 from January to September.',
    },
  ]
}
