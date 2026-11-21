/**
 * Original operator analysis, published at /intelligence/analysis/[slug].
 *
 * Each article is lib/analysis/articles/<slug>.ts plus one registry line in
 * lib/analysis/registry/<slug>.ts. Published articles stay in their current
 * order. A new article is inserted by date. See CONTRIBUTING.md.
 *
 * Rules for every entry (enforced by review and lib/analysis.test.ts):
 * - Every figure is attributed in the same sentence to our own page or a linked public
 *   source listed in `sources`. Worked examples are labeled hypothetical.
 * - Forecasts are referenced by id and rendered from lib/forecasts.ts as dated calls with
 *   hit/miss status. Never add probabilities or odds.
 * - The Marketplace Pressure Index is named in full and its values are not published here.
 * - Inline links use [text](href); internal hrefs start with "/".
 */

export type { AnalysisArticle, AnalysisSection } from '@/lib/analysis/types'
import type { AnalysisArticle } from '@/lib/analysis/types'
export { ANALYSIS_ARTICLES } from '@/lib/analysis/load-articles'
import { ANALYSIS_ARTICLES } from '@/lib/analysis/load-articles'

/** Newest first by publish date (ties keep file order). */
export function latestAnalysis(limit = ANALYSIS_ARTICLES.length, articles: readonly AnalysisArticle[] = ANALYSIS_ARTICLES): AnalysisArticle[] {
  return articles.map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.publishedOn.localeCompare(x.a.publishedOn) || x.i - y.i)
    .slice(0, Math.max(0, limit))
    .map(({ a }) => a)
}

export function getAnalysis(slug: string): AnalysisArticle | undefined {
  return ANALYSIS_ARTICLES.find(a => a.slug === slug)
}

export type InlinePart = { text: string; href?: string }

/** Split "[label](href)" links out of a paragraph. Anything else stays plain text. */
export function parseInlineLinks(paragraph: string): InlinePart[] {
  const parts: InlinePart[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(paragraph))) {
    if (match.index > last) parts.push({ text: paragraph.slice(last, match.index) })
    parts.push({ text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < paragraph.length) parts.push({ text: paragraph.slice(last) })
  return parts
}
