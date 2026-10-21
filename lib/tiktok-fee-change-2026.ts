/**
 * Data and math behind /fees/tiktok-shop/fee-change-2026.
 *
 * Every dollar figure on that page is computed here from TikTok's published
 * formula, so the copy, the FAQ JSON-LD and the tests can't drift apart.
 * Re-verify the sources below before changing CHECKED_ON.
 */

export const TIKTOK_FEE_CHANGE_PATH = '/fees/tiktok-shop/fee-change-2026'
export const TIKTOK_FEE_CHANGE_SOURCE_KEY = 'campaign_kw_tiktok_fee_change'
export const TIKTOK_FEE_CHANGE_CTA = `/newsletter?source=${TIKTOK_FEE_CHANGE_SOURCE_KEY}#subscribe`

/** Date we last re-read every source on this list (YYYY-MM-DD). */
export const CHECKED_ON = '2026-10-21'
export const PUBLISHED_ON = '2026-10-21'

export const PUBLISHED_RATE_PCT = 6
export const REPORTED_RATE_PCT = 8
export const REFUND_ADMIN_PCT = 20
export const REFUND_ADMIN_CAP = 5

export interface Source {
  id: string
  publisher: string
  title: string
  url: string
  /** What the source says, in our words, with its own date. */
  says: string
  official: boolean
}

export const SOURCES: Source[] = [
  {
    id: 'tt-category-table',
    publisher: 'TikTok Shop (Seller University, US)',
    title: 'TikTok Shop Referral Fees in 2024 by Category',
    url: 'https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en',
    says: 'Page dated 10/08/2026. Lists 6% for almost every US category, 5% for five fine-jewelry sub-categories and the Pre-Owned categories, and 3% on the portion of a Collectibles or Pre-Owned sale above $10,000. States the formula: Referral Fee Rate × (Customer Payment + Platform Discount − Tax), with customer-paid shipping inside the base.',
    official: true,
  },
  {
    id: 'tt-fee-updates',
    publisher: 'TikTok Shop (Seller University, US)',
    title: 'TikTok Shop Referral Fee Updates - 2024',
    url: 'https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en',
    says: 'Page dated 05/08/2025. The referral fee moved to 6% per order on April 1, 2024. Refunds return the referral fee minus a 20% Refund Administration Fee, capped at $5 per SKU from May 15, 2025. TikTok says it will use reasonable efforts to notify sellers about 30 days before material changes.',
    official: true,
  },
  {
    id: 'tt-settlement-report',
    publisher: 'TikTok Shop (Seller University, US)',
    title: 'How to Access Your Settlement Report',
    url: 'https://seller-us.tiktok.com/university/essay?knowledge_id=2336057241700098&lang=en',
    says: 'Page dated 09/11/2025. Explains how to export the settlement report from Seller Center and defines the Order details columns, including Referral fee, Customer payment, Platform discounts and Sales tax payment.',
    official: true,
  },
  {
    id: 'delzonic',
    publisher: 'Delzonic',
    title: 'TikTok Shop Fee Increase 2026: The New 8% Rate',
    url: 'https://delzonic.com/blogs/tiktok-shop-fee-increase-2026/',
    says: 'Published Aug 28, 2026. Says the standard US referral fee for most non-food categories rose from 6% to 8% on Aug 4, 2026, with some beauty and electronics sub-categories at 9.5% to 11%. Cites no TikTok document.',
    official: false,
  },
  {
    id: 'fbatactics',
    publisher: 'FBA Tactics',
    title: 'TikTok Shop US Referral Fee Now 8%: What Changed on August 4, 2026',
    url: 'https://fbatactics.com/guides/tiktok-shop-fee-increase-2026/',
    says: 'Published Aug 25, 2026, updated Sep 5, 2026. Dates the 6% to 8% move to Aug 4, 2026 from trade coverage, notes TikTok issued no press release, and tells sellers to confirm on their settlement statement.',
    official: false,
  },
  {
    id: 'bebold',
    publisher: 'beBOLD Digital',
    title: "TikTok Shop's Reported 8% Fee: What Sellers Should Know",
    url: 'https://www.bebolddigital.com/news/tiktok-shop-8-percent-referral-fee',
    says: "Published Sep 8, 2026, updated Sep 14, 2026. Treats 8% as a reported change: TikTok's public category table still showed mostly 5% to 6%, so sellers should confirm their rate in Seller Center and on settlement statements.",
    official: false,
  },
  {
    id: 'ecommerce-times',
    publisher: 'Ecommerce Times',
    title: "TikTok Shop's Q4 2026 Seller Fee Overhaul Is Reshaping DTC Margins",
    url: 'https://ecommerce-times.com/tiktok-shops-q4-2026-seller-fee-overhaul-is-reshaping-dtc-margins/',
    says: 'Gives a different account: an 8% rate starting Oct 1, 2026, announced Aug 11, plus new fees. We found no TikTok page that supports either date.',
    official: false,
  },
]

export const sourceById = (id: string) => SOURCES.find(s => s.id === id)!

const cents = (n: number) => Math.round(n * 100) / 100

/** TikTok's published formula: rate × (customer payment + platform discount − tax). */
export function referralFee(ratePct: number, { customerPayment, platformDiscount = 0, tax = 0 }: { customerPayment: number; platformDiscount?: number; tax?: number }): number {
  return cents((ratePct / 100) * (customerPayment + platformDiscount - tax))
}

/** Refund Administration Fee on a fully refunded SKU: 20% of its referral fee, capped at $5. */
export function refundAdminFee(referral: number): number {
  return cents(Math.min(referral * (REFUND_ADMIN_PCT / 100), REFUND_ADMIN_CAP))
}

/** The rate a settlement line implies. Returns a percentage rounded to two decimals. */
export function impliedRatePct({ referralFee: fee, customerPayment, platformDiscount = 0, tax = 0 }: { referralFee: number; customerPayment: number; platformDiscount?: number; tax?: number }): number {
  const base = customerPayment + platformDiscount - tax
  return base > 0 ? cents((Math.abs(fee) / base) * 100) : 0
}

export interface RateComparisonRow { label: string; base: number; at6: number; at8: number; diff: number }

export const EXAMPLE_PRICES = [10, 20, 25, 50, 100] as const

/** Single-item orders with no shipping, discount or tax, so the base equals the price. */
export function priceComparisonRows(): RateComparisonRow[] {
  return EXAMPLE_PRICES.map(price => {
    const at6 = referralFee(PUBLISHED_RATE_PCT, { customerPayment: price })
    const at8 = referralFee(REPORTED_RATE_PCT, { customerPayment: price })
    return { label: `$${price} sale`, base: price, at6, at8, diff: cents(at8 - at6) }
  })
}

/** A worked order with shipping, a platform discount and tax, so readers see the base. */
export const WORKED_ORDER = {
  productPrice: 25,
  customerShipping: 4,
  platformDiscount: 3,
  tax: 2,
  /** Customer pays product + shipping − platform discount + tax. */
  get customerPayment() { return cents(this.productPrice + this.customerShipping - this.platformDiscount + this.tax) },
  get base() { return cents(this.customerPayment + this.platformDiscount - this.tax) },
}

export function workedOrderFees() {
  const input = { customerPayment: WORKED_ORDER.customerPayment, platformDiscount: WORKED_ORDER.platformDiscount, tax: WORKED_ORDER.tax }
  const at6 = referralFee(PUBLISHED_RATE_PCT, input)
  const at8 = referralFee(REPORTED_RATE_PCT, input)
  return { ...input, base: WORKED_ORDER.base, at6, at8, diff: cents(at8 - at6) }
}

export const MONTHLY_BASES = [10_000, 50_000, 250_000] as const

export function monthlyRows() {
  return MONTHLY_BASES.map(base => {
    const at6 = cents(base * PUBLISHED_RATE_PCT / 100)
    const at8 = cents(base * REPORTED_RATE_PCT / 100)
    return { base, at6, at8, diff: cents(at8 - at6) }
  })
}

/** Hypothetical: a $25 unit that kept $3.00 profit at 6%. */
export function profitSqueeze(price = 25, profitAt6 = 3) {
  const extra = cents(price * (REPORTED_RATE_PCT - PUBLISHED_RATE_PCT) / 100)
  const profitAt8 = cents(profitAt6 - extra)
  return { price, profitAt6, extra, profitAt8, cutPct: cents((extra / profitAt6) * 100) }
}

export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const wholeMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function faqs(): { question: string; answer: string }[] {
  const [, s20] = priceComparisonRows()
  const w = workedOrderFees()
  const r6 = refundAdminFee(referralFee(PUBLISHED_RATE_PCT, { customerPayment: 25 }))
  const r8 = refundAdminFee(referralFee(REPORTED_RATE_PCT, { customerPayment: 25 }))
  return [
    {
      question: 'Did TikTok Shop raise its referral fee to 8% in 2026?',
      answer: `Not according to TikTok's own documents. TikTok's US "Referral Fees by Category" table, dated October 8, 2026, still lists 6% for most categories (5% for some jewelry and Pre-Owned). Several trade blogs, including Delzonic and FBA Tactics, report that most non-food categories moved to 8% on August 4, 2026, but none cites a TikTok notice, and we found none as of ${formatDate(CHECKED_ON)}. Your settlement statement is the only reliable check for your own shop.`,
    },
    {
      question: 'How much more is 8% than 6% on a $20 TikTok Shop sale?',
      answer: `On a $20 order with no shipping, discount or tax, the referral fee is ${money(s20.at6)} at 6% and ${money(s20.at8)} at 8%, a difference of ${money(s20.diff)}. Going from 6% to 8% raises the fee by a third.`,
    },
    {
      question: 'What is the TikTok Shop referral fee calculated on?',
      answer: `TikTok's formula is Referral Fee Rate × (Customer Payment + Platform Discount − Tax), and the base includes any shipping the customer paid. Example: a $25 product with $4 shipping, a $3 TikTok-funded discount and $2 tax has a base of ${money(w.base)}, so the fee is ${money(w.at6)} at 6% or ${money(w.at8)} at 8%.`,
    },
    {
      question: 'How do I check which referral rate TikTok Shop is charging me?',
      answer: 'Export your settlement report (in Seller Center, Finances > Statements or Payouts, then Export), open the Order details sheet, and for a completed order with no refund divide the Referral fee by (Customer payment + Platform discounts − Sales tax payment). About 0.06 means 6%; about 0.08 means 8%.',
    },
    {
      question: 'Does the refund administration fee go up if the rate is 8%?',
      answer: `Yes, because it is 20% of the referral fee, capped at $5 per SKU. On a fully refunded $25 item it would be ${money(r6)} at 6% and ${money(r8)} at 8%.`,
    },
  ]
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
