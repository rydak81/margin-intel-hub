import type { ClassifiedArticle } from "@/lib/ai-classifier"
import { loadArticlesFromDB } from "@/lib/article-store"
import { callAIForJSON } from "@/lib/ai-client"
import { getSourceIntelligence } from "@/lib/source-intelligence"

export interface BriefingMetric {
  label: string
  value: string
  detail: string
}

export interface BriefingSignal {
  articleId: string
  title: string
  summary: string
  whyItMatters: string
  source: string
  platforms: string[]
  impactLevel?: "high" | "medium" | "low"
}

export interface DailyOperatorBriefing {
  generatedAt: string
  headline: string
  dek: string
  sellerAlerts: string[]
  actionItems: string[]
  metrics: BriefingMetric[]
  signals: BriefingSignal[]
  categoryMix: Array<{ label: string; count: number }>
}

let cachedBriefing: DailyOperatorBriefing | null = null
let cachedBriefingAt = 0
const BRIEFING_TTL = 15 * 60 * 1000

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildFallbackBriefing(articles: ClassifiedArticle[]): DailyOperatorBriefing {
  const topArticles = articles.slice(0, 5)
  const headline = topArticles[0]?.title || "Today’s marketplace operator brief"

  const categoryCounts = new Map<string, number>()
  for (const article of articles) {
    const key = article.category || "general"
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1)
  }

  const actionItems = Array.from(
    new Set(
      topArticles
        .map((article) => article.actionItem?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).slice(0, 4)

  const alerts = topArticles
    .filter((article) => article.isBreaking || article.impactLevel === "high")
    .map((article) => {
      const lane = getSourceIntelligence(article.sourceName, article.sourceType).label
      return `${article.title} (${lane})`
    })
    .slice(0, 4)

  const metrics: BriefingMetric[] = [
    {
      label: "High-impact signals",
      value: String(articles.filter((article) => article.impactLevel === "high").length),
      detail: "Stories with material seller, agency, or operator consequences.",
    },
    {
      label: "Platform updates",
      value: String(articles.filter((article) => article.category === "platform_updates").length),
      detail: "Official moves, fee changes, and rule shifts shaping operator workflows.",
    },
    {
      label: "Top source lane",
      value: getSourceIntelligence(topArticles[0]?.sourceName, topArticles[0]?.sourceType).label,
      detail: "Highest-ranked source among today’s top desk stories.",
    },
  ]

  return {
    generatedAt: new Date().toISOString(),
    headline,
    dek: "MarketplaceBeta’s daily operator briefing surfaces the highest-signal platform changes, seller pressure points, and action items worth acting on now.",
    sellerAlerts: alerts.length > 0 ? alerts : ["No major breaking alerts detected in the current desk window."],
    actionItems: actionItems.length > 0 ? actionItems : ["Review margin sensitivity and workflow exposure across your highest-volume channels this week."],
    metrics,
    signals: topArticles.map((article) => ({
      articleId: article.id,
      title: article.title,
      summary: article.aiSummary || article.summary,
      whyItMatters: article.impactDetail || article.actionItem || "This signal is worth reviewing because it can affect operator workflow, profitability, or platform risk.",
      source: article.sourceName,
      platforms: article.platforms || [],
      impactLevel: article.impactLevel,
    })),
    categoryMix: [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label: formatCategory(label), count })),
  }
}

async function buildAIBriefing(articles: ClassifiedArticle[]): Promise<DailyOperatorBriefing | null> {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return null
  }

  const sample = articles.slice(0, 8).map((article, index) => ({
    index: index + 1,
    id: article.id,
    title: article.title,
    source: article.sourceName,
    category: article.category,
    platforms: article.platforms,
    impactLevel: article.impactLevel,
    summary: article.aiSummary || article.summary,
    impactDetail: article.impactDetail,
    actionItem: article.actionItem,
    keyStat: article.keyStat,
  }))

  try {
    const { data } = await callAIForJSON<{
      headline: string
      dek: string
      sellerAlerts: string[]
      actionItems: string[]
      metrics: BriefingMetric[]
      signals: Array<{
        articleId: string
        title: string
        summary: string
        whyItMatters: string
      }>
    }>({
      systemPrompt: "You are the lead editor for MarketplaceBeta. Turn marketplace news inputs into a concise but high-signal daily operator briefing for experienced sellers, agencies, and marketplace software teams. Stay specific, action-oriented, and data-aware. Return JSON only.",
      prompt: `Build a MarketplaceBeta daily operator briefing from this article set.

Requirements:
- Write like an operator intelligence desk, not a general news recap.
- Prioritize platform changes, margin pressure, seller ops, logistics, ad shifts, and measurable marketplace trends.
- sellerAlerts: 3 to 4 urgent risk/change bullets.
- actionItems: 3 to 4 specific next steps.
- metrics: exactly 3 short data cards using available counts or key stats when possible.
- signals: exactly 4 top signals tied to the provided article ids.
- Avoid generic phrases like "stay informed."

Article inputs:
${JSON.stringify(sample, null, 2)}

Return JSON with this shape:
{
  "headline": "string",
  "dek": "string",
  "sellerAlerts": ["string"],
  "actionItems": ["string"],
  "metrics": [{ "label": "string", "value": "string", "detail": "string" }],
  "signals": [
    { "articleId": "string", "title": "string", "summary": "string", "whyItMatters": "string" }
  ]
}`,
      maxTokens: 1800,
    })

    const categoryCounts = new Map<string, number>()
    for (const article of articles) {
      const key = article.category || "general"
      categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1)
    }

    return {
      generatedAt: new Date().toISOString(),
      headline: data.headline,
      dek: data.dek,
      sellerAlerts: data.sellerAlerts.slice(0, 4),
      actionItems: data.actionItems.slice(0, 4),
      metrics: data.metrics.slice(0, 3),
      signals: data.signals.slice(0, 4).map((signal) => {
        const sourceArticle = articles.find((article) => article.id === signal.articleId)
        return {
          articleId: signal.articleId,
          title: signal.title,
          summary: signal.summary,
          whyItMatters: signal.whyItMatters,
          source: sourceArticle?.sourceName || "MarketplaceBeta",
          platforms: sourceArticle?.platforms || [],
          impactLevel: sourceArticle?.impactLevel,
        }
      }),
      categoryMix: [...categoryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label: formatCategory(label), count })),
    }
  } catch (error) {
    console.warn("[news-briefing] AI briefing failed:", error)
    return null
  }
}

export async function getDailyOperatorBriefing(): Promise<{
  briefing: DailyOperatorBriefing
  articles: ClassifiedArticle[]
}> {
  const articles = await loadArticlesFromDB({ limit: 24 })

  if (cachedBriefing && Date.now() - cachedBriefingAt < BRIEFING_TTL) {
    return { briefing: cachedBriefing, articles }
  }

  const aiBriefing = await buildAIBriefing(articles)
  const briefing = aiBriefing || buildFallbackBriefing(articles)

  cachedBriefing = briefing
  cachedBriefingAt = Date.now()

  return { briefing, articles }
}
