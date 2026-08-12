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

/** A tiered rate that applies below/above a price threshold. */
export interface FeeTier {
  /** Rate applies to the portion of price at or below this amount. */
  upTo: number | null
  pct: number
  label: string
}

export interface FeeCategory {
  slug: string
  label: string
  /** Headline referral / commission / final-value rate, as a percentage. */
  referralPct: number
  /** Rendered as a caveat under the headline rate. */
  note?: string
  /** When present, overrides the flat rate with threshold-based pricing. */
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
  { slug: "appliances", label: "Appliances", referralPct: 15, note: "Large appliances are charged at 8% on the portion above $300." },
  { slug: "automotive", label: "Automotive & Powersports", referralPct: 12 },
  { slug: "baby-products", label: "Baby Products", referralPct: 8, note: "15% on the portion of the price above $10." },
  { slug: "backpacks-handbags", label: "Backpacks & Handbags", referralPct: 15 },
  { slug: "beauty", label: "Beauty", referralPct: 8, note: "15% on the portion of the price above $10." },
  { slug: "business-industrial", label: "Business & Industrial", referralPct: 12 },
  { slug: "clothing-accessories", label: "Clothing & Accessories", referralPct: 17 },
  { slug: "computers", label: "Computers", referralPct: 8 },
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 8 },
  { slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15 },
  { slug: "furniture", label: "Furniture", referralPct: 15, note: "10% on the portion of the price above $200." },
  { slug: "grocery", label: "Grocery & Gourmet Food", referralPct: 8, note: "15% on the portion of the price above $15." },
  { slug: "health-personal-care", label: "Health & Personal Care", referralPct: 8, note: "15% on the portion of the price above $10." },
  { slug: "home-garden", label: "Home & Garden", referralPct: 15 },
  { slug: "jewelry", label: "Jewelry", referralPct: 20, note: "5% on the portion of the price above $250." },
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
  { slug: "watches", label: "Watches", referralPct: 16, note: "3% on the portion of the price above $1,500." },
  { slug: "everything-else", label: "Everything Else", referralPct: 15 },
]

// ── Walmart ───────────────────────────────────────────────────────────────────

const WALMART_CATEGORIES: FeeCategory[] = [
  { slug: "apparel-accessories", label: "Apparel & Accessories", referralPct: 15 },
  { slug: "automotive", label: "Automotive & Powersports", referralPct: 12 },
  { slug: "baby", label: "Baby", referralPct: 15, note: "8% on items priced $10 or less." },
  { slug: "beauty", label: "Beauty", referralPct: 15, note: "8% on items priced $10 or less." },
  { slug: "books", label: "Books", referralPct: 15 },
  { slug: "camera-photo", label: "Camera & Photo", referralPct: 8 },
  { slug: "cell-phones", label: "Cell Phones", referralPct: 8 },
  { slug: "consumer-electronics", label: "Consumer Electronics", referralPct: 8 },
  { slug: "electronics-accessories", label: "Electronics Accessories", referralPct: 15 },
  { slug: "grocery", label: "Grocery", referralPct: 15, note: "8% on items priced $10 or less." },
  { slug: "health-personal-care", label: "Health & Personal Care", referralPct: 15, note: "8% on items priced $10 or less." },
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

export function computeFeeBreakdown({
  salePrice,
  unitCost,
  shippingCost = 0,
  marketplace,
  category,
}: FeeBreakdownInput): FeeBreakdown {
  const lines: FeeBreakdownLine[] = []

  const referral = cents(salePrice * (category.referralPct / 100))
  const referralWithMin = category.minFee ? Math.max(referral, category.minFee) : referral
  lines.push({
    label: `${marketplace.shortName} ${marketplace.feeName}`,
    amount: referralWithMin,
    detail: `${category.referralPct}% of $${salePrice.toFixed(2)}`,
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

  // Fees that scale with price, expressed as a fraction, so we can solve for the
  // price at which profit reaches zero rather than iterating.
  const variableRate = category.referralPct / 100 + (marketplace.paymentProcessingPct ?? 0) / 100
  const fixedCosts =
    unitCost +
    shippingCost +
    (marketplace.perOrderFee ?? 0) +
    (marketplace.listingFee ?? 0) +
    (marketplace.paymentProcessingFlat ?? 0)
  const breakEvenPrice = variableRate < 1 ? cents(fixedCosts / (1 - variableRate)) : 0

  return { lines, totalFees, netProceeds, profit, marginPct, takeRatePct, breakEvenPrice }
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
