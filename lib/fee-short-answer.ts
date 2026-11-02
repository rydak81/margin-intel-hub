/**
 * One-sentence, dated "short answer" for each marketplace fee page, plus the FAQ built from it.
 *
 * Every figure is read from lib/marketplace-fees.ts (the same data the page table renders).
 * The sentence is shown at the top of /fees/[marketplace] and is repeated verbatim as the first
 * FAQ answer (visible FAQ and FAQPage JSON-LD), so the two can never drift apart.
 */
import { formatVerifiedDate, type Marketplace } from '@/lib/marketplace-fees'
import { FEE_BY_PRICE_PATH, OFFSITE_ADS, buildOffsiteRows, buildRows, money, verifiedRange, type MarketplaceRow } from '@/lib/fee-by-price'

const pct = (n: number) => `${n}%`

export function feeRange(m: Marketplace): { lowest: number; highest: number } {
  const rates = m.categories.map((c) => c.referralPct)
  return { lowest: Math.min(...rates), highest: Math.max(...rates) }
}

export function feeShortAnswer(m: Marketplace): string {
  const asOf = `As of ${formatVerifiedDate(m.lastVerified)}`
  const { lowest, highest } = feeRange(m)

  // TikTok Shop: the page's headline is the published 6%, with the unconfirmed 8% report
  // stated as unconfirmed. Both facts are already in this marketplace's summary and notes.
  if (m.slug === 'tiktok-shop') {
    return `${asOf}, TikTok Shop's published US commission is ${pct(lowest)} for most categories (5% for five fine-jewelry sub-categories); trade reports of an 8% rate from Aug 4, 2026 are not confirmed by TikTok.`
  }

  const base = lowest === highest
    ? `${m.name} charges a flat ${pct(lowest)} ${m.feeName} in every category`
    : `${m.name} charges ${m.feeName}s of ${pct(lowest)} to ${pct(highest)} depending on category`

  const extras: string[] = []
  if (m.accountFee) extras.push(`a $${m.accountFee.amount.toFixed(2)} per ${m.accountFee.period} fee${m.accountFee.note ? ` for the ${m.accountFee.note}` : ''}`)
  if (m.perOrderFee) {
    const small = m.smallOrderFee
    extras.push(small
      ? `a per-order fee of $${small.amount.toFixed(2)} through $${small.upTo} and $${m.perOrderFee.toFixed(2)} above`
      : `a $${m.perOrderFee.toFixed(2)} per-order fee`)
  }
  if (m.listingFee) extras.push(`a $${m.listingFee.toFixed(2)} listing fee`)
  if (m.paymentProcessingPct) {
    extras.push(`${m.paymentProcessingPct}%${m.paymentProcessingFlat ? ` + $${m.paymentProcessingFlat.toFixed(2)}` : ''} payment processing`)
  }
  // Walmart's page states it has no monthly subscription or setup fee (see Marketplace.summary).
  const noSubscription = m.slug === 'walmart' ? ', with no monthly subscription or setup fee' : ''

  const joined = extras.length === 0 ? '' : extras.length === 1 ? `, plus ${extras[0]}` : `, plus ${extras.slice(0, -1).join(', ')} and ${extras[extras.length - 1]}`
  return `${asOf}, ${base}${noSubscription}${joined}.`
}

export interface FaqItem {
  question: string
  /** Plain text: rendered on the page and used verbatim as the FAQPage answer text. */
  answer: string
  /** Optional link on a phrase that appears verbatim inside `answer` (the visible text stays identical). */
  link?: { text: string; href: string }
}

/** Sale price used by the computed "what does X take" questions; one of the /fees/compare-by-item-price prices. */
export const FAQ_SALE_PRICE = 25

const COMPARE_LINK_TEXT = 'fees by item price comparison'

const NUMBER_WORDS: Record<number, string> = { 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven' }

const ordinals = ['', 'cheapest', 'second cheapest', 'third cheapest', 'fourth cheapest', 'fifth cheapest']

function list(items: string[]): string {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function cellAt(row: MarketplaceRow, price: number) {
  const cell = row.cells.find((c) => c.price === price)
  if (!cell) throw new Error(`No ${price} cell for ${row.marketplace.slug}`)
  return cell
}

/** "What does X take from a $25 sale?", computed with the same rows as /fees/compare-by-item-price. */
function takeFromSale(m: Marketplace, rows: MarketplaceRow[]): FaqItem {
  const row = rows.find((r) => r.marketplace.slug === m.slug)!
  const cell = cellAt(row, FAQ_SALE_PRICE)
  const label = (t: string) => (t.startsWith(m.shortName) ? t : t.charAt(0).toLowerCase() + t.slice(1))
  const lines = cell.lines.map((l) => `${label(l.label)} ${money(l.amount)}`)
  const breakdown = lines.length > 1 ? ` (${list(lines)})` : ''
  return {
    question: `What does ${m.name} take from a $${FAQ_SALE_PRICE} sale?`,
    answer:
      `${money(cell.totalFees)} in fees${breakdown}, leaving ${money(cell.netProceeds)}. ` +
      `That assumes a hypothetical $${FAQ_SALE_PRICE} item in ${row.category.label}, ${row.why}, at its ${row.category.referralPct}% ${m.feeName}, ` +
      `using fee schedules as of ${formatVerifiedDate(m.lastVerified)}, before product cost, shipping, fulfillment, ads, taxes and returns. ` +
      `Other prices are in our ${COMPARE_LINK_TEXT}.`,
    link: { text: COMPARE_LINK_TEXT, href: FEE_BY_PRICE_PATH },
  }
}

/** Where this marketplace ranks among the five on the same hypothetical $25 item. */
function cheaperThanOthers(m: Marketplace, rows: MarketplaceRow[]): FaqItem {
  const totals = rows.map((r) => ({ name: r.marketplace.shortName, slug: r.marketplace.slug, fees: cellAt(r, FAQ_SALE_PRICE).totalFees }))
  const sorted = [...totals].sort((a, b) => a.fees - b.fees)
  const me = totals.find((t) => t.slug === m.slug)!
  const cheaper = totals.filter((t) => t.fees < me.fees).length
  const tied = totals.filter((t) => t.slug !== m.slug && t.fees === me.fees).map((t) => t.name)
  const most = totals.every((t) => t.fees <= me.fees)
  const position = most && cheaper > 0 ? 'the most expensive' : `the ${ordinals[cheaper + 1]}`
  const tie = tied.length ? `, tied with ${list(tied)}` : ''
  const { oldest, newest } = verifiedRange()
  const asOf = oldest === newest ? formatVerifiedDate(oldest) : `${formatVerifiedDate(oldest)} to ${formatVerifiedDate(newest)}`
  return {
    question: `Is ${m.name} cheaper than other marketplaces on a $${FAQ_SALE_PRICE} sale?`,
    answer:
      `On a hypothetical $${FAQ_SALE_PRICE} item in each marketplace's reference category, ${m.shortName} is ${position} of the ${NUMBER_WORDS[totals.length] ?? totals.length} marketplaces we track${tie}. ` +
      `Estimated fees: ${list(sorted.map((t) => `${t.name} ${money(t.fees)}`))}, with fee schedules checked ${asOf}, before shipping, ads, taxes and returns. ` +
      `The full table is in our ${COMPARE_LINK_TEXT}.`,
    link: { text: COMPARE_LINK_TEXT, href: FEE_BY_PRICE_PATH },
  }
}

/** Etsy only: the Offsite Ads fee on the same $25 order, from the Etsy policy terms in lib/fee-by-price.ts. */
function etsyOffsiteAds(rows: MarketplaceRow[]): FaqItem {
  const o = buildOffsiteRows(rows).find((r) => r.price === FAQ_SALE_PRICE)!
  return {
    question: `Does Etsy charge more on a $${FAQ_SALE_PRICE} sale that came from an Offsite Ad?`,
    answer:
      `Yes. On top of the ${money(o.baselineFees)} in standard fees, an order placed after a click on one of Etsy's Offsite Ads costs ${money(o.fee15)} at ${OFFSITE_ADS.standardPct}% or ${money(o.fee12)} at ${OFFSITE_ADS.discountedPct}%, leaving ${money(o.netAfter15)} or ${money(o.netAfter12)}. ` +
      `The ${OFFSITE_ADS.discountedPct}% rate applies once a shop has made $${OFFSITE_ADS.thresholdUsd.toLocaleString('en-US')} in sales in 365 days, the fee is capped at $${OFFSITE_ADS.capUsd} per order, and shops below that line can opt out (Etsy Fees & Payments Policy). ` +
      `This assumes no shipping or gift wrap, which Etsy also charges the fee on. See our ${COMPARE_LINK_TEXT}.`,
    link: { text: COMPARE_LINK_TEXT, href: FEE_BY_PRICE_PATH },
  }
}

/** FAQ shown on the page ("Seller questions") and mirrored in FAQPage JSON-LD. The first answer is the short answer. */
export function feeFaq(m: Marketplace): FaqItem[] {
  const { lowest, highest } = feeRange(m)
  const lowestCats = m.categories.filter((c) => c.referralPct === lowest).map((c) => c.label)
  const highestCats = m.categories.filter((c) => c.referralPct === highest).map((c) => c.label)
  const rows = buildRows()
  const items: FaqItem[] = [
    { question: `How much does ${m.name} charge sellers?`, answer: feeShortAnswer(m) },
    takeFromSale(m, rows),
    cheaperThanOthers(m, rows),
  ]
  if (m.slug === 'etsy') items.push(etsyOffsiteAds(rows))
  // A flat-rate marketplace has no lowest/highest category; skip those two questions there.
  if (lowest !== highest) {
    items.push(
      { question: `Which ${m.name} category has the lowest fee?`, answer: `${lowestCats.join(', ')}: ${lowest}%.` },
      { question: `Which ${m.name} category has the highest fee?`, answer: `${highestCats.join(', ')}: ${highest}%.` },
    )
  }
  return items
}

/** FAQPage JSON-LD for the fee page: answer text is exactly the visible answer text. */
export function feeFaqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }
}
