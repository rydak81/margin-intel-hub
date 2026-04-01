import { createAdminClient } from "@/lib/supabase/admin"

export interface CommunityTopicSignal {
  id: string
  title: string
  bodySnippet: string
  sourcePlatform: string
  upvotes: number
  commentCount: number
  sentiment: string | null
  themeTags: string[]
  publishedAt: string
}

export interface SellerPulseArticlePreview {
  id: string
  title: string
  summary: string
  themes: string[]
  topicCount: number
  sentimentSummary: string
  publishedAt: string
}

const STOP_WORDS = new Set([
  "about", "after", "agency", "against", "amazon", "brand", "commerce", "could",
  "every", "from", "have", "into", "marketplace", "more", "news", "operator",
  "platform", "seller", "should", "that", "their", "there", "these", "this",
  "what", "when", "with", "would",
])

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token))
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}

function scoreTopic(topic: CommunityTopicSignal, keywords: string[]) {
  const haystack = [
    topic.title,
    topic.bodySnippet,
    topic.sourcePlatform,
    ...(topic.themeTags || []),
  ].join(" ").toLowerCase()

  const matchScore = keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 4 : 0), 0)
  const sentimentBonus =
    topic.sentiment === "warning" || topic.sentiment === "frustrated"
      ? 4
      : topic.sentiment === "celebratory"
        ? 2
        : 0

  return matchScore + Math.min(topic.upvotes / 12, 8) + Math.min(topic.commentCount / 8, 6) + sentimentBonus
}

export async function getRelevantCommunityTopics(
  article: { title: string; category?: string; platforms?: string[] },
  limit = 3
): Promise<CommunityTopicSignal[]> {
  if (!hasSupabaseConfig()) return []

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("community_topics")
      .select("id,title,body_snippet,source_platform,upvotes,comment_count,sentiment,theme_tags,published_at")
      .eq("processed", true)
      .gte("relevance_score", 45)
      .gte("published_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("upvotes", { ascending: false })
      .limit(60)

    if (error || !data?.length) return []

    const keywords = unique([
      ...(article.platforms || []).map((platform) => platform.toLowerCase()),
      ...tokenize(article.category || ""),
      ...tokenize(article.title).slice(0, 6),
    ])

    const topics = (data || [])
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        bodySnippet: topic.body_snippet || "",
        sourcePlatform: topic.source_platform,
        upvotes: topic.upvotes || 0,
        commentCount: topic.comment_count || 0,
        sentiment: topic.sentiment || null,
        themeTags: topic.theme_tags || [],
        publishedAt: topic.published_at,
      }))
      .map((topic) => ({ ...topic, score: scoreTopic(topic, keywords) }))
      .filter((topic) => topic.score > 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return topics.map(({ score: _score, ...topic }) => topic)
  } catch {
    return []
  }
}

export async function getLatestPulseArticles(limit = 6): Promise<SellerPulseArticlePreview[]> {
  if (!hasSupabaseConfig()) return []

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("seller_pulse_articles")
      .select("id,title,summary,themes,topic_count,sentiment_summary,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error || !data?.length) return []

    return data.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary || "",
      themes: article.themes || [],
      topicCount: article.topic_count || 0,
      sentimentSummary: article.sentiment_summary || "",
      publishedAt: article.published_at,
    }))
  } catch {
    return []
  }
}

export async function getCommunitySnapshot() {
  if (!hasSupabaseConfig()) {
    return {
      topThemes: [] as Array<{ theme: string; count: number }>,
      topPlatforms: [] as Array<{ platform: string; count: number }>,
      hotTopics: [] as CommunityTopicSignal[],
    }
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("community_topics")
      .select("id,title,body_snippet,source_platform,upvotes,comment_count,sentiment,theme_tags,published_at")
      .eq("processed", true)
      .gte("relevance_score", 45)
      .gte("published_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("upvotes", { ascending: false })
      .limit(80)

    if (error || !data?.length) {
      return {
        topThemes: [] as Array<{ theme: string; count: number }>,
        topPlatforms: [] as Array<{ platform: string; count: number }>,
        hotTopics: [] as CommunityTopicSignal[],
      }
    }

    const themeCounts: Record<string, number> = {}
    const platformCounts: Record<string, number> = {}

    const hotTopics: CommunityTopicSignal[] = data.slice(0, 6).map((topic) => ({
      id: topic.id,
      title: topic.title,
      bodySnippet: topic.body_snippet || "",
      sourcePlatform: topic.source_platform,
      upvotes: topic.upvotes || 0,
      commentCount: topic.comment_count || 0,
      sentiment: topic.sentiment || null,
      themeTags: topic.theme_tags || [],
      publishedAt: topic.published_at,
    }))

    data.forEach((topic) => {
      const platform = String(topic.source_platform || "").replace(/_/g, " ")
      if (platform) {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1
      }
      ;(topic.theme_tags || []).forEach((theme: string) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
      })
    })

    return {
      topThemes: Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([theme, count]) => ({ theme, count })),
      topPlatforms: Object.entries(platformCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([platform, count]) => ({ platform, count })),
      hotTopics,
    }
  } catch {
    return {
      topThemes: [] as Array<{ theme: string; count: number }>,
      topPlatforms: [] as Array<{ platform: string; count: number }>,
      hotTopics: [] as CommunityTopicSignal[],
    }
  }
}
