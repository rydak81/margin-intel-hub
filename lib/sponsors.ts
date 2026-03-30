// Sponsor and partner configuration for MarketplaceBeta.
// These modules are designed to feel like useful recommendations, not generic ad inventory.

export type SponsorAudience =
  | "sellers"
  | "operators"
  | "agencies"
  | "saas"
  | "investors"
  | "service_providers"

export type SponsorTopic =
  | "all"
  | "platform"
  | "market"
  | "profitability"
  | "deals"
  | "tools"
  | "advertising"
  | "logistics"
  | "events"
  | "tactics"
  | "breaking"
  | "amazon"
  | "walmart"
  | "tiktok"
  | "shopify"
  | "agency_growth"

export type SponsorModuleType =
  | "tool-spotlight"
  | "operator-offer"
  | "partner-insight"
  | "sponsored-benchmark"

export type SponsorZone = "top-banner" | "sidebar" | "inline" | "footer"
export type SponsorPage = "home" | "article"

export interface SponsorConfig {
  id: string
  name: string
  partnerType: string
  moduleType: SponsorModuleType
  tagline: string
  description: string
  proofPoint: string
  useCase: string
  whyRelevant: string
  ctaText: string
  ctaUrl: string
  secondaryCtaText?: string
  secondaryCtaUrl?: string
  logoUrl?: string
  bannerImageUrl?: string
  bannerImageAlt?: string
  bannerAspectRatio?: string
  backgroundColor: string
  textColor: string
  badge: string
  trustLabel: string
  highlights: string[]
  audiences: SponsorAudience[]
  topics: SponsorTopic[]
  imageFocus?: Partial<Record<SponsorZone, string>>
}

export interface AdPlacement {
  id: string
  zone: SponsorZone
  sponsor: SponsorConfig
  active: boolean
  pages: (SponsorPage | "all")[]
  dismissible?: boolean
  sponsorPool?: SponsorConfig[]
}

export interface SponsorContext {
  topic?: string
  audiences?: string[]
}

function normalizeTopic(topic?: string): SponsorTopic | undefined {
  if (!topic) return undefined

  const mapping: Record<string, SponsorTopic> = {
    all: "all",
    breaking: "breaking",
    market: "market",
    market_metrics: "market",
    market_trends: "market",
    platform: "platform",
    platform_updates: "platform",
    profitability: "profitability",
    seller_profitability: "profitability",
    mergers_acquisitions: "deals",
    deals: "deals",
    tools: "tools",
    tools_technology: "tools",
    seller_tools: "tools",
    advertising: "advertising",
    advertising_marketing: "advertising",
    logistics: "logistics",
    logistics_supply_chain: "logistics",
    tactics: "tactics",
    strategy_tactics: "tactics",
    events: "events",
    amazon: "amazon",
    walmart: "walmart",
    tiktok: "tiktok",
    shopify: "shopify",
    agency_growth: "agency_growth",
  }

  return mapping[topic.replace(/-/g, "_").toLowerCase()]
}

function normalizeAudience(audience?: string): SponsorAudience | undefined {
  if (!audience) return undefined

  const mapping: Record<string, SponsorAudience> = {
    sellers: "sellers",
    operators: "operators",
    agencies: "agencies",
    saas: "saas",
    investors: "investors",
    service_providers: "service_providers",
    "service-providers": "service_providers",
  }

  return mapping[audience.toLowerCase()]
}

function moduleTypeLabel(type: SponsorModuleType): string {
  const labels: Record<SponsorModuleType, string> = {
    "tool-spotlight": "Tool Spotlight",
    "operator-offer": "Operator Offer",
    "partner-insight": "Partner Insight",
    "sponsored-benchmark": "Sponsored Benchmark",
  }

  return labels[type]
}

export const SPONSORS: Record<string, SponsorConfig> = {
  marginpro: {
    id: "marginpro",
    name: "MarginPro",
    partnerType: "Amazon Profitability Platform",
    moduleType: "tool-spotlight",
    tagline: "Stop guessing your true Amazon margins",
    description:
      "A profitability command center for Amazon operators who need clean SKU-level margin visibility across fees, ad spend, COGS, reimbursements, and cash leaks.",
    proofPoint: "Helps teams recover and protect 1-3% of revenue lost to overcharges, shortages, and margin blind spots.",
    useCase: "Ideal for finance-minded sellers, operators, and agency partners managing catalog performance at scale.",
    whyRelevant:
      "Profitability stories are only useful if readers can actually act on margin pressure. MarginPro turns fee and reimbursement coverage into a workflow.",
    ctaText: "Book a Margin Review",
    ctaUrl: "https://www.threecolts.com/margin-pro",
    secondaryCtaText: "See Partner Tools",
    secondaryCtaUrl: "/partners",
    logoUrl: "/sponsors/marginpro-logo.svg",
    bannerImageUrl: "/sponsors/marginpro-banner.png",
    bannerImageAlt: "MarginPro profit analytics dashboard",
    bannerAspectRatio: "1760 / 250",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    badge: "Recommended Tool",
    trustLabel: "Used by Amazon operators focused on margin discipline",
    highlights: [
      "SKU-level profit monitoring",
      "Fee and reimbursement visibility",
      "Useful for agency performance reviews",
    ],
    audiences: ["sellers", "operators", "agencies"],
    topics: ["profitability", "amazon", "advertising", "logistics"],
    imageFocus: {
      "top-banner": "center 24%",
      inline: "center 35%",
      sidebar: "center center",
      footer: "center 28%",
    },
  },
  marketplacepulse: {
    id: "marketplacepulse",
    name: "Marketplace Pulse",
    partnerType: "Research and Intelligence Source",
    moduleType: "sponsored-benchmark",
    tagline: "Benchmark marketplace moves against real industry data",
    description:
      "Independent research and market data that helps operators, agencies, and SaaS teams understand category shifts, platform behavior, and competitive movement.",
    proofPoint: "A trusted source for category benchmarks, seller ecosystem trends, and marketplace market-share context.",
    useCase: "Best for teams building decks, investor updates, strategy memos, or point-of-view content that needs strong supporting data.",
    whyRelevant:
      "When readers want deeper context behind marketplace headlines, Marketplace Pulse provides the benchmark layer that makes those stories more actionable.",
    ctaText: "Explore Research",
    ctaUrl: "https://www.marketplacepulse.com?ref=marketplacebeta",
    secondaryCtaText: "Browse Research Partners",
    secondaryCtaUrl: "/partners",
    logoUrl: "/sponsors/marketplacepulse-logo.png",
    backgroundColor: "#111827",
    textColor: "#ffffff",
    badge: "Preferred Source",
    trustLabel: "Research-driven context for strategic decision makers",
    highlights: [
      "Marketplace benchmark data",
      "Useful for agency and SaaS positioning",
      "Helps frame investor-grade narratives",
    ],
    audiences: ["operators", "agencies", "saas", "investors"],
    topics: ["market", "deals", "platform", "agency_growth", "all"],
    imageFocus: {
      "top-banner": "center center",
      inline: "center center",
      sidebar: "center center",
      footer: "center center",
    },
  },
  cedcommerce: {
    id: "cedcommerce",
    name: "CedCommerce",
    partnerType: "Multi-Channel Operations Platform",
    moduleType: "operator-offer",
    tagline: "Connect more channels without adding operational chaos",
    description:
      "A centralized operations layer for syncing inventory, orders, and catalog data across Amazon, Walmart, TikTok Shop, eBay, and other channels.",
    proofPoint: "Useful for lean teams trying to expand distribution without multiplying manual ops work.",
    useCase: "Strong fit for agencies onboarding omnichannel clients and operators scaling beyond a single marketplace.",
    whyRelevant:
      "Expansion and platform-update coverage is more valuable when readers can move from strategy to execution. CedCommerce helps close that gap.",
    ctaText: "Explore Integrations",
    ctaUrl: "https://cedcommerce.com/",
    secondaryCtaText: "View Partner Marketplace",
    secondaryCtaUrl: "/partners",
    logoUrl: "/sponsors/cedcommerce-logo.svg",
    bannerImageUrl: "/sponsors/cedcommerce-banner.png",
    bannerImageAlt: "CedCommerce multichannel commerce banner",
    bannerAspectRatio: "1760 / 250",
    backgroundColor: "#0f766e",
    textColor: "#ffffff",
    badge: "Integration Partner",
    trustLabel: "Built for multichannel sellers and service teams",
    highlights: [
      "Catalog and order sync",
      "Cross-channel expansion support",
      "Agency-friendly workflow coverage",
    ],
    audiences: ["sellers", "operators", "agencies", "service_providers"],
    topics: ["platform", "tools", "logistics", "walmart", "tiktok", "shopify"],
    imageFocus: {
      "top-banner": "center 22%",
      inline: "center 25%",
      sidebar: "center center",
      footer: "center 25%",
    },
  },
  threecolts: {
    id: "threecolts",
    name: "Threecolts",
    partnerType: "Marketplace Commerce Platform",
    moduleType: "partner-insight",
    tagline: "The operating system for marketplace growth teams",
    description:
      "A suite of tools for marketplace sellers and the agencies who support them, spanning profitability, inventory, automation, and operational visibility.",
    proofPoint: "A strong ecosystem story for agencies that want better operator outcomes and more relevant client conversations.",
    useCase: "Best for partner managers, agencies, and operator teams looking for a broader stack instead of isolated point solutions.",
    whyRelevant:
      "MarketplaceBeta can become a lead and insight engine for agency partnerships. Threecolts is the clearest ecosystem story to anchor that vision.",
    ctaText: "Explore Threecolts",
    ctaUrl: "https://www.threecolts.com/",
    secondaryCtaText: "Become a Partner",
    secondaryCtaUrl: "/partners",
    logoUrl: "/sponsors/threecolts-logo.svg",
    bannerImageUrl: "/sponsors/threecolts-banner.png",
    bannerImageAlt: "Threecolts marketplace growth platform banner",
    bannerAspectRatio: "1760 / 250",
    backgroundColor: "#020617",
    textColor: "#ffffff",
    badge: "Strategic Partner",
    trustLabel: "Relevant for agencies, operators, and partner-led growth",
    highlights: [
      "Multi-tool operator stack",
      "Partner ecosystem positioning",
      "Useful for lead-generation conversations",
    ],
    audiences: ["operators", "agencies", "saas", "service_providers"],
    topics: ["tools", "platform", "agency_growth", "all"],
    imageFocus: {
      "top-banner": "center 30%",
      inline: "center 20%",
      sidebar: "center center",
      footer: "center 30%",
    },
  },
}

export const ALL_SPONSORS = Object.values(SPONSORS)

export const AD_PLACEMENTS: AdPlacement[] = [
  {
    id: "home-top-banner",
    zone: "top-banner",
    sponsor: SPONSORS.threecolts,
    sponsorPool: [SPONSORS.threecolts, SPONSORS.marginpro, SPONSORS.cedcommerce],
    active: true,
    pages: ["home"],
    dismissible: false,
  },
  {
    id: "home-sidebar",
    zone: "sidebar",
    sponsor: SPONSORS.marginpro,
    sponsorPool: [SPONSORS.marginpro, SPONSORS.marketplacepulse, SPONSORS.cedcommerce],
    active: true,
    pages: ["home"],
    dismissible: false,
  },
  {
    id: "home-inline",
    zone: "inline",
    sponsor: SPONSORS.marginpro,
    sponsorPool: [SPONSORS.marginpro, SPONSORS.threecolts, SPONSORS.cedcommerce],
    active: true,
    pages: ["home"],
    dismissible: false,
  },
  {
    id: "home-inline-2",
    zone: "inline",
    sponsor: SPONSORS.cedcommerce,
    sponsorPool: [SPONSORS.cedcommerce, SPONSORS.threecolts, SPONSORS.marketplacepulse],
    active: true,
    pages: ["home"],
    dismissible: false,
  },
  {
    id: "global-footer",
    zone: "footer",
    sponsor: SPONSORS.threecolts,
    sponsorPool: [SPONSORS.threecolts, SPONSORS.marketplacepulse],
    active: true,
    pages: ["all"],
    dismissible: false,
  },
  {
    id: "article-sidebar",
    zone: "sidebar",
    sponsor: SPONSORS.marginpro,
    sponsorPool: [SPONSORS.marginpro, SPONSORS.threecolts, SPONSORS.marketplacepulse],
    active: true,
    pages: ["article"],
    dismissible: false,
  },
  {
    id: "article-inline",
    zone: "inline",
    sponsor: SPONSORS.marginpro,
    sponsorPool: [SPONSORS.marginpro, SPONSORS.cedcommerce, SPONSORS.threecolts],
    active: true,
    pages: ["article"],
    dismissible: false,
  },
]

function scoreSponsor(sponsor: SponsorConfig, context?: SponsorContext): number {
  let score = 0
  const normalizedTopic = normalizeTopic(context?.topic)
  const normalizedAudiences = (context?.audiences || [])
    .map(normalizeAudience)
    .filter(Boolean) as SponsorAudience[]

  if (normalizedTopic) {
    if (sponsor.topics.includes(normalizedTopic)) score += 5
    if (sponsor.topics.includes("all")) score += 1
  }

  if (normalizedAudiences.length > 0) {
    const audienceMatches = normalizedAudiences.filter((audience) => sponsor.audiences.includes(audience)).length
    score += audienceMatches * 3
  }

  if (sponsor.moduleType === "partner-insight") score += 0.5

  return score
}

function selectSponsor(placement: AdPlacement, context?: SponsorContext): SponsorConfig {
  const pool = placement.sponsorPool && placement.sponsorPool.length > 0
    ? placement.sponsorPool
    : [placement.sponsor]

  return [...pool].sort((left, right) => scoreSponsor(right, context) - scoreSponsor(left, context))[0]
}

export function getActivePlacements(
  page: SponsorPage,
  zone?: SponsorZone,
  context?: SponsorContext
): AdPlacement[] {
  return AD_PLACEMENTS
    .filter((placement) =>
      placement.active &&
      (placement.pages.includes(page) || placement.pages.includes("all")) &&
      (!zone || placement.zone === zone)
    )
    .map((placement) => ({
      ...placement,
      sponsor: selectSponsor(placement, context),
    }))
}

export function getModuleTypeLabel(type: SponsorModuleType): string {
  return moduleTypeLabel(type)
}
