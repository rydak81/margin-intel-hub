/**
 * Data and math behind /fees/compare-by-item-price.
 *
 * Every marketplace fee on that page is computed with computeFeeBreakdown from
 * lib/marketplace-fees.ts (the same fee tables behind the category pages and the
 * "$N sale" pages), so the copy, the FAQ, the JSON-LD and the tests cannot drift from the
 * dataset. The only figures that live here are Etsy's Offsite Ads terms, which the fee
 * tables do not model; they come from Etsy's Fees & Payments Policy.
 *
 * Every example is a hypothetical item at a round price. Shipping, fulfillment, ads,
 * taxes and returns are excluded.
 */
import { MARKETPLACES, computeFeeBreakdown, formatVerifiedDate, type FeeCategory, type Marketplace } from '@/lib/marketplace-fees'

export const FEE_BY_PRICE_PATH = '/fees/compare-by-item-price'
export const FEE_BY_PRICE_SOURCE_KEY = 'campaign_kw_marketplace_fee_comparison'
export const FEE_BY_PRICE_CTA = `/newsletter?source=${FEE_BY_PRICE_SOURCE_KEY}#subscribe`
export const FEE_BY_PRICE_TITLE = 'Marketplace Fees at $10, $25, $50 & $100 Item Prices'
export const FEE_BY_PRICE_DESCRIPTION =
  'Hypothetical fee comparison for Amazon, Etsy, eBay, Walmart and TikTok Shop at $10, $25, $50 and $100, computed from our dated fee tables.'

export const COMPARE_PRICES = [10, 25, 50, 100] as const
export type ComparePrice = (typeof COMPARE_PRICES)[number]

/** Etsy Fees & Payments Policy, "Offsite Ads Fees" (policy last updated Oct 5, 2026). */
export const ETSY_FEES_POLICY_URL = 'https://www.etsy.com/legal/fees/'
export const OFFSITE_ADS = {
  /** Fee on an attributed order for shops below the threshold (who may opt out). */
  standardPct: 15,
  /** Fee once a shop has earned the threshold in a 365-day period (participation required). */
  discountedPct: 12,
  thresholdUsd: 10000,
  capUsd: 100,
} as const

/** One reference category per marketplace, chosen where rates vary by category. */
interface ReferenceChoice { categorySlug: string; why: string }
const REFERENCE: Record<string, ReferenceChoice> = {
  amazon: { categorySlug: 'everything-else', why: 'the catch-all category, at the rate most Amazon categories share' },
  walmart: { categorySlug: 'home-garden', why: 'a flat-rate category at the rate most Walmart categories share (the table has no catch-all row)' },
  'tiktok-shop': { categorySlug: 'apparel-accessories', why: 'one of the categories at the published rate (all but five fine-jewelry sub-categories)' },
  ebay: { categorySlug: 'most-categories', why: 'eBay\'s "most categories" row (special-rate categories excluded)' },
  etsy: { categorySlug: 'all-categories', why: 'Etsy charges one flat transaction fee in every category' },
}

export interface PriceCell {
  price: ComparePrice
  totalFees: number
  netProceeds: number
  /** Fee lines as "label $amount", straight from computeFeeBreakdown. */
  lines: { label: string; amount: number }[]
}

export interface MarketplaceRow {
  marketplace: Marketplace
  category: FeeCategory
  /** Why this category stands for the marketplace. */
  why: string
  /** Rate range across all categories, as the fee tables hold them. */
  rateRange: string
  cells: PriceCell[]
}

const round2 = (n: number) => Math.round(n * 100) / 100
export const money = (n: number) => `$${n.toFixed(2)}`

export function referenceCategory(m: Marketplace): { category: FeeCategory; why: string } {
  const choice = REFERENCE[m.slug]
  const category = m.categories.find(c => c.slug === choice.categorySlug)
  if (!category) throw new Error(`Reference category ${choice.categorySlug} missing for ${m.slug}`)
  return { category, why: choice.why }
}

export function buildRows(): MarketplaceRow[] {
  return MARKETPLACES.map(marketplace => {
    const { category, why } = referenceCategory(marketplace)
    const rates = marketplace.categories.map(c => c.referralPct)
    const lo = Math.min(...rates)
    const hi = Math.max(...rates)
    return {
      marketplace,
      category,
      why,
      rateRange: lo === hi ? `${lo}%` : `${lo}% to ${hi}%`,
      cells: COMPARE_PRICES.map(price => {
        const b = computeFeeBreakdown({ salePrice: price, unitCost: 0, marketplace, category })
        return { price, totalFees: b.totalFees, netProceeds: b.netProceeds, lines: b.lines.map(l => ({ label: l.label, amount: l.amount })) }
      }),
    }
  })
}

export interface OffsiteRow {
  price: ComparePrice
  baselineFees: number
  baselineNet: number
  /** Offsite Ads fee on an attributed order at 15% (below the threshold). */
  fee15: number
  /** Same order at 12% (shops past the threshold). */
  fee12: number
  netAfter15: number
  netAfter12: number
}

/** Offsite Ads fee on an attributed order: a percentage of the order total, capped per order. */
export function offsiteFee(orderTotal: number, pct: number): number {
  return Math.min(round2(orderTotal * (pct / 100)), OFFSITE_ADS.capUsd)
}

export function buildOffsiteRows(rows: MarketplaceRow[] = buildRows()): OffsiteRow[] {
  const etsy = rows.find(r => r.marketplace.slug === 'etsy')!
  return etsy.cells.map(c => {
    const fee15 = offsiteFee(c.price, OFFSITE_ADS.standardPct)
    const fee12 = offsiteFee(c.price, OFFSITE_ADS.discountedPct)
    return { price: c.price, baselineFees: c.totalFees, baselineNet: c.netProceeds, fee15, fee12, netAfter15: round2(c.netProceeds - fee15), netAfter12: round2(c.netProceeds - fee12) }
  })
}

/** "$10, $25 and $50" */
function list(items: string[]): string {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** Marketplaces at the extreme (lowest or highest) fee for each price, grouped into runs of equal sets. */
function extremeRuns(rows: MarketplaceRow[], pick: 'min' | 'max') {
  const perPrice = COMPARE_PRICES.map((price, i) => {
    const totals = rows.map(r => r.cells[i].totalFees)
    const target = Math.min(...totals) === Math.max(...totals) ? totals[0] : pick === 'min' ? Math.min(...totals) : Math.max(...totals)
    const names = rows.filter(r => r.cells[i].totalFees === target).map(r => r.marketplace.shortName)
    return { price, names, amount: target }
  })
  const runs: { names: string[]; prices: number[]; amounts: number[] }[] = []
  for (const p of perPrice) {
    const last = runs[runs.length - 1]
    if (last && last.names.join('|') === p.names.join('|')) { last.prices.push(p.price); last.amounts.push(p.amount) }
    else runs.push({ names: p.names, prices: [p.price], amounts: [p.amount] })
  }
  return runs
}

function describeRuns(runs: ReturnType<typeof extremeRuns>): string {
  return runs.map(run => {
    const who = list(run.names)
    const when = run.prices.length === COMPARE_PRICES.length ? 'at every price' : `at ${list(run.prices.map(p => `$${p}`))}`
    return `${who} ${when} (${list(run.amounts.map(money))})`
  }).join(', then ')
}

/** Oldest and newest fee-schedule check behind the table. */
export function verifiedRange(): { oldest: string; newest: string } {
  const dates = MARKETPLACES.map(m => m.lastVerified).sort()
  return { oldest: dates[0], newest: dates[dates.length - 1] }
}

/**
 * One-sentence, dated short answer for the page. Dated by the OLDEST fee-schedule check
 * behind the table (the date every figure is at least as fresh as), computed from the rows.
 */
export function feeByPriceShortAnswer(rows: MarketplaceRow[] = buildRows()): string {
  const asOf = `As of ${formatVerifiedDate(verifiedRange().oldest)}`
  const prices = list(COMPARE_PRICES.map(p => `$${p}`))
  const low = describeRuns(extremeRuns(rows, 'min'))
  const high = describeRuns(extremeRuns(rows, 'max'))
  return `${asOf}, on hypothetical items priced at ${prices} in each marketplace's reference category, the lowest estimated marketplace fees go to ${low} and the highest to ${high}, before shipping, ads (including Etsy Offsite Ads), taxes and returns.`
}

export interface FaqItem { question: string; answer: string }

/** Visible FAQ and FAQPage JSON-LD source. The first answer is the short answer. */
export function feeByPriceFaq(rows: MarketplaceRow[] = buildRows()): FaqItem[] {
  const etsyOffsite = buildOffsiteRows(rows).find(r => r.price === 50)!
  const o = OFFSITE_ADS
  return [
    { question: 'Which marketplace has the lowest seller fees at $10, $25, $50 and $100?', answer: feeByPriceShortAnswer(rows) },
    {
      question: 'How are these fee totals calculated?',
      answer: `Each total comes from the fee tables on this site for one reference category per marketplace: the commission or referral rate, plus any per-order fee, listing fee and payment processing in that marketplace's schedule. All examples are hypothetical items at round prices, so they illustrate the math and are not results for any real listing or shop.`,
    },
    {
      question: 'Are Etsy Offsite Ads included in the Etsy figures?',
      answer: `No. The Etsy baseline excludes Offsite Ads, which are shown as a separate line. Offsite Ads are optional only for shops that earned less than $${o.thresholdUsd.toLocaleString('en-US')} in the past 365 days. The fee is ${o.standardPct}% of the order total, or ${o.discountedPct}% once a shop is past $${o.thresholdUsd.toLocaleString('en-US')}, capped at $${o.capUsd} per order, and it is charged only on orders attributed to an ad click. On a hypothetical $50 item that is ${money(etsyOffsite.fee15)} at ${o.standardPct}% or ${money(etsyOffsite.fee12)} at ${o.discountedPct}%.`,
    },
    {
      question: 'What is not included in these totals?',
      answer: `Shipping and fulfillment (including FBA and Walmart Fulfillment Services), advertising, sales tax, returns and refunds, and Amazon's $39.99 per month Professional selling plan fee. Etsy's $0.20 listing fee is counted once per example sale.`,
    },
    {
      question: 'Why does TikTok Shop show the lowest fees here?',
      answer: `The TikTok Shop figures use the 6% commission in TikTok's published US schedule, which also covers payment processing. Some trade reports describe a higher rate that TikTok has not confirmed, so check the referral fee line on your own settlement statement.`,
    },
  ]
}
