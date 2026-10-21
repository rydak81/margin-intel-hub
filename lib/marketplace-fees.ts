/**
 * Canonical marketplace fee dataset.
 *
 * This is the data layer behind the programmatic /fees/[marketplace]/[category]
 * pages and the profit calculator. It is intentionally server-safe (no React,
 * no "use client") so it can be imported by generateStaticParams, generateMetadata,
 * JSON-LD builders, and client components alike.
 *
 * ── Accuracy policy ──
 * Every marketplace carries `sourceUrl` and `lastVerified`. Both are rendered
 * on-page so the numbers are auditable by the reader. Marketplaces change fee
 * schedules frequently — re-verify against `sourceUrl` before treating any rate
 * as current, and bump `lastVerified` when you do.
 */

export type MarketplaceSlug = "amazon" | "walmart" | "tiktok-shop" | "ebay" | "etsy"

/** One price bracket of a tiered rate. Order tiers ascending; the last has upTo: null. */
export interface FeeTier {
  /** Bracket upper bound (inclusive); null = no upper bound. */
  upTo: number | null
  pct: number
}

export interface FeeCategory {
  slug: string
  label: string
  /** Headline referral / commission / final-value rate, as a percentage. */
  referralPct: number
  /** Rendered as a caveat under the headline rate. */
  note?: string
  /**
   * Threshold pricing, when the marketplace uses it. Two distinct mechanics:
   * - 'whole': the sale price picks ONE bracket and that rate applies to the
   *   entire price (Amazon Baby: 8% if <= $10, 15% on the whole price if over).
   * - 'marginal': each bracket's rate applies only to the portion of the price
   *   inside it (Amazon Jewelry: 20% on the first $250, 5% on the rest).
   */
  tierMode?: 'whole' | 'marginal'
  tiers?: FeeTier[]
  /** Minimum fee charged per unit, if the marketplace enforces one. */
  minFee?: number
}

export interface Marketplace {
  slug: MarketplaceSlug
  name: string
  shortName: string
  /** What this marketplace calls its commission — used throughout the copy. */
  feeName: string
  /** Name of the first-party fulfillment program, if any. */
  fulfillmentName: string | null
  /** Flat per-order fee charged on top of the referral fee. */
  perOrderFee?: number
  smallOrderFee?: { upTo: number; amount: number }
  /** Per-listing fee (Etsy-style). */
  listingFee?: number
  paymentProcessingPct?: number
  paymentProcessingFlat?: number
  accountFee?: { amount: number; period: string; note?: string }
  sourceUrl: string
  /** ISO date (YYYY-MM-DD) this schedule was last checked against the source. */
  lastVerified: string
  /** One-paragraph plain-English framing, used as the page standfirst. */
  summary: string
  categories: FeeCategory[]
}

// ── Amazon ────────────────────────────────────────────────────────────────────
// Rates mirror the schedule already encoded in components/profit-calculator.tsx.

// Verified 2026-10-16 against https://sell.amazon.com/pricing (official Amazon fee table)
const AMAZON_CATEGORIES: FeeCategory[] = [
  { slug: "amazon-device-accessories", label: "Amazon Device Accessories", referralPct: 45 },
  {
    slug: "appliances", label: "Compact Appliances", referralPct: 15,
    note: "Compact appliances: 15% on the first $300, then 8% above, with a $0.30 minimum. Full-size appliances use a separate 8% rate. Appliance distinction checked against sell.amazon.com/pricing on October 10, 2026.",
    tierMode: "marginal", tiers: [{ upTo: 300, pct: 15 }, { upTo: null, pct: 8 }], minFee: 0.30,
  },
  { slug: "automotive", label: "Automotive & Powersports", referralPct: 12 },
  {
    slug: "baby-products", minFee: 0.30, label: "Baby Products", referralPct: 8,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "backpacks-handbags", label: "Backpacks & Handbags", referralPct: 15 },
  {
    slug: "beauty", minFee: 0.30, label: "Beauty", referralPct: 8,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "business-industrial", label: "Business & Industrial", referralPct: 12 },
  {
    slug: "clothing-accessories", label: "Clothing & Accessories", referralPct: 17,
    note: "Tiered by total price: 5% at $15 or less, 10% from $15.01 to $20, 17% over $20.",
    tierMode: "whole", tiers: [{ upTo: 15, pct: 5 }, { upTo: 20, pct: 10 }, { upTo: null, pct: 17 }],
  },
  { slug: "computers", label: "Computers", referralPct: 8 },
  { slug: "consumer-electronics", minFee: 0.30, label: "Consumer Electronics", referralPct: 8 },
  {
    slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15,
    note: "15% on the first $100, then 8% on the portion above, with a $0.30 minimum.",
    tierMode: "marginal", tiers: [{ upTo: 100, pct: 15 }, { upTo: null, pct: 8 }], minFee: 0.30,
  },
  {
    slug: "furniture", label: "Furniture", referralPct: 15,
    note: "15% on the first $200, then 10% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 200, pct: 15 }, { upTo: null, pct: 10 }],
  },
  {
    slug: "grocery", label: "Grocery & Gourmet Food", referralPct: 8,
    note: "8% on items priced $15 or less; 15% on the whole price when over $15.",
    tierMode: "whole", tiers: [{ upTo: 15, pct: 8 }, { upTo: null, pct: 15 }],
  },
  {
    slug: "health-personal-care", minFee: 0.30, label: "Health & Personal Care", referralPct: 8,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "home-garden", label: "Home & Garden", referralPct: 15 },
  {
    slug: "jewelry", label: "Jewelry", referralPct: 20,
    note: "20% on the first $250, then 5% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 250, pct: 20 }, { upTo: null, pct: 5 }],
  },
  { slug: "kitchen", minFee: 0.30, label: "Kitchen", referralPct: 15 },
  { slug: "lawn-garden", label: "Lawn & Garden", referralPct: 15 },
  { slug: "luggage", label: "Luggage & Travel Accessories", referralPct: 15 },
  { slug: "musical-instruments", label: "Musical Instruments", referralPct: 15 },
  { slug: "office-products", label: "Office Products", referralPct: 15 },
  { slug: "outdoors", label: "Outdoors", referralPct: 15 },
  { slug: "pet-supplies", label: "Pet Supplies", referralPct: 15 },
  { slug: "shoes", label: "Shoes", referralPct: 15 },
  { slug: "sports", label: "Sports & Outdoors", referralPct: 15 },
  { slug: "tools-home-improvement", label: "Tools & Home Improvement", referralPct: 15 },
  { slug: "toys-games", label: "Toys & Games", referralPct: 15 },
  { slug: "video-games", label: "Video Games", referralPct: 15 },
  {
    slug: "watches", label: "Watches", referralPct: 16,
    note: "16% on the first $1,500, then 3% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 1500, pct: 16 }, { upTo: null, pct: 3 }],
  },
  { slug: "everything-else", label: "Everything Else", referralPct: 15 },
]

// ── Walmart ───────────────────────────────────────────────────────────────────

// Verified 2026-10-16 against https://marketplace.walmart.com/pricing/ (official Walmart referral fee table)
const WALMART_CATEGORIES: FeeCategory[] = [
  {
    slug: "apparel-accessories", label: "Apparel & Accessories", referralPct: 15,
    note: "Tiered by total price: 5% at $15 or less, 10% from $15.01 to $20, 15% over $20.",
    tierMode: "whole", tiers: [{ upTo: 15, pct: 5 }, { upTo: 20, pct: 10 }, { upTo: null, pct: 15 }],
  },
  { slug: "automotive", label: "Automotive & Powersports", referralPct: 12 },
  {
    slug: "baby", label: "Baby", referralPct: 15,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  {
    slug: "beauty", label: "Beauty", referralPct: 15,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "books", label: "Books", referralPct: 15 },
  { slug: "camera-photo", label: "Camera & Photo", referralPct: 8 },
  { slug: "cell-phones", label: "Cell Phones", referralPct: 8 },
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 8 },
  {
    slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15,
    note: "15% on the first $100, then 8% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 100, pct: 15 }, { upTo: null, pct: 8 }],
  },
  {
    slug: "grocery", label: "Grocery", referralPct: 15,
    note: "8% on items priced $15 or less; 15% on the whole price when over $15.",
    tierMode: "whole", tiers: [{ upTo: 15, pct: 8 }, { upTo: null, pct: 15 }],
  },
  {
    slug: "health-personal-care", label: "Health & Personal Care", referralPct: 15,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "home-garden", label: "Home & Garden", referralPct: 15 },
  { slug: "industrial-scientific", label: "Industrial & Scientific", referralPct: 12 },
  {
    slug: "jewelry", label: "Jewelry", referralPct: 20,
    note: "20% on the first $250, then 5% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 250, pct: 20 }, { upTo: null, pct: 5 }],
  },
  { slug: "kitchen", label: "Kitchen", referralPct: 15 },
  { slug: "office-products", label: "Office Products", referralPct: 15 },
  { slug: "outdoors", label: "Outdoors", referralPct: 15 },
  { slug: "pet-supplies", label: "Pet Supplies", referralPct: 15 },
  { slug: "shoes", label: "Shoes, Handbags & Sunglasses", referralPct: 15 },
  { slug: "sporting-goods", label: "Sporting Goods", referralPct: 15 },
  { slug: "tools-home-improvement", label: "Tools & Home Improvement", referralPct: 15 },
  { slug: "toys-games", label: "Toys & Games", referralPct: 15 },
  { slug: "video-games", label: "Video Games", referralPct: 15 },
  {
    slug: "watches", label: "Watches", referralPct: 15,
    note: "15% on the first $1,500, then 3% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 1500, pct: 15 }, { upTo: null, pct: 3 }],
  },
]

// ── TikTok Shop ───────────────────────────────────────────────────────────────

// Verified 2026-10-21 against TikTok Shop Academy "Referral Fees by Category" (page dated 10/08/2026).
const TIKTOK_NOTE =
  "TikTok's published US table lists 6%. Some trade reports say most non-food categories moved to 8% on Aug 4, 2026, but TikTok has not confirmed it publicly. Check the referral fee line on your settlement statement; at 8% the fee is a third higher."

const TIKTOK_CATEGORIES: FeeCategory[] = [
  { slug: "apparel-accessories", label: "Apparel & Accessories", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "beauty-personal-care", label: "Beauty & Personal Care", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "food-beverage", label: "Food & Beverage", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "health", label: "Health", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "home-supplies", label: "Home Supplies", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "jewelry-accessories", label: "Jewelry & Accessories", referralPct: 6, note: "6% for most jewelry; TikTok lists 5% for its Diamond, Gold, Jade, Platinum/Carat Gold and Ruby, Sapphire & Emerald sub-categories. Some trade reports say most non-food rates moved to 8% on Aug 4, 2026; TikTok has not confirmed it, so check your settlement statement." },
  { slug: "kitchenware", label: "Kitchenware", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "pet-supplies", label: "Pet Supplies", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "shoes", label: "Shoes", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "sports-outdoor", label: "Sports & Outdoor", referralPct: 6, note: TIKTOK_NOTE },
  { slug: "toys-hobbies", label: "Toys & Hobbies", referralPct: 6, note: TIKTOK_NOTE },
]

// ── eBay ──────────────────────────────────────────────────────────────────────

// Verified 2026-10-16 against https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822 (basic, non-Store fees)
const ebayMarginal = (pct: number): Pick<FeeCategory, 'tierMode' | 'tiers' | 'note'> => ({
  tierMode: 'marginal', tiers: [{ upTo: 7500, pct }, { upTo: null, pct: 2.35 }],
  note: `${pct}% on the first $7,500 per item, then 2.35% on the excess.`,
})
const EBAY_CATEGORIES: FeeCategory[] = [
  { slug: "most-categories", label: "Most Categories (excluding special-rate categories)", referralPct: 13.6, ...ebayMarginal(13.6) },
  { slug: "books-movies-music", label: "Books, Movies & Music (excluding vinyl and NFTs)", referralPct: 15.3, ...ebayMarginal(15.3) },
  { slug: "clothing-shoes-accessories", label: "Clothing & Accessories (excluding handbags and athletic shoes)", referralPct: 13.6, ...ebayMarginal(13.6) },
  { slug: "coins-paper-money", label: "Coins & Paper Money (excluding bullion)", referralPct: 13.25, ...ebayMarginal(13.25) },
  { slug: "computers-tablets", label: "Computers & Tablets", referralPct: 13.6, ...ebayMarginal(13.6) },
  { slug: "jewelry-watches", label: "Jewelry (excluding watches, parts and accessories)", referralPct: 15,
    note: "15% on the whole amount at $5,000 or less; 9% on the whole amount above $5,000. Watches have a separate calculator.",
    tierMode: 'whole', tiers: [{ upTo: 5000, pct: 15 }, { upTo: null, pct: 9 }] },
  { slug: "watches", label: "Watches, Parts & Accessories", referralPct: 15,
    note: "15% through $1,000, 6.5% on the portion from $1,000 through $7,500, then 3% on the excess.",
    tierMode: 'marginal', tiers: [{ upTo: 1000, pct: 15 }, { upTo: 7500, pct: 6.5 }, { upTo: null, pct: 3 }] },
  { slug: "musical-instruments", label: "Musical Instruments & Gear (excluding guitars and basses)", referralPct: 13.6, ...ebayMarginal(13.6),
    note: "13.6% on the first $7,500, then 2.35% on the excess. Guitars and basses have a separate calculator." },
  { slug: "guitars-basses", label: "Guitars & Basses", referralPct: 6.7, ...ebayMarginal(6.7) },
  { slug: "sporting-goods", label: "Sporting Goods", referralPct: 13.6, ...ebayMarginal(13.6) },
  { slug: "trading-cards", label: "Trading Cards (excluding NFTs)", referralPct: 13.25, ...ebayMarginal(13.25) },
  { slug: "video-games-consoles", label: "Video Games & Consoles", referralPct: 13.6, ...ebayMarginal(13.6) },
]

// ── Etsy ──────────────────────────────────────────────────────────────────────

const ETSY_CATEGORIES: FeeCategory[] = [
  { slug: "all-categories", label: "All Categories", referralPct: 6.5 },
  { slug: "handmade", label: "Handmade", referralPct: 6.5 },
  { slug: "jewelry", label: "Jewelry", referralPct: 6.5 },
  { slug: "home-living", label: "Home & Living", referralPct: 6.5 },
  { slug: "clothing", label: "Clothing", referralPct: 6.5 },
  { slug: "craft-supplies", label: "Craft Supplies", referralPct: 6.5 },
  { slug: "vintage", label: "Vintage", referralPct: 6.5 },
]

export const MARKETPLACES: Marketplace[] = [
  {
    slug: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    feeName: "referral fee",
    fulfillmentName: "FBA",
    accountFee: { amount: 39.99, period: "month", note: "Professional selling plan" },
    // Source: https://sell.amazon.com/pricing
    sourceUrl: "https://sell.amazon.com/pricing",
    lastVerified: "2026-10-16",
    summary:
      "Amazon charges a referral fee on every sale, set by category and calculated on the total sale price including shipping. Sellers on the Professional plan also pay a monthly subscription, and FBA sellers pay separate fulfillment and storage fees on top of the referral fee.",
    categories: AMAZON_CATEGORIES,
  },
  {
    slug: "walmart",
    name: "Walmart Marketplace",
    shortName: "Walmart",
    feeName: "referral fee",
    fulfillmentName: "WFS",
    // Source: https://marketplace.walmart.com/pricing/ (old Marketplace Learn URL now returns "No Data found")
    sourceUrl: "https://marketplace.walmart.com/pricing/",
    lastVerified: "2026-10-16",
    summary:
      "Walmart Marketplace charges no monthly subscription or setup fee — sellers pay only a category-based referral fee on each sale. That makes the effective take rate easier to model than Amazon's, though Walmart Fulfillment Services (WFS) adds fulfillment and storage costs for sellers who use it.",
    categories: WALMART_CATEGORIES,
  },
  {
    slug: "tiktok-shop",
    name: "TikTok Shop",
    shortName: "TikTok Shop",
    feeName: "commission",
    fulfillmentName: "Fulfilled by TikTok",
    sourceUrl: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en",
    lastVerified: "2026-10-21",
    summary:
      "TikTok Shop charges a commission on each order, with payment processing bundled into it rather than billed as a separate line. Rates have moved several times since the US launch as introductory pricing wound down, so this is the schedule most worth re-checking before you model margin on it. TikTok's published US rate is 6% for most categories; some trade reports say it moved to 8% on Aug 4, 2026, which TikTok has not confirmed, so check your settlement statement.",
    categories: TIKTOK_CATEGORIES,
  },
  {
    slug: "ebay",
    name: "eBay",
    shortName: "eBay",
    feeName: "final value fee",
    fulfillmentName: null,
    perOrderFee: 0.4,
    smallOrderFee: { upTo: 10, amount: 0.3 },
    // Source: https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822 ($0.40 per-order fee on orders over $10; $0.30 at $10 or less)
    sourceUrl: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
    lastVerified: "2026-10-16",
    summary:
      "US eBay.com basic non-Store rates, checked October 16, 2026. One item per order, domestic sale, standard seller performance, no promotions. Final value fees include buyer shipping and collected tax; the per-order charge is $0.30 through $10 and $0.40 above. Calculators assume zero collected tax and handling, and exclude insertion fees, ads, international fees and seller surcharges. Store, vehicle, Live and special-rate categories require their own schedules.",
    categories: EBAY_CATEGORIES,
  },
  {
    slug: "etsy",
    name: "Etsy",
    shortName: "Etsy",
    feeName: "transaction fee",
    fulfillmentName: null,
    listingFee: 0.2,
    paymentProcessingPct: 3,
    paymentProcessingFlat: 0.25,
    // Source: https://www.etsy.com/legal/fees/ and https://help.etsy.com/hc/en-us/articles/115015628847 (6.5% transaction, $0.20 listing, 3% + $0.25 US processing; all unchanged)
    sourceUrl: "https://help.etsy.com/hc/en-us/articles/360000343968-Fees-Taxes-for-Selling-on-Etsy",
    lastVerified: "2026-10-16",
    summary:
      "Etsy applies one flat transaction fee across every category, which makes it the simplest take rate to model — but the headline number understates the real cost. Listing fees, payment processing, and optional Offsite Ads fees stack on top and materially change unit economics on low-priced items.",
    categories: ETSY_CATEGORIES,
  },
]

// ── Lookups ───────────────────────────────────────────────────────────────────

export function getMarketplace(slug: string): Marketplace | undefined {
  return MARKETPLACES.find((m) => m.slug === slug)
}

/**
 * Human rate label honest about tiers: "15%" for flat categories,
 * "8%–15%" for tiered ones — for titles and meta descriptions, which get no
 * room for the qualifying note the page body carries.
 */
export function rateLabel(category: FeeCategory): string {
  if (!category.tiers || category.tiers.length === 0) return `${category.referralPct}%`
  const pcts = category.tiers.map((t) => t.pct)
  const min = Math.min(...pcts)
  const max = Math.max(...pcts)
  return min === max ? `${min}%` : `${min}%–${max}%`
}

export function getCategory(marketplaceSlug: string, categorySlug: string): FeeCategory | undefined {
  return getMarketplace(marketplaceSlug)?.categories.find((c) => c.slug === categorySlug)
}

/** Every (marketplace, category) pair — drives generateStaticParams. */
export function getAllFeeRoutes(): { marketplace: string; category: string }[] {
  return MARKETPLACES.flatMap((m) =>
    m.categories.map((c) => ({ marketplace: m.slug, category: c.slug })),
  )
}

/** Catch-all category slugs that stand in when a marketplace has no specific match. */
/** Explicit comparison scope, checked 2026-10-16 against the official US tables.
 * These are category-level illustrations, not proof of a particular SKU's classification.
 * See docs/fee-accuracy.md for sources, rationale and excluded categories.
 * Separate source rows may intentionally share a destination; never deduplicate by target.
 */
export const CATEGORY_COMPARISONS: { amazon: string; walmart: string; rationale: string }[] = [
  { amazon: 'consumer-electronics', walmart: 'consumer-electronics', rationale: 'Consumer Electronics in both schedules; excludes accessories.' },
  { amazon: 'electronics-accessories', walmart: 'electronics-accessories', rationale: 'Electronics Accessories in both schedules; excludes Amazon Device Accessories.' },
  { amazon: 'baby-products', walmart: 'baby', rationale: 'Baby Products in both official tables.' },
  { amazon: 'beauty', walmart: 'beauty', rationale: 'Beauty subset of Beauty, Health and Personal Care in both tables.' },
  { amazon: 'health-personal-care', walmart: 'beauty', rationale: 'Health and personal care subset of the same named fee group.' },
  { amazon: 'grocery', walmart: 'grocery', rationale: 'Grocery in both tables.' },
  { amazon: 'kitchen', walmart: 'home-garden', rationale: 'Kitchen is within Amazon Home and Kitchen and Walmart Home, Kitchen, Decor & Garden.' },
]

export function getComparableCategories(marketplaceSlug: string, categoryLabel: string): { marketplace: Marketplace; category: FeeCategory }[] {
  const source = getMarketplace(marketplaceSlug)
  const category = source?.categories.find(c => c.label === categoryLabel)
  if (!category || (marketplaceSlug !== 'amazon' && marketplaceSlug !== 'walmart')) return []
  const other = marketplaceSlug === 'amazon' ? 'walmart' : 'amazon'
  const target = getMarketplace(other)!
  return CATEGORY_COMPARISONS.filter(row => row[marketplaceSlug] === category.slug).flatMap(row => {
    const match = target.categories.find(c => c.slug === row[other])
    return match ? [{ marketplace: target, category: match }] : []
  })
}

export function orderFee(marketplace: Marketplace, feeBase: number): number {
  return marketplace.smallOrderFee && feeBase <= marketplace.smallOrderFee.upTo
    ? marketplace.smallOrderFee.amount : marketplace.perOrderFee ?? 0
}

export function orderFeeLabel(marketplace: Marketplace): string {
  const small = marketplace.smallOrderFee
  return small ? `$${small.amount.toFixed(2)} per order through $${small.upTo}; $${(marketplace.perOrderFee ?? 0).toFixed(2)} above`
    : marketplace.perOrderFee ? `$${marketplace.perOrderFee.toFixed(2)} per order` : 'None in fee schedule'
}

// ── Fee math ──────────────────────────────────────────────────────────────────

export interface FeeBreakdownInput {
  salePrice: number
  unitCost: number
  /** What the seller pays to fulfill — an expense line. */
  shippingCost?: number
  /**
   * Shipping charged to the buyer. Marketplaces calculate percentage fees on
   * the order total including buyer-paid shipping (Amazon's referral fee and
   * eBay's final value fee both do), so this joins the fee base AND the
   * seller's revenue. Zero for free-shipping listings.
   */
  buyerShipping?: number
  marketplace: Marketplace
  category: FeeCategory
}

export interface FeeBreakdownLine {
  label: string
  amount: number
  detail?: string
}

export interface FeeBreakdown {
  lines: FeeBreakdownLine[]
  totalFees: number
  netProceeds: number
  profit: number
  marginPct: number
  takeRatePct: number
  breakEvenPrice: number
}

/** Round to cents without accumulating float drift across additions. */
function cents(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * The referral/commission fee for a price, honoring tiered schedules.
 * 'whole' tiers pick one rate for the entire price by which bracket the price
 * falls in; 'marginal' tiers charge each bracket's rate on the portion of the
 * price inside it. Exported so page copy (FAQ examples, JSON-LD) computes the
 * same number the calculator does.
 */
export function referralFee(salePrice: number, category: FeeCategory): { amount: number; detail: string } {
  const { tiers, tierMode } = category
  if (!tiers || tiers.length === 0) {
    return {
      amount: cents(salePrice * (category.referralPct / 100)),
      detail: `${category.referralPct}% of $${salePrice.toFixed(2)}`,
    }
  }

  if (tierMode === "whole") {
    const bracket = tiers.find((t) => t.upTo === null || salePrice <= t.upTo) ?? tiers[tiers.length - 1]
    return {
      amount: cents(salePrice * (bracket.pct / 100)),
      detail: `${bracket.pct}% of $${salePrice.toFixed(2)} (tiered by total price)`,
    }
  }

  // Marginal: walk the brackets, charging each rate on its slice of the price.
  let remaining = salePrice
  let lower = 0
  let amount = 0
  const parts: string[] = []
  for (const tier of tiers) {
    if (remaining <= 0) break
    const upper = tier.upTo ?? Infinity
    const slice = Math.min(remaining, upper - lower)
    if (slice > 0) {
      amount += slice * (tier.pct / 100)
      parts.push(`${tier.pct}% on $${slice.toFixed(2)}`)
      remaining -= slice
      lower = upper
    }
  }
  return { amount: cents(amount), detail: parts.join(" + ") }
}

export function computeFeeBreakdown({
  salePrice,
  unitCost,
  shippingCost = 0,
  buyerShipping = 0,
  marketplace,
  category,
}: FeeBreakdownInput): FeeBreakdown {
  const lines: FeeBreakdownLine[] = []

  // Percentage fees (and whole-price tier brackets) are computed on the order
  // total including buyer-paid shipping — that's how Amazon and eBay define
  // their fee base. It's also the seller's actual revenue.
  const feeBase = salePrice + buyerShipping

  const referral = referralFee(feeBase, category)
  const referralWithMin = category.minFee ? Math.max(referral.amount, category.minFee) : referral.amount
  lines.push({
    label: `${marketplace.shortName} ${marketplace.feeName}`,
    amount: referralWithMin,
    detail: buyerShipping > 0 ? `${referral.detail} — base includes buyer-paid shipping` : referral.detail,
  })

  if (marketplace.perOrderFee) {
    lines.push({
      label: "Per-order fee",
      amount: orderFee(marketplace, feeBase),
      detail: orderFeeLabel(marketplace),
    })
  }

  if (marketplace.listingFee) {
    lines.push({
      label: "Listing fee",
      amount: marketplace.listingFee,
      detail: "Charged per listing",
    })
  }

  if (marketplace.paymentProcessingPct) {
    const processing = cents(
      feeBase * (marketplace.paymentProcessingPct / 100) + (marketplace.paymentProcessingFlat ?? 0),
    )
    lines.push({
      label: "Payment processing",
      amount: processing,
      detail: `${marketplace.paymentProcessingPct}%${
        marketplace.paymentProcessingFlat ? ` + $${marketplace.paymentProcessingFlat.toFixed(2)}` : ""
      }`,
    })
  }

  if (shippingCost > 0) {
    lines.push({ label: "Fulfillment / shipping", amount: cents(shippingCost) })
  }

  const totalFees = cents(lines.reduce((sum, line) => sum + line.amount, 0))
  const netProceeds = cents(feeBase - totalFees)
  const profit = cents(netProceeds - unitCost)
  const marginPct = feeBase > 0 ? cents((profit / feeBase) * 100) : 0
  const takeRatePct = feeBase > 0 ? cents((totalFees / feeBase) * 100) : 0

  const breakEvenPrice = solveBreakEven(unitCost, shippingCost, buyerShipping, marketplace, category)

  return { lines, totalFees, netProceeds, profit, marginPct, takeRatePct, breakEvenPrice }
}

function profitAt(
  price: number,
  unitCost: number,
  shippingCost: number,
  buyerShipping: number,
  marketplace: Marketplace,
  category: FeeCategory,
): number {
  // Mirror computeFeeBreakdown's per-line cent rounding exactly — an
  // unrounded processing fee here can put the "break-even" price a cent into
  // displayed loss.
  const feeBase = price + buyerShipping
  const referral = referralFee(feeBase, category)
  const withMin = category.minFee ? Math.max(referral.amount, category.minFee) : referral.amount
  const processing = marketplace.paymentProcessingPct
    ? cents(feeBase * (marketplace.paymentProcessingPct / 100) + (marketplace.paymentProcessingFlat ?? 0))
    : 0
  const totalFees = cents(
    withMin + orderFee(marketplace, feeBase) + (marketplace.listingFee ?? 0) + processing + cents(shippingCost),
  )
  return cents(cents(feeBase - totalFees) - unitCost)
}

/**
 * Lowest price at which profit reaches zero AND stays non-negative at every
 * higher price, found numerically. Whole-price tier switches make profit
 * *discontinuous*: Amazon Baby with a $9.10 cost breaks even near $9.89 at 8%,
 * dips back into loss just above $10 when the whole price flips to 15%, and
 * doesn't recover until ~$10.71. Returning the first crossing would falsely
 * imply every higher price is profitable — so we find the LAST sign change.
 * Tier boundaries are sampled explicitly so no negative window between grid
 * points can be missed.
 */
function solveBreakEven(
  unitCost: number,
  shippingCost: number,
  buyerShipping: number,
  marketplace: Marketplace,
  category: FeeCategory,
): number {
  const upper = Math.max((unitCost + shippingCost + 5) * 4, 50)
  const steps = 2000

  const samples: number[] = []
  for (let i = 0; i <= steps; i++) {
    samples.push(0.01 + (upper - 0.01) * (i / steps))
  }
  for (const tier of [...(category.tiers ?? []), ...(marketplace.smallOrderFee ? [{ upTo: marketplace.smallOrderFee.upTo }] : [])]) {
    // Tier thresholds live in fee-base space (price + buyer shipping), so the
    // discontinuity in ITEM price sits at upTo - buyerShipping.
    const boundary = tier.upTo !== null ? tier.upTo - buyerShipping : null
    if (boundary !== null && boundary > 0 && boundary < upper) {
      // Both sides of each discontinuity.
      samples.push(boundary, boundary + 0.001)
    }
  }
  samples.sort((a, b) => a - b)

  const profits = samples.map((p) => profitAt(p, unitCost, shippingCost, buyerShipping, marketplace, category))

  // Index of the last sample still in loss; break-even sits in the interval
  // just after it. If nothing is ever in loss, the first sample already works.
  let lastNegative = -1
  for (let i = 0; i < profits.length; i++) {
    if (profits[i] < 0) lastNegative = i
  }
  if (lastNegative === -1) return cents(samples[0])
  if (lastNegative === profits.length - 1) return cents(upper)

  let lo = samples[lastNegative]
  let hi = samples[lastNegative + 1]
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2
    if (profitAt(mid, unitCost, shippingCost, buyerShipping, marketplace, category) >= 0) hi = mid
    else lo = mid
  }
  // Rounding the crossing to a displayable cent can land one cent short of
  // profitability — nudge up until the displayed price is genuinely break-even.
  let result = cents(hi)
  while (profitAt(result, unitCost, shippingCost, buyerShipping, marketplace, category) < 0) {
    result = cents(result + 0.01)
  }
  return result
}

/** Same product modelled across every marketplace that carries the category. */
export function compareAcrossMarketplaces(
  salePrice: number,
  unitCost: number,
  categoryLabel: string,
  sourceMarketplace: MarketplaceSlug,
  buyerShipping = 0,
  shippingCost = 0,
): { marketplace: Marketplace; category: FeeCategory; breakdown: FeeBreakdown }[] {
  const source = getMarketplace(sourceMarketplace)
  const sourceCategory = source?.categories.find(c => c.label === categoryLabel)
  if (!source || !sourceCategory) return []
  return [{ marketplace: source, category: sourceCategory }, ...getComparableCategories(sourceMarketplace, categoryLabel)]
    .map(({ marketplace, category }) => ({ marketplace, category,
      breakdown: computeFeeBreakdown({ salePrice, unitCost, buyerShipping, shippingCost, marketplace, category }),
    }))
    .sort((a, b) => b.breakdown.profit - a.breakdown.profit)
}

export function formatVerifiedDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}
