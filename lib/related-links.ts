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
import { latestAnalysis, parseInlineLinks, type AnalysisArticle } from '@/lib/analysis'
import { briefCtaSource } from '@/lib/brief-cta'
import { FEE_BY_PRICE_PATH, FEE_BY_PRICE_TITLE } from '@/lib/fee-by-price'
import { getCategory, MARKETPLACES, type Marketplace, type MarketplaceSlug } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'

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

/**
 * An analysis page is an eBay piece when the slug is ebay-* or the first tag is
 * eBay. A passing mention (holiday returns, parcel surcharges) does not qualify.
 */
export function isEbayAnalysis(article: Pick<AnalysisArticle, 'slug' | 'tags'>): boolean {
  return article.slug.startsWith('ebay-') || article.tags[0] === 'eBay'
}

const EBAY_FEE_HREF = /^\/fees\/ebay(?:\/[a-z0-9-]+)?$/
const EBAY_SALE_HREF = /^\/fees\/ebay\/on-a-(\d+)-sale$/

function allowlistedCampaign(key: string): boolean {
  return newsletterSource(`?source=${key}`) === `newsletter_${key}`
}

/**
 * Brief signup key for the high-intent block on an eBay analysis page.
 * Strips `kw_` from the article's keyword campaign so this signup is distinct
 * from the sidebar (`campaign_kw_ebay_per_order` → `campaign_ebay_per_order`).
 */
export function ebayAnalysisBriefSource(
  article: Pick<AnalysisArticle, 'slug' | 'tags' | 'newsletterSource'>,
): `campaign_${string}` | null {
  if (!isEbayAnalysis(article)) return null
  const fromKeyword = article.newsletterSource.replace(/^campaign_kw_/, 'campaign_')
  if (fromKeyword !== article.newsletterSource && allowlistedCampaign(fromKeyword)) {
    return fromKeyword as `campaign_${string}`
  }
  const generated = briefCtaSource('ebay', article.slug)
  if (generated !== article.newsletterSource && allowlistedCampaign(generated)) return generated
  return briefCtaSource('ebay', article.slug, 'read')
}

export interface AnalysisReadingLink {
  href: string
  label: string
  note: string
  date?: string
}

/** First in-body anchor for `href` that is a label, not a raw path. */
function citedFeeLabel(article: Pick<AnalysisArticle, 'sections'>, href: string): string | undefined {
  const chunks = article.sections.flatMap(s => [...s.paragraphs, ...(s.bullets ?? [])])
  for (const chunk of chunks) {
    for (const part of parseInlineLinks(chunk)) {
      if (part.href === href && part.text && !part.text.startsWith('/') && !part.text.startsWith('http')) return part.text
    }
  }
  return undefined
}

function feeFallbackLabel(href: string): string {
  if (href === '/fees/ebay') return 'eBay fees by category'
  const sale = EBAY_SALE_HREF.exec(href)
  if (sale) return `eBay fees on a $${sale[1]} sale`
  const category = getCategory('ebay', href.slice('/fees/ebay/'.length))
  return category ? `${category.label} calculator` : 'eBay fee page'
}

/** /fees/ebay first, then calculators and sale pages in the order the article cites them. */
function ebayFeeHrefs(article: Pick<AnalysisArticle, 'sections' | 'sources'>): string[] {
  const chunks = article.sections.flatMap(s => [...s.paragraphs, ...(s.bullets ?? [])])
  const hrefs = [...chunks.flatMap(linkHrefs), ...article.sources.map(s => s.href)]
  const seen = new Set<string>()
  const calculators: string[] = []
  for (const href of hrefs) {
    if (!EBAY_FEE_HREF.test(href) || href === '/fees/ebay' || seen.has(href)) continue
    seen.add(href)
    calculators.push(href)
  }
  return ['/fees/ebay', ...calculators]
}

/**
 * Sibling eBay analysis (newest first) plus the eBay fee table and any
 * /fees/ebay calculators the piece already cites. Null for other articles.
 */
export function ebayAnalysisRelated(
  article: AnalysisArticle,
  articles: readonly AnalysisArticle[] = latestAnalysis(),
): AnalysisReadingLink[] | null {
  if (!isEbayAnalysis(article)) return null
  const siblings = articles
    .filter(a => a.slug !== article.slug && isEbayAnalysis(a))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
  const analysisLinks: AnalysisReadingLink[] = siblings.map(a => ({
    href: `/intelligence/analysis/${a.slug}`,
    label: a.headline,
    note: 'Analysis',
    date: a.publishedOn,
  }))
  const feeLinks: AnalysisReadingLink[] = ebayFeeHrefs(article).map(href => ({
    href,
    label: citedFeeLabel(article, href) ?? feeFallbackLabel(href),
    note: href === '/fees/ebay' ? 'Fee table' : EBAY_SALE_HREF.test(href) ? 'Sale fee page' : 'Calculator',
  }))
  return [...analysisLinks, ...feeLinks]
}
