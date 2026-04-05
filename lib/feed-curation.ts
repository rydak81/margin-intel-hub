import type { ClassifiedArticle } from "@/lib/ai-classifier"
import { getArticleDeskScore, getSourceIntelligence } from "@/lib/source-intelligence"

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "for", "from", "how", "in", "into",
  "is", "it", "its", "of", "on", "or", "that", "the", "their", "this", "to", "with",
  "why", "what", "after", "before", "amid", "over", "under", "new", "latest", "today",
  "seller", "sellers", "marketplace", "marketplaces", "commerce", "ecommerce",
  "e-commerce", "operator", "operators", "update", "updates", "news", "report", "briefing",
])

type CuratableArticle = Pick<
  ClassifiedArticle,
  | "id"
  | "title"
  | "category"
  | "platforms"
  | "publishedAt"
  | "sourceName"
  | "sourceType"
  | "relevanceScore"
  | "impactLevel"
  | "isBreaking"
>

interface CurateOptions {
  limit?: number
  maxPerTopic?: number
}

interface TopicCluster<T extends CuratableArticle> {
  signature: string
  articles: T[]
}

function normalizeTitle(title: string): string {
  return title
    .replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+\|\s+.+$/g, "")
    .replace(/\s+-\s+[^-]{2,80}$/g, "")
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/gi, " ")
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi, " ")
    .replace(/\b\d{1,2}:\d{2}\b/g, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/\b\d+(?:\.\d+)?%\b/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function getKeywordTokens(title: string): string[] {
  return normalizeTitle(title)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function getTopicSignature(article: CuratableArticle): string {
  const topTokens = [...new Set(getKeywordTokens(article.title))].slice(0, 5)
  const category = article.category || "general"
  const platforms = [...(article.platforms || [])].sort().slice(0, 2).join("-") || "multi"
  return `${category}:${platforms}:${topTokens.join("-")}`
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size === 0 || setB.size === 0) return 0

  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection += 1
  }

  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

function areTopicMatches(a: CuratableArticle, b: CuratableArticle): boolean {
  if (a.id === b.id) return true

  const categoryMatch = (a.category || "general") === (b.category || "general")
  const platformOverlap = (a.platforms || []).filter((platform) => (b.platforms || []).includes(platform)).length
  const titleA = normalizeTitle(a.title)
  const titleB = normalizeTitle(b.title)

  if (titleA && titleA === titleB) return true
  if (titleA && titleB && (titleA.includes(titleB) || titleB.includes(titleA))) return true

  const tokensA = getKeywordTokens(a.title)
  const tokensB = getKeywordTokens(b.title)
  const similarity = jaccardSimilarity(tokensA, tokensB)

  if (similarity >= 0.72) return true
  if (similarity >= 0.56 && (categoryMatch || platformOverlap > 0)) return true

  const sharedDistinctiveTokens = tokensA.filter((token) => tokensB.includes(token))
  return sharedDistinctiveTokens.length >= 4 && (categoryMatch || platformOverlap > 0)
}

function compareWithinTopic<T extends CuratableArticle>(a: T, b: T) {
  const scoreDiff = getArticleDeskScore(b) - getArticleDeskScore(a)
  if (scoreDiff !== 0) return scoreDiff

  const laneDiff =
    getSourceIntelligence(b.sourceName, b.sourceType).operatorWeight -
    getSourceIntelligence(a.sourceName, a.sourceType).operatorWeight
  if (laneDiff !== 0) return laneDiff

  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
}

function clusterArticles<T extends CuratableArticle>(articles: T[]): Array<TopicCluster<T>> {
  const clusters: Array<TopicCluster<T>> = []

  for (const article of [...articles].sort(compareWithinTopic)) {
    const existingCluster = clusters.find((cluster) =>
      cluster.articles.some((clusterArticle) => areTopicMatches(article, clusterArticle))
    )

    if (existingCluster) {
      existingCluster.articles.push(article)
      existingCluster.articles.sort(compareWithinTopic)
    } else {
      clusters.push({
        signature: getTopicSignature(article),
        articles: [article],
      })
    }
  }

  return clusters
}

function limitTopicCluster<T extends CuratableArticle>(cluster: TopicCluster<T>, maxPerTopic: number): T[] {
  const kept: T[] = []
  const seenLanes = new Set<string>()

  for (const article of cluster.articles) {
    if (kept.length >= maxPerTopic) break
    const lane = getSourceIntelligence(article.sourceName, article.sourceType).lane

    if (!seenLanes.has(lane) || kept.length === 0) {
      kept.push(article)
      seenLanes.add(lane)
    }
  }

  for (const article of cluster.articles) {
    if (kept.length >= maxPerTopic) break
    if (!kept.some((keptArticle) => keptArticle.id === article.id)) {
      kept.push(article)
    }
  }

  return kept
}

export function curateArticleFeed<T extends CuratableArticle>(
  articles: T[],
  options: CurateOptions = {}
): T[] {
  const maxPerTopic = options.maxPerTopic ?? 2
  const topicClusters = clusterArticles(articles)

  const curated = topicClusters
    .flatMap((cluster) => limitTopicCluster(cluster, maxPerTopic))
    .sort(compareWithinTopic)

  if (options.limit) {
    return curated.slice(0, options.limit)
  }

  return curated
}

export function getTopicClusterCount<T extends CuratableArticle>(articles: T[]): number {
  return clusterArticles(articles).length
}
