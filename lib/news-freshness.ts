/** Publication time is evidence age, never an inferred event/effective date. */
export function recentArticles<T extends { publishedAt: string }>(articles: T[], days: number, now = Date.now()): T[] {
  return articles.filter(article => {
    const published = Date.parse(article.publishedAt)
    return Number.isFinite(published) && published <= now && published >= now - days * 86400000
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
export function datedSummary(summary: string, publishedAt: string, now = Date.now()): string {
  const date = Date.parse(publishedAt)
  if (!Number.isFinite(date)) return 'Publication date unavailable. Check the original report before acting.'
  const relative = /\b(today|tonight|tomorrow|yesterday|currently|now|this week|next week|upcoming)\b/i
  if (now - date > 36 * 3600000 && relative.test(summary)) {
    return `This report was published on ${new Date(date).toISOString().slice(0, 10)}. Its time-sensitive summary is withheld; check the original report for event dates and current status.`
  }
  return summary
}
