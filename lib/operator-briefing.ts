import type { ClassifiedArticle } from '@/lib/ai-classifier'
import { datedSummary, recentArticles } from '@/lib/news-freshness'

export function buildOperatorBriefing(input: ClassifiedArticle[], now = Date.now()) {
  const articles = recentArticles(input, 7, now).slice(0, 120)
  const top = articles.slice(0, 5)
  const counts = new Map<string, number>()
  for (const article of articles) counts.set(article.category, (counts.get(article.category) || 0) + 1)
  const date = (value: string) => new Date(value).toISOString().slice(0, 10)
  const clean = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    articles,
    briefing: {
      generatedAt: new Date(now).toISOString(),
      headline: 'Your marketplace operator briefing',
      dek: articles.length
        ? `A dated digest of ${articles.length} curated reports published in the past seven days. Newest coverage first; publication dates are not event deadlines.`
        : 'Recent coverage is unavailable in this snapshot. Check the archive and original sources; an empty feed does not mean nothing has changed.',
      sellerAlerts: articles.filter(a => a.impactLevel === 'high').slice(0, 4).map(a => `${date(a.publishedAt)} · ${a.title} — automated high-impact classification; verify scope and effective dates.`),
      actionItems: articles.length ? [
        'Check the original announcement for its effective date, geography, and eligibility before changing operations.',
        'Compare affected fees, fulfillment requirements, or advertising costs with your own order economics.',
        'Record the source, assumptions, and next review date for any decision prompted by this coverage.',
      ] : ['Browse the archive or return later for current source coverage.'],
      metrics: [
        { label: 'Reports in this snapshot', value: String(articles.length), detail: 'Curated, deduplicated coverage from the past seven days; up to 120 reports.' },
        { label: 'Sources represented', value: String(new Set(articles.map(a => a.sourceName)).size), detail: 'Distinct publisher names in this snapshot, not a measure of the whole market.' },
        { label: 'Newest report', value: articles[0] ? date(articles[0].publishedAt) : 'Unavailable', detail: 'Source publication date (UTC). Snapshot retrieval does not refresh a story’s age.' },
      ],
      signals: top.map(a => ({
        articleId: a.id, title: a.title,
        summary: datedSummary(clean(a.aiSummary || a.summary), a.publishedAt, now),
        whyItMatters: 'Decision prompt: confirm which of your channels, products, costs, or workflows this report affects before acting.',
        source: a.sourceName, publishedAt: a.publishedAt, platforms: a.platforms || [], impactLevel: a.impactLevel,
      })),
      categoryMix: [...counts.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([label,count]) => ({ label: label.replace(/_/g, ' '), count })),
    },
  }
}
