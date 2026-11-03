import type { IntelligenceArticle } from '@/lib/intelligence'

const AI_TERMS = /\b(ai|artificial intelligence|generative|llms?|chatgpt|claude|agentic|rufus)\b|\bshopify\s+(magic|sidekick)\b/i
const COMMERCE_TERMS = /\b(e-?commerce|marketplaces?|sellers?|retail(?:ers?)?|merchants?|shopping|shopify|product listings?|customer support|inventory|fulfill?ment|advertising)\b/i

/** Conservative, transparent keyword selection over the existing curated archive. */
export function selectAiCommerceNews(articles: IntelligenceArticle[], now: number, limit = 6) {
  const seen = new Set<string>()
  return articles.filter(article => {
    const date = Date.parse(article.publishedAt)
    const text = `${article.title} ${article.summary}`
    if (!Number.isFinite(date) || date > now || date < now - 30 * 86400000) return false
    return AI_TERMS.test(text) && COMMERCE_TERMS.test(text)
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).filter(article => {
    const key = article.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, limit)
}
