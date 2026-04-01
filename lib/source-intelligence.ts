export type SourceLane =
  | "official_platform"
  | "community_pulse"
  | "seller_community"
  | "analyst_intelligence"
  | "operator_tactics"
  | "industry_context"

export interface SourceIntelligence {
  lane: SourceLane
  label: string
  description: string
  operatorWeight: number
}

function normalizeSource(sourceName?: string, sourceType?: string) {
  return `${sourceName || ""} ${sourceType || ""}`.toLowerCase()
}

export function getSourceIntelligence(sourceName?: string, sourceType?: string): SourceIntelligence {
  const normalized = normalizeSource(sourceName, sourceType)

  if (normalized.includes("community pulse")) {
    return {
      lane: "community_pulse",
      label: "Operator Pulse",
      description: "MarketplaceBeta synthesis of live seller and operator discussions across the ecosystem.",
      operatorWeight: 18,
    }
  }

  if (
    normalized.includes("amazon seller central") ||
    normalized.includes("about amazon") ||
    normalized.includes("walmart corporate") ||
    normalized.includes("walmart marketplace learn") ||
    normalized.includes("shopify blog") ||
    normalized.includes("tiktok shop")
  ) {
    return {
      lane: "official_platform",
      label: "Official Platform Update",
      description: "Direct platform communication. Highest-value for policy, product, and operational changes.",
      operatorWeight: 16,
    }
  }

  if (normalized.includes("shopify developer changelog")) {
    return {
      lane: "official_platform",
      label: "Technical Platform Update",
      description: "Official but usually technical. Useful only when the change affects merchant-facing operations.",
      operatorWeight: 3,
    }
  }

  if (
    normalized.includes("marketplace pulse") ||
    normalized.includes("digital commerce 360") ||
    normalized.includes("internet retailer")
  ) {
    return {
      lane: "analyst_intelligence",
      label: "Analyst Intelligence",
      description: "Research or editorial analysis that adds market context beyond the official announcement.",
      operatorWeight: 12,
    }
  }

  if (
    normalized.includes("ecommerce bytes") ||
    normalized.includes("seller forums") ||
    normalized.includes("shopify community") ||
    normalized.includes("ebay community") ||
    normalized.includes("reddit") ||
    normalized.includes("forum")
  ) {
    return {
      lane: "seller_community",
      label: "Seller Community Signal",
      description: "Useful for seeing what operators are actually asking, testing, or struggling with right now.",
      operatorWeight: 10,
    }
  }

  if (
    normalized.includes("practical commerce") ||
    normalized.includes("seller snap") ||
    normalized.includes("ecomcrew")
  ) {
    return {
      lane: "operator_tactics",
      label: "Operator Tactics",
      description: "Tactical content that tends to be strongest when tied to workflow, process, or execution.",
      operatorWeight: 8,
    }
  }

  return {
    lane: "industry_context",
    label: "Industry Context",
    description: "Useful background context, but lower-priority than direct platform, community, or operator intelligence.",
    operatorWeight: 4,
  }
}

export function getArticleDeskScore(article: {
  relevanceScore?: number
  relevance_score?: number
  impactLevel?: string
  impact_level?: string
  isBreaking?: boolean
  is_breaking?: boolean
  sourceName?: string
  source_name?: string
  sourceType?: string
  source_type?: string
  publishedAt?: string
  published_at?: string
  category?: string
}): number {
  const relevance = Number(article.relevanceScore ?? article.relevance_score ?? 0)
  const impact = article.impactLevel ?? article.impact_level
  const impactBonus = impact === "high" ? 28 : impact === "medium" ? 14 : 0
  const breakingBonus = article.isBreaking || article.is_breaking ? 20 : 0
  const sourceBonus = getSourceIntelligence(
    article.sourceName ?? article.source_name,
    article.sourceType ?? article.source_type
  ).operatorWeight
  const publishedAt = article.publishedAt ?? article.published_at
  const ageHours = publishedAt
    ? Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60))
    : 48
  const freshnessBonus = Math.max(0, 18 - ageHours * 0.6)
  const categoryBonus =
    article.category === "platform_updates" || article.category === "compliance_policy"
      ? 8
      : article.category === "profitability" || article.category === "market_metrics"
        ? 6
        : article.category === "logistics" || article.category === "advertising"
          ? 4
          : 0

  return relevance + impactBonus + breakingBonus + sourceBonus + freshnessBonus + categoryBonus
}
