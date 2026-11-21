/**
 * Dated fee history. Every change to lib/marketplace-fees.ts must append an entry here
 * (newest last) with the exact old → new values, so readers can see what moved and when.
 * Rendered at /fees/changelog.
 */
import type { MarketplaceSlug } from '@/lib/marketplace-fees'
import { TIKTOK_FEE_CHANGE_PATH } from '@/lib/tiktok-fee-change-2026'

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
  /** Optional on-site explainer that covers this change in depth. */
  explainer?: { href: string; label: string }
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
  {
    date: '2026-10-21',
    title: 'TikTok Shop commission corrected to the published 6%',
    summary: 'TikTok Shop re-verified against its US "Referral Fees by Category" table (page dated 10/08/2026), which lists 6% for most categories and 5% for five fine-jewelry sub-categories. We had modelled 8%, a figure some trade reports date to Aug 4, 2026 but that TikTok has not confirmed publicly. Each TikTok Shop page now notes the reported 8% so you can check it against your settlement statement. The source link is updated because the old Academy URL no longer loads.',
    sources: ['https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en'],
    explainer: { href: TIKTOK_FEE_CHANGE_PATH, label: 'Published 6% vs reported 8%: what\'s confirmed, and how to check your settlement statement' },
    changes: [
      { marketplace: 'tiktok-shop', category: 'All modelled categories', before: '8%', after: '6% (reported 8% noted as unconfirmed)' },
    ],
  },
  {
    date: '2026-11-12',
    title: 'Amazon $0.30 minimum referral fee applied to remaining categories',
    summary: 'Re-read Amazon\'s public referral fee table at sell.amazon.com/pricing on November 12, 2026, including every modelled category rate, tier breakpoint and minimum, plus the $39.99 per month Professional selling plan fee. No rates, thresholds or plan fees needed changing. The $0.30 per-item minimum already modelled for Baby Products, Beauty, Consumer Electronics, Health & Personal Care, Kitchen, Compact Appliances and Electronics Accessories now also applies to the other modelled categories where that table lists a $0.30 minimum. Grocery & Gourmet Food and Video Games have no minimum on that table and were left unchanged. Fine Art lists a $1.00 minimum in the rate text; we do not model Fine Art.',
    sources: ['https://sell.amazon.com/pricing'],
    changes: [
      { marketplace: 'amazon', category: 'Amazon Device Accessories', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Automotive & Powersports', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Backpacks & Handbags', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Business & Industrial', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Clothing & Accessories', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Computers', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Furniture', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Home & Garden', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Jewelry', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Lawn & Garden', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Luggage & Travel Accessories', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Musical Instruments', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Office Products', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Outdoors', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Pet Supplies', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Shoes', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Sports & Outdoors', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Tools & Home Improvement', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Toys & Games', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Watches', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
      { marketplace: 'amazon', category: 'Everything Else', before: 'No minimum referral fee', after: '$0.30 minimum referral fee' },
    ],
  },
  {
    date: '2026-11-19',
    title: 'Walmart category list corrected against official pricing tables',
    summary: 'Re-read Walmart\'s public referral-fee table at marketplace.walmart.com/pricing/ and the Marketplace Learn contract-category schedule (updated Mar 9, 2026) on November 19, 2026. Neither page lists a Cell Phones row, so that unsourced 8% category was removed rather than guessed. Three official rows that we did not model — Appliances - Compact, Musical Instruments and Personal Computers — were added at the published rates. The October 16 changelog had incorrectly recorded Walmart Baby as moving to a $15 threshold; both official tables, and our fee data, already used 8% at $10 or less and 15% on the whole price above $10, so that changelog line was removed. This is a targeted category correction, not a full recertification of every pre-existing Walmart row.',
    sources: ['https://marketplace.walmart.com/pricing/', 'https://marketplacelearn.walmart.com/guides/Selling%20on%20Walmart/Referral-fee-schedule-for-contract-categories'],
    changes: [
      { marketplace: 'walmart', category: 'Cell Phones', before: '8% (modelled without an official row)', after: 'Removed; neither official table lists a Cell Phones category' },
      { marketplace: 'walmart', category: 'Appliances - Compact', before: 'Not modelled', after: '12% for the portion of the total sales price up to $300; 8% for any portion of the total sales price greater than $300' },
      { marketplace: 'walmart', category: 'Musical Instruments', before: 'Not modelled', after: '12%' },
      { marketplace: 'walmart', category: 'Personal Computers', before: 'Not modelled', after: '6%' },
      { marketplace: 'walmart', category: 'Baby (October 16 changelog typo)', before: 'Changelog after-text said 8% at $15 or less, 15% above (whole price)', after: 'Corrected to 8% at $10 or less, 15% above (whole price), matching both official tables and the fee data, which were already $10' },
    ],
  },
  {
    date: '2026-11-20',
    title: 'TikTok Pre-Owned and $10,000 tier; remaining Walmart contract categories; eBay Store card rate',
    summary: 'Re-read TikTok Shop\'s US "Referral Fees by Category" table (page dated 10/08/2026), Walmart\'s pricing page and Marketplace Learn contract-category schedule (updated Mar 9, 2026), and eBay\'s basic and Store selling-fee pages on November 20, 2026. TikTok\'s table still lists no 8% US rate, so the unconfirmed 8% hedge was removed from calculator notes and the hub summary; the 6% versus reported 8% explainer stays. Pre-Owned was added at 5%, and Collectibles at 6%, both with 3% on the portion over $10,000. Walmart\'s 12 missing contract categories were added. Music, Video & DVD, Luggage & Travel Accessories and Everything Else are 15% table rows without their own pages. Collectibles uses the Marketplace Learn schedule (the pricing page says only 8%). Learn\'s Plumbing label has no commas; the visible label uses the pricing page\'s commas. eBay\'s previously modelled non-Store rates were unchanged. Trading cards and comics now have the Basic-or-higher Store schedule beside the no-Store and Starter Store rate. Comic books pay the same 13.25% as trading cards when there is no Store or only a Starter Store.',
    sources: [
      'https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en',
      'https://marketplace.walmart.com/pricing/',
      'https://marketplacelearn.walmart.com/guides/Selling%20on%20Walmart/Referral-fee-schedule-for-contract-categories',
      'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822',
      'https://www.ebay.com/help/selling/fees-credits-invoices/store-fees?id=4809',
    ],
    explainer: { href: TIKTOK_FEE_CHANGE_PATH, label: 'Published 6% vs reported 8%: what\'s confirmed, and how to check your settlement statement' },
    changes: [
      { marketplace: 'tiktok-shop', category: 'Calculator notes and hub summary', before: 'Noted an unconfirmed trade report that most non-food categories moved to 8% on Aug 4, 2026', after: 'Note omitted; published schedule only (6% most categories, 5% fine jewelry and Pre-Owned, 3% over $10,000 on Collectibles and Pre-Owned)' },
      { marketplace: 'tiktok-shop', category: 'Pre-Owned', before: 'Not modelled', after: '5% on the first $10,000, then 3% on any portion over $10,000' },
      { marketplace: 'tiktok-shop', category: 'Collectibles', before: 'Not modelled', after: '6% on the first $10,000, then 3% on any portion over $10,000' },
      { marketplace: 'walmart', category: 'Appliances - Major', before: 'Not modelled', after: '8%' },
      { marketplace: 'walmart', category: 'Base Power Tools', before: 'Not modelled', after: '12%' },
      { marketplace: 'walmart', category: 'Collectibles (for approved sellers)', before: 'Not modelled', after: '8% on the portion up to $2,500, then 2.35%, for trading cards, trading card games, comics, coins, autographed collectibles and collectible ephemera; 8% for all other collectibles. Pricing page says 8% only' },
      { marketplace: 'walmart', category: 'Indoor & Outdoor Furniture', before: 'Not modelled', after: '15% for the portion up to $200; 10% for any portion greater than $200' },
      { marketplace: 'walmart', category: 'Luggage & Travel Accessories', before: 'Not modelled', after: '15% (table row only)' },
      { marketplace: 'walmart', category: 'Music', before: 'Not modelled', after: '15% (table row only)' },
      { marketplace: 'walmart', category: 'Outdoor Power Tools', before: 'Not modelled', after: '15% of the whole price up to $500; 8% of the whole price above $500' },
      { marketplace: 'walmart', category: 'Plumbing, Heating, Cooling & Ventilation', before: 'Not modelled', after: '10% (Learn label has no commas)' },
      { marketplace: 'walmart', category: 'Tires & Wheels', before: 'Not modelled', after: '10%' },
      { marketplace: 'walmart', category: 'Video & DVD', before: 'Not modelled', after: '15% (table row only)' },
      { marketplace: 'walmart', category: 'Video Game Consoles', before: 'Not modelled', after: '8%' },
      { marketplace: 'walmart', category: 'Everything Else', before: 'Not modelled', after: '15% (table row only; now the fee-by-price and profit-calculator reference category)' },
      { marketplace: 'walmart', category: 'Office Products', before: '15% with no exception', after: '15%, except 12% for Printer Cartridges (note only; modelled rate stays 15%)' },
      { marketplace: 'walmart', category: 'Outdoors', before: '15% with no exception', after: '15% except 8% for Hunting Trail Monitors, Binoculars, Telescopes, Spotting Scopes, and Night Vision Goggles (note only; modelled rate stays 15%)' },
      { marketplace: 'walmart', category: 'Sporting Goods', before: '15% with no exception', after: '15% except 8% for Hunting Trail Monitors, Binoculars, Telescopes, Spotting Scopes, and Night Vision Goggles (note only; modelled rate stays 15%)' },
      { marketplace: 'walmart', category: 'Shoes, Handbags & Sunglasses', before: 'Label omitted Backpacks', after: 'Shoes, Handbags, Backpacks & Sunglasses (15% unchanged)' },
      { marketplace: 'walmart', category: 'Video Games', before: 'Label was Video Games', after: 'Software & Computer Video Games (15% unchanged)' },
      { marketplace: 'ebay', category: 'Trading Cards (excluding NFTs)', before: '13.25% on the first $7,500, then 2.35%, with no mention of comics or Store level', after: 'Same 13.25% / $7,500 / 2.35% schedule for no Store or a Starter Store. Comic books pay the same 13.25% as trading cards' },
      { marketplace: 'ebay', category: 'Trading Cards & Comics (Basic Store or higher)', before: 'Not modelled', after: '12.35% on the first $2,500, then 2.35%, for a Basic, Premium, Anchor, or Enterprise Store. Comic books pay the same rate' },
    ],
  },
]

export function feeChangelogNewestFirst(): FeeChangelogEntry[] {
  return FEE_CHANGELOG.map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || b.index - a.index)
    .map(({ entry }) => entry)
}

/** Stable anchor for a change-log entry, used as the entry's DOM id and the feed link fragment. */
export function feeChangelogId(entry: Pick<FeeChangelogEntry, 'date' | 'title'>): string {
  return `${entry.date}-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}
