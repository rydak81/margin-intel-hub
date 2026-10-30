/**
 * Internal "Related" links between fee pages and analysis articles.
 *
 * Matching is computed at build time from lib/analysis.ts and the marketplace fee
 * tables in lib/marketplace-fees.ts, so the links render as plain server-side <a> tags.
 *
 * An article covers a marketplace when any of these hold:
 * - the marketplace's name or short name appears in the article's framing
 *   (SEO title, headline, dek, meta description, takeaway or tags), or
 * - it appears at least twice in the body (section titles, paragraphs, bullets,
 *   table cells), or
 * - the body links to that marketplace's fee pages (/fees/<slug> or /fees/<slug>/...).
 *
 * Names match as whole words, case-insensitive, so "eBay's" counts but a name
 * embedded in a longer word does not. Link URLs are stripped before name
 * matching, so a URL like ebay.com/help in an inline link never counts on its own.
 */
import { latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { MARKETPLACES, type Marketplace, type MarketplaceSlug } from '@/lib/marketplace-fees'
import { FEE_BY_PRICE_PATH, FEE_BY_PRICE_TITLE } from '@/lib/fee-by-price'

export const RELATED_FEE_COMPARE = { href: FEE_BY_PRICE_PATH, label: FEE_BY_PRICE_TITLE }
export const RELATED_ANALYSIS_LIMIT = 3
/** A body-only mention must appear at least this many times to count. */
export const BODY_MENTION_THRESHOLD = 2

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Whole-word, case-insensitive pattern for every name a marketplace goes by. */
export function marketplacePattern(m: Pick<Marketplace, 'name' | 'shortName'>): RegExp {
  const names = [...new Set([m.name, m.shortName])].sort((a, b) => b.length - a.length)
  return new RegExp(`(?<![A-Za-z0-9])(?:${names.map(escape).join('|')})(?![A-Za-z0-9])`, 'gi')
}

export function countMentions(text: string, m: Pick<Marketplace, 'name' | 'shortName'>): number {
  return (text.match(marketplacePattern(m)) ?? []).length
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g
/** Replace "[label](href)" with just the label. */
const stripLinks = (s: string) => s.replace(LINK_RE, '$1')
const linkHrefs = (s: string) => [...s.matchAll(LINK_RE)].map(x => x[2])

type ArticleText = Pick<AnalysisArticle, 'seoTitle' | 'headline' | 'dek' | 'metaDescription' | 'takeaway' | 'tags' | 'sections'>

function articleBody(a: ArticleText): string[] {
  return a.sections.flatMap(s => [
    s.title,
    ...s.paragraphs,
    ...(s.bullets ?? []),
    ...(s.table ? [s.table.caption, ...s.table.headings, ...s.table.rows.flat()] : []),
  ])
}

/** Marketplaces an article covers, in fee-table order. Deterministic. */
export function analysisMarketplaces(a: ArticleText, marketplaces: readonly Marketplace[] = MARKETPLACES): Marketplace[] {
  const framing = [a.seoTitle, a.headline, a.dek, a.metaDescription, a.takeaway, ...a.tags].map(stripLinks).join('\n')
  const bodyParts = articleBody(a)
  const body = bodyParts.map(stripLinks).join('\n')
  const hrefs = bodyParts.flatMap(linkHrefs)
  return marketplaces.filter(m =>
    countMentions(framing, m) > 0 ||
    countMentions(body, m) >= BODY_MENTION_THRESHOLD ||
    hrefs.some(h => h === `/fees/${m.slug}` || h.startsWith(`/fees/${m.slug}/`) || h.startsWith(`/fees/${m.slug}#`)),
  )
}

/** Up to `limit` most recent analysis articles covering a marketplace (newest first). */
export function relatedAnalysisForMarketplace(slug: MarketplaceSlug, limit = RELATED_ANALYSIS_LIMIT, articles: AnalysisArticle[] = latestAnalysis()): AnalysisArticle[] {
  return articles.filter(a => analysisMarketplaces(a).some(m => m.slug === slug)).slice(0, limit)
}
