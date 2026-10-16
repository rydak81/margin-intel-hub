/**
 * Dated fee history. Every change to lib/marketplace-fees.ts must append an entry here
 * (newest last) with the exact old → new values, so readers can see what moved and when.
 * Rendered at /fees/changelog.
 */
import type { MarketplaceSlug } from '@/lib/marketplace-fees'

export interface FeeChange {
  marketplace: MarketplaceSlug
  category: string
  before: string
  after: string
}

export interface FeeChangelogEntry {
  /** Date the new figures were verified against the official source (YYYY-MM-DD). */
  date: string
  title: string
  summary: string
  sources: string[]
  changes: FeeChange[]
}

export const FEE_CHANGELOG: FeeChangelogEntry[] = [
  {
    date: '2026-10-16',
    title: 'Fee tables re-verified against official sources',
    summary: 'Amazon, Walmart and eBay tables re-checked against each marketplace\'s official pricing page. Several flat rates became tiered, and most eBay non-Store final value fees moved from 13.25% to 13.6%. Etsy confirmed unchanged. TikTok Shop not re-verified (still dated 2026-08-12).',
    sources: ['https://sell.amazon.com/pricing', 'https://marketplace.walmart.com/pricing/', 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822', 'https://www.etsy.com/legal/fees/'],
    changes: [
      { marketplace: 'amazon', category: 'Electronics Accessories', before: '15% flat', after: '15% on the first $100, then 8% above; $0.30 minimum' },
      { marketplace: 'walmart', category: 'Apparel & Accessories', before: '15% flat', after: '5% at $15 or less, 10% from $15.01 to $20, 15% over $20 (whole price)' },
      { marketplace: 'walmart', category: 'Electronics Accessories', before: '15% flat', after: '15% on the first $100, then 8% above' },
      { marketplace: 'walmart', category: 'Baby', before: '8% at $10 or less, 15% above (whole price)', after: '8% at $15 or less, 15% above (whole price)' },
      { marketplace: 'walmart', category: 'Jewelry', before: '20% flat', after: '20% on the first $250, then 5% above' },
      { marketplace: 'walmart', category: 'Watches', before: '15% flat', after: '15% on the first $1,500, then 3% above' },
      { marketplace: 'ebay', category: 'Most Categories', before: '13.25%', after: '13.6%' },
      { marketplace: 'ebay', category: 'Clothing, Shoes & Accessories', before: '13.25%', after: '13.6%' },
      { marketplace: 'ebay', category: 'Coins & Paper Money', before: '9%', after: '13.25%' },
      { marketplace: 'ebay', category: 'Computers & Tablets', before: '12.35%', after: '13.6%' },
      { marketplace: 'ebay', category: 'Musical Instruments & Gear', before: '6.35%', after: '6.7% (Guitars & Basses; other listings 13.6%)' },
      { marketplace: 'ebay', category: 'Sporting Goods', before: '13.25%', after: '13.6%' },
      { marketplace: 'ebay', category: 'Video Games & Consoles', before: '13.25%', after: '13.6%' },
    ],
  },
  {
    date: '2026-10-16',
    title: 'eBay fee boundaries and minimum fees corrected',
    summary: 'eBay rates now apply to the first $7,500 per item with 2.35% above, the per-order fee is $0.30 through $10 and $0.40 above, and Jewelry, Watches and Guitars & Basses have their own schedules. Amazon categories with a $0.30 minimum referral fee now show it.',
    sources: ['https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822', 'https://sell.amazon.com/pricing'],
    changes: [
      { marketplace: 'ebay', category: 'Most Categories and other standard-rate categories', before: 'Flat rate on the full sale', after: 'Rate on the first $7,500 per item, then 2.35% on the excess' },
      { marketplace: 'ebay', category: 'Per-order fee', before: '$0.40 per order', after: '$0.30 per order through $10; $0.40 above' },
      { marketplace: 'ebay', category: 'Jewelry & Watches', before: '15% flat', after: 'Jewelry: 15% at $5,000 or less, 9% above (whole amount)' },
      { marketplace: 'ebay', category: 'Watches, Parts & Accessories', before: 'Part of Jewelry & Watches (15%)', after: '15% through $1,000, 6.5% from $1,000 to $7,500, 3% above' },
      { marketplace: 'ebay', category: 'Musical Instruments & Gear', before: '6.7%', after: '13.6% (guitars and basses split out at 6.7%)' },
      { marketplace: 'amazon', category: 'Baby Products, Beauty, Consumer Electronics, Health & Personal Care, Kitchen', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
    ],
  },
]

export function feeChangelogNewestFirst(): FeeChangelogEntry[] {
  return FEE_CHANGELOG.map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || b.index - a.index)
    .map(({ entry }) => entry)
}
