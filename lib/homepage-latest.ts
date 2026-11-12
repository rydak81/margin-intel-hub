import { latestAnalysis, type AnalysisArticle } from '@/lib/analysis'

/** Homepage shows the newest handful. A new analysis entry appears here with no manual edit. */
export const HOMEPAGE_LATEST_ANALYSIS_COUNT = 4

export interface HomepageAnalysisCard {
  slug: string
  title: string
  /** ISO publish date, YYYY-MM-DD. */
  date: string
  /** Preformatted publish date so the client does not re-locale it. */
  dateLabel: string
  summary: string
  href: string
}

function formatAnalysisDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Newest analysis entries for the homepage.
 * Ordered by publish date, newest first. Same-day entries keep file order.
 * Title, date, and summary come from the article's headline, publishedOn, and dek.
 */
export function homepageLatestAnalysis(
  limit = HOMEPAGE_LATEST_ANALYSIS_COUNT,
  articles?: readonly AnalysisArticle[],
): HomepageAnalysisCard[] {
  const picked = articles === undefined ? latestAnalysis(limit) : latestAnalysis(limit, articles)
  return picked.map(article => ({
    slug: article.slug,
    title: article.headline,
    date: article.publishedOn,
    dateLabel: formatAnalysisDate(article.publishedOn),
    summary: article.dek,
    href: `/intelligence/analysis/${article.slug}`,
  }))
}
