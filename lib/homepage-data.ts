import type { ClassifiedArticle } from "@/lib/ai-classifier"
import { getArticleImageUrl, isGoodArticleImage } from "@/lib/article-images"
import { loadArticlesFromDB } from "@/lib/article-store"

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  fullContent?: string
  category: string
  source: string
  sourceUrl: string
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  featured: boolean
  breaking: boolean
  imageUrl?: string
  hasRealImage?: boolean
  platforms?: string[]
  tier?: number
  sourceType?: "industry" | "google"
  audience?: string[]
  impactLevel?: "high" | "medium" | "low"
  impactDetail?: string
  actionItem?: string
  keyStat?: string | null
  aiSummary?: string
  ourTake?: string
  whatThisMeans?: string
  keyTakeaways?: string[]
  relatedContext?: string
  bottomLine?: string
}

export interface BreakingNews {
  id: string
  title: string
  timestamp: string
  urgent: boolean
}

type HomepageArticleSource = Partial<ClassifiedArticle> & {
  id: string
  title: string
  publishedAt: string
  summary?: string
  sourceName?: string
  sourceUrl?: string
}

export function createFallbackBreakingNews(): BreakingNews[] {
  const now = new Date().toISOString()

  return [
    {
      id: "1",
      title: "Amazon announces Q2 FBA fee structure changes effective April 2026",
      timestamp: now,
      urgent: true,
    },
    {
      id: "2",
      title: "TikTok Shop US GMV surpasses $10B milestone in Q1",
      timestamp: now,
      urgent: true,
    },
    {
      id: "3",
      title: "New tariff regulations impact cross-border sellers starting May 1",
      timestamp: now,
      urgent: false,
    },
  ]
}

export function mapAICategory(aiCategory: string | undefined): string {
  const mapping: Record<string, string> = {
    platform_updates: "platform",
    market_metrics: "market",
    tools_technology: "tools",
    mergers_acquisitions: "deals",
    breaking: "breaking",
    profitability: "profitability",
    advertising: "advertising",
    logistics: "logistics",
    events: "events",
    tactics: "tactics",
    compliance_policy: "platform",
    seller_tools: "tools",
    market_trends: "market",
    consumer_trends: "market",
    policy_regulatory: "platform",
    logistics_supply_chain: "logistics",
    advertising_marketing: "advertising",
    ai_technology: "tools",
    international: "market",
    ma_deal_flow: "deals",
    seller_profitability: "profitability",
    "platform-updates": "platform",
    "seller-operations": "logistics",
    "market-trends": "market",
    "tools-technology": "tools",
    "compliance-policy": "platform",
    "strategy-tactics": "tactics",
    "mergers-acquisitions": "deals",
    ecommerce: "platform",
    amazon: "platform",
    industry: "market",
    "other-marketplaces": "platform",
    irrelevant: "market",
  }

  return mapping[aiCategory || ""] || "market"
}

export function toNewsArticle(article: HomepageArticleSource): NewsArticle {
  const summary = article.summary || ""
  const aiSummary = article.aiSummary || summary
  const resolvedCategory = mapAICategory(article.category)
  const resolvedImageUrl = getArticleImageUrl(
    article.imageUrl,
    article.title,
    article.category || resolvedCategory,
    article.platforms || [],
    article.fullContent
  )

  return {
    id: article.id,
    title: article.title,
    excerpt: aiSummary,
    fullContent: article.fullContent || summary,
    category: resolvedCategory,
    source: article.sourceName || "MarketplaceBeta",
    sourceUrl: article.sourceUrl || "",
    author: article.sourceName || "MarketplaceBeta",
    publishedAt: article.publishedAt,
    readTime: Math.ceil(((summary || aiSummary).length || 200) / 200),
    tags: [],
    featured: (article.relevanceScore || 0) >= 80,
    breaking: Boolean(article.isBreaking || ((article.relevanceScore || 0) >= 90 && article.tier === 1)),
    imageUrl: resolvedImageUrl,
    hasRealImage: isGoodArticleImage(article.imageUrl),
    platforms: article.platforms || [],
    tier: article.tier,
    sourceType: article.sourceType,
    audience: article.audience || [],
    impactLevel: article.impactLevel || "medium",
    impactDetail: article.impactDetail || "",
    actionItem: article.actionItem || "",
    keyStat: article.keyStat || null,
    aiSummary,
    ourTake: article.ourTake || "",
    whatThisMeans: article.whatThisMeans || "",
    keyTakeaways: article.keyTakeaways || [],
    relatedContext: article.relatedContext || "",
    bottomLine: article.bottomLine || "",
  }
}

export function buildBreakingNews(articles: NewsArticle[]): BreakingNews[] {
  const breaking = articles
    .filter((article) => article.breaking || article.featured)
    .slice(0, 5)
    .map((article) => ({
      id: article.id,
      title: article.title,
      timestamp: article.publishedAt,
      urgent: article.breaking,
    }))

  return breaking.length > 0 ? breaking : createFallbackBreakingNews()
}

export async function loadHomepageData(limit = 50): Promise<{
  initialArticles: NewsArticle[]
  initialBreakingNews: BreakingNews[]
}> {
  const articles = await loadArticlesFromDB({ limit })
  const initialArticles = articles.map(toNewsArticle)

  return {
    initialArticles,
    initialBreakingNews: buildBreakingNews(initialArticles),
  }
}
