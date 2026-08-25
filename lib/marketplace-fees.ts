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

const AMAZON_CATEGORIES: FeeCategory[] = [
  { slug: "amazon-device-accessories", label: "Amazon Device Accessories", referralPct: 45 },
  {
    slug: "appliances", label: "Appliances", referralPct: 15,
    note: "Full-size appliances: 15% on the first $300, then 8% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 300, pct: 15 }, { upTo: null, pct: 8 }],
  },
  { slug: "automotive", label: "Automotive & Powersports", referralPct: 12 },
  {
    slug: "baby-products", label: "Baby Products", referralPct: 8,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "backpacks-handbags", label: "Backpacks & Handbags", referralPct: 15 },
  {
    slug: "beauty", label: "Beauty", referralPct: 8,
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
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 8 },
  { slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15 },
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
    slug: "health-personal-care", label: "Health & Personal Care", referralPct: 8,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "home-garden", label: "Home & Garden", referralPct: 15 },
  {
    slug: "jewelry", label: "Jewelry", referralPct: 20,
    note: "20% on the first $250, then 5% on the portion above.",
    tierMode: "marginal", tiers: [{ upTo: 250, pct: 20 }, { upTo: null, pct: 5 }],
  },
  { slug: "kitchen", label: "Kitchen", referralPct: 15 },
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

const WALMART_CATEGORIES: FeeCategory[] = [
  { slug: "apparel-accessories", label: "Apparel & Accessories", referralPct: 15 },
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
  { slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15 },
  {
    slug: "grocery", label: "Grocery", referralPct: 15,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  {
    slug: "health-personal-care", label: "Health & Personal Care", referralPct: 15,
    note: "8% on items priced $10 or less; 15% on the whole price when over $10.",
    tierMode: "whole", tiers: [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }],
  },
  { slug: "home-garden", label: "Home & Garden", referralPct: 15 },
  { slug: "industrial-scientific", label: "Industrial & Scientific", referralPct: 12 },
  { slug: "jewelry", label: "Jewelry", referralPct: 20 },
  { slug: "kitchen", label: "Kitchen", referralPct: 15 },
  { slug: "office-products", label: "Office Products", referralPct: 15 },
  { slug: "outdoors", label: "Outdoors", referralPct: 15 },
  { slug: "pet-supplies", label: "Pet Supplies", referralPct: 15 },
  { slug: "shoes", label: "Shoes, Handbags & Sunglasses", referralPct: 15 },
  { slug: "sporting-goods", label: "Sporting Goods", referralPct: 15 },
  { slug: "tools-home-improvement", label: "Tools & Home Improvement", referralPct: 15 },
  { slug: "toys-games", label: "Toys & Games", referralPct: 15 },
  { slug: "video-games", label: "Video Games", referralPct: 15 },
  { slug: "watches", label: "Watches", referralPct: 15 },
]

// ── TikTok Shop ───────────────────────────────────────────────────────────────

const TIKTOK_CATEGORIES: FeeCategory[] = [
  { slug: "apparel-accessories", label: "Apparel & Accessories", referralPct: 8 },
  { slug: "beauty-personal-care", label: "Beauty & Personal Care", referralPct: 8 },
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 8 },
  { slug: "food-beverage", label: "Food & Beverage", referralPct: 8 },
  { slug: "health", label: "Health", referralPct: 8 },
  { slug: "home-supplies", label: "Home Supplies", referralPct: 8 },
  { slug: "jewelry-accessories", label: "Jewelry & Accessories", referralPct: 8 },
  { slug: "kitchenware", label: "Kitchenware", referralPct: 8 },
  { slug: "pet-supplies", label: "Pet Supplies", referralPct: 8 },
  { slug: "shoes", label: "Shoes", referralPct: 8 },
  { slug: "sports-outdoor", label: "Sports & Outdoor", referralPct: 8 },
  { slug: "toys-hobbies", label: "Toys & Hobbies", referralPct: 8 },
]

// ── eBay ──────────────────────────────────────────────────────────────────────

const EBAY_CATEGORIES: FeeCategory[] = [
  { slug: "most-categories", label: "Most Categories", referralPct: 13.25 },
  { slug: "books-movies-music", label: "Books, Movies & Music", referralPct: 15.3 },
  { slug: "clothing-shoes-accessories", label: "Clothing, Shoes & Accessories", referralPct: 13.25 },
  { slug: "coins-paper-money", label: "Coins & Paper Money", referralPct: 9 },
  { slug: "computers-tablets", label: "Computers & Tablets", referralPct: 12.35 },
  { slug: "jewelry-watches", label: "Jewelry & Watches", referralPct: 15 },
  { slug: "musical-instruments", label: "Musical Instruments & Gear", referralPct: 6.35 },
  { slug: "sporting-goods", label: "Sporting Goods", referralPct: 13.25 },
  { slug: "trading-cards", label: "Trading Cards", referralPct: 13.25 },
  { slug: "video-games-consoles", label: "Video Games & Consoles", referralPct: 13.25 },
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
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98ST",
    lastVerified: "2026-08-12",
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
    sourceUrl: "https://marketplacelearn.walmart.com/guides/Getting%20started/referral-fees",
    lastVerified: "2026-08-12",
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
    sourceUrl: "https://seller-us.tiktok.com/university/essay?knowledge_id=10004017",
    lastVerified: "2026-08-12",
    summary:
      "TikTok Shop charges a flat commission on each order plus payment processing. Rates have moved several times since the US launch as introductory pricing wound down, so this is the schedule most worth re-checking before you model margin on it.",
    categories: TIKTOK_CATEGORIES,
  },
  {
    slug: "ebay",
    name: "eBay",
    shortName: "eBay",
    feeName: "final value fee",
    fulfillmentName: null,
    perOrderFee: 0.4,
    sourceUrl: "https://www.ebay.com/help/selling/fees-credits-invoices/store-selling-fees",
    lastVerified: "2026-08-12",
    summary:
      "eBay charges a final value fee calculated on the total amount of the sale including shipping and tax, plus a flat per-order fee. Rates vary more by category than on most marketplaces, and eBay Store subscribers get reduced rates plus a monthly allocation of zero-insertion-fee listings.",
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
    sourceUrl: "https://help.etsy.com/hc/en-us/articles/360000343968-Fees-Taxes-for-Selling-on-Etsy",
    lastVerified: "2026-08-12",
    summary:
      "Etsy applies one flat transaction fee across every category, which makes it the simplest take rate to model — but the headline number understates the real cost. Listing fees, payment processing, and optional Offsite Ads fees stack on top and materially change unit economics on low-priced items.",
    categories: ETSY_CATEGORIES,
  },
]

// ── Lookups ───────────────────────────────────────────────────────────────────

export function getMarketplace(slug: string): Marketplace | undefined {
  return MARKETPLACES.find((m) => m.slug === slug)
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

/**
 * Other marketplaces carrying a category with the same label, so each page can
 * cross-link to its true comparison set rather than an arbitrary list.
 */
export function getComparableCategories(
  marketplaceSlug: string,
  categoryLabel: string,
): { marketplace: Marketplace; category: FeeCategory }[] {
  const normalized = categoryLabel.toLowerCase()
  const firstWord = normalized.split(/[\s&,]+/)[0]

  return MARKETPLACES.filter((m) => m.slug !== marketplaceSlug)
    .map((m) => {
      const exact = m.categories.find((c) => c.label.toLowerCase() === normalized)
      const partial = m.categories.find((c) => c.label.toLowerCase().startsWith(firstWord))
      const fallback = m.categories.length === 1 ? m.categories[0] : undefined
      const category = exact ?? partial ?? fallback
      return category ? { marketplace: m, category } : null
    })
    .filter((entry): entry is { marketplace: Marketplace; category: FeeCategory } => entry !== null)
}

// ── Fee math ──────────────────────────────────────────────────────────────────

export interface FeeBreakdownInput {
  salePrice: number
  unitCost: number
  shippingCost?: number
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
 * price inside it.
 */
function referralFee(salePrice: number, category: FeeCategory): { amount: number; detail: string } {
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
  marketplace,
  category,
}: FeeBreakdownInput): FeeBreakdown {
  const lines: FeeBreakdownLine[] = []

  const referral = referralFee(salePrice, category)
  const referralWithMin = category.minFee ? Math.max(referral.amount, category.minFee) : referral.amount
  lines.push({
    label: `${marketplace.shortName} ${marketplace.feeName}`,
    amount: referralWithMin,
    detail: referral.detail,
  })

  if (marketplace.perOrderFee) {
    lines.push({
      label: "Per-order fee",
      amount: marketplace.perOrderFee,
      detail: "Flat, charged once per order",
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
      salePrice * (marketplace.paymentProcessingPct / 100) + (marketplace.paymentProcessingFlat ?? 0),
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
  const netProceeds = cents(salePrice - totalFees)
  const profit = cents(netProceeds - unitCost)
  const marginPct = salePrice > 0 ? cents((profit / salePrice) * 100) : 0
  const takeRatePct = salePrice > 0 ? cents((totalFees / salePrice) * 100) : 0

  const breakEvenPrice = solveBreakEven(unitCost, shippingCost, marketplace, category)

  return { lines, totalFees, netProceeds, profit, marginPct, takeRatePct, breakEvenPrice }
}

function profitAt(
  price: number,
  unitCost: number,
  shippingCost: number,
  marketplace: Marketplace,
  category: FeeCategory,
): number {
  const referral = referralFee(price, category)
  const withMin = category.minFee ? Math.max(referral.amount, category.minFee) : referral.amount
  const processing = marketplace.paymentProcessingPct
    ? price * (marketplace.paymentProcessingPct / 100) + (marketplace.paymentProcessingFlat ?? 0)
    : 0
  const fees = withMin + (marketplace.perOrderFee ?? 0) + (marketplace.listingFee ?? 0) + processing + shippingCost
  return price - fees - unitCost
}

/**
 * Lowest price at which profit reaches zero, found numerically. Whole-price
 * tier switches make profit *discontinuous* (crossing $10 in Amazon Baby jumps
 * the fee on the entire price from 8% to 15%), so a closed-form solve is
 * wrong by construction — scan for the first crossing, then bisect within it.
 */
function solveBreakEven(
  unitCost: number,
  shippingCost: number,
  marketplace: Marketplace,
  category: FeeCategory,
): number {
  const upper = Math.max((unitCost + shippingCost + 5) * 4, 50)
  const steps = 2000
  let prevPrice = 0.01
  let prevProfit = profitAt(prevPrice, unitCost, shippingCost, marketplace, category)
  if (prevProfit >= 0) return cents(prevPrice)

  for (let i = 1; i <= steps; i++) {
    const price = 0.01 + (upper - 0.01) * (i / steps)
    const profit = profitAt(price, unitCost, shippingCost, marketplace, category)
    if (profit >= 0) {
      // Bisect the bracketing interval down to sub-cent precision.
      let lo = prevPrice
      let hi = price
      for (let iter = 0; iter < 40; iter++) {
        const mid = (lo + hi) / 2
        if (profitAt(mid, unitCost, shippingCost, marketplace, category) >= 0) hi = mid
        else lo = mid
      }
      return cents(hi)
    }
    prevPrice = price
    prevProfit = profit
  }
  return cents(upper)
}

/** Same product modelled across every marketplace that carries the category. */
export function compareAcrossMarketplaces(
  salePrice: number,
  unitCost: number,
  categoryLabel: string,
): { marketplace: Marketplace; category: FeeCategory; breakdown: FeeBreakdown }[] {
  const normalized = categoryLabel.toLowerCase()
  const firstWord = normalized.split(/[\s&,]+/)[0]

  return MARKETPLACES.map((m) => {
    const exact = m.categories.find((c) => c.label.toLowerCase() === normalized)
    const partial = m.categories.find((c) => c.label.toLowerCase().startsWith(firstWord))
    const fallback = m.categories.length === 1 ? m.categories[0] : undefined
    const category = exact ?? partial ?? fallback
    if (!category) return null
    return {
      marketplace: m,
      category,
      breakdown: computeFeeBreakdown({ salePrice, unitCost, marketplace: m, category }),
    }
  })
    .filter(
      (entry): entry is { marketplace: Marketplace; category: FeeCategory; breakdown: FeeBreakdown } =>
        entry !== null,
    )
    .sort((a, b) => b.breakdown.profit - a.breakdown.profit)
}

export function formatVerifiedDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
