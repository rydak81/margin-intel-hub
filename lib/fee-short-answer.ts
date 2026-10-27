/**
 * One-sentence, dated "short answer" for each marketplace fee page, plus the FAQ built from it.
 *
 * Every figure is read from lib/marketplace-fees.ts (the same data the page table renders).
 * The sentence is shown at the top of /fees/[marketplace] and is repeated verbatim as the first
 * FAQ answer (visible FAQ and FAQPage JSON-LD), so the two can never drift apart.
 */
import { formatVerifiedDate, type Marketplace } from '@/lib/marketplace-fees'

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

export interface FaqItem { question: string; answer: string }

/** FAQ shown on the page and mirrored in FAQPage JSON-LD. The first answer is the short answer. */
export function feeFaq(m: Marketplace): FaqItem[] {
  const { lowest, highest } = feeRange(m)
  const lowestCats = m.categories.filter((c) => c.referralPct === lowest).map((c) => c.label)
  const highestCats = m.categories.filter((c) => c.referralPct === highest).map((c) => c.label)
  return [
    { question: `How much does ${m.name} charge sellers?`, answer: feeShortAnswer(m) },
    { question: `Which ${m.name} category has the lowest fee?`, answer: `${lowestCats.join(', ')}: ${lowest}%.` },
    { question: `Which ${m.name} category has the highest fee?`, answer: `${highestCats.join(', ')}: ${highest}%.` },
  ]
}
