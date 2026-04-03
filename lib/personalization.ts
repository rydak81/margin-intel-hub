import type { NewsArticle } from "@/lib/homepage-data"

export interface UserPreferenceProfile {
  role?: string
  preferredPlatforms: string[]
  preferredTopics: string[]
  digestMode?: string
}

const PLATFORM_ALIASES: Record<string, string> = {
  amazon: "amazon",
  walmart: "walmart",
  "target+": "target+",
  targetplus: "target+",
  shopify: "shopify",
  "tiktok shop": "tiktok shop",
  tiktokshop: "tiktok shop",
  ebay: "ebay",
  "multi-platform": "multi-platform",
}

const TOPIC_TO_CATEGORY: Record<string, string[]> = {
  "fees & reimbursement": ["profitability", "platform"],
  "platform policy": ["platform"],
  profitability: ["profitability"],
  advertising: ["advertising"],
  logistics: ["logistics"],
  "tools & saas": ["tools"],
  "m&a / partnerships": ["deals"],
  "market trends": ["market"],
}

const TOPIC_TO_DESK_CATEGORY: Record<string, string[]> = {
  "fees & reimbursement": ["profitability", "compliance_policy"],
  "platform policy": ["platform_updates", "compliance_policy"],
  profitability: ["profitability"],
  advertising: ["advertising"],
  logistics: ["logistics"],
  "tools & saas": ["tools_technology"],
  "m&a / partnerships": ["mergers_acquisitions"],
  "market trends": ["market_metrics"],
}

const ROLE_TO_AUDIENCE: Record<string, string[]> = {
  brand_seller: ["brand", "seller"],
  agency: ["agency"],
  saas_tech: ["saas", "tech"],
  service_provider: ["service_provider", "partner"],
  investor: ["investor"],
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, " ").trim()
}

function normalizePlatform(value: string): string {
  const normalized = normalize(value)
  return PLATFORM_ALIASES[normalized] || normalized
}

export function buildUserPreferenceProfile(metadata: Record<string, any> | null | undefined): UserPreferenceProfile {
  return {
    role: typeof metadata?.role === "string" ? metadata.role : undefined,
    preferredPlatforms: Array.isArray(metadata?.preferred_platforms)
      ? metadata.preferred_platforms.map((value: string) => normalizePlatform(value))
      : [],
    preferredTopics: Array.isArray(metadata?.preferred_topics)
      ? metadata.preferred_topics.map((value: string) => normalize(value))
      : [],
    digestMode: typeof metadata?.digest_mode === "string" ? metadata.digest_mode : undefined,
  }
}

export function getAudiencePreferenceTags(profile: UserPreferenceProfile): string[] {
  if (!profile.role) return []
  return ROLE_TO_AUDIENCE[profile.role] || []
}

export function getPreferredCategories(profile: UserPreferenceProfile): string[] {
  return [...new Set(profile.preferredTopics.flatMap((topic) => TOPIC_TO_CATEGORY[topic] || []))]
}

export function scoreArticleForPreferences(article: NewsArticle, profile: UserPreferenceProfile): number {
  if (!profile.preferredPlatforms.length && !profile.preferredTopics.length && !profile.role) return 0

  let score = 0
  const articlePlatforms = (article.platforms || []).map(normalizePlatform)
  const preferredCategories = getPreferredCategories(profile)
  const preferredAudience = getAudiencePreferenceTags(profile)
  const articleAudience = (article.audience || []).map(normalize)

  if (profile.preferredPlatforms.length > 0) {
    const matches = profile.preferredPlatforms.filter((platform) => articlePlatforms.includes(platform))
    score += matches.length * 20

    if (profile.preferredPlatforms.includes("multi-platform") && articlePlatforms.length > 1) {
      score += 12
    }
  }

  if (preferredCategories.length > 0 && preferredCategories.includes(article.category)) {
    score += 16
  }

  if (preferredAudience.length > 0) {
    const audienceMatches = preferredAudience.filter((audience) => articleAudience.includes(audience))
    score += audienceMatches.length * 10
  }

  if (article.impactLevel === "high") score += 6
  if (article.breaking) score += 4
  if (article.featured) score += 3

  return score
}

export function personalizeArticles<T extends NewsArticle>(articles: T[], profile: UserPreferenceProfile): T[] {
  if (!profile.preferredPlatforms.length && !profile.preferredTopics.length && !profile.role) {
    return articles
  }

  return [...articles].sort((a, b) => {
    const scoreB = scoreArticleForPreferences(b, profile)
    const scoreA = scoreArticleForPreferences(a, profile)
    if (scoreB !== scoreA) return scoreB - scoreA
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export function getPersonalizedDigestArticles<T extends NewsArticle>(
  articles: T[],
  profile: UserPreferenceProfile,
  limit = 3
): T[] {
  return personalizeArticles(articles, profile).slice(0, limit)
}

export function getPersonalizationLabel(profile: UserPreferenceProfile): string | null {
  const preferredPlatform = profile.preferredPlatforms[0]
  const preferredTopic = profile.preferredTopics[0]

  if (preferredPlatform && preferredTopic) {
    return `Tailored toward ${preferredPlatform} and ${preferredTopic}`
  }
  if (preferredPlatform) {
    return `Tailored toward ${preferredPlatform}`
  }
  if (preferredTopic) {
    return `Tailored toward ${preferredTopic}`
  }
  if (profile.role) {
    return `Tailored for ${normalize(profile.role)} teams`
  }
  return null
}

export function getNewsDeskDefaults(profile: UserPreferenceProfile): {
  platforms: string[]
  category: string | null
  audience: string | null
} {
  const preferredAudience = getAudiencePreferenceTags(profile)
  const preferredCategories = [
    ...new Set(profile.preferredTopics.flatMap((topic) => TOPIC_TO_DESK_CATEGORY[topic] || [])),
  ]

  return {
    platforms: profile.preferredPlatforms.filter((platform) => platform !== "multi-platform"),
    category: preferredCategories[0] || null,
    audience: preferredAudience[0] || null,
  }
}
