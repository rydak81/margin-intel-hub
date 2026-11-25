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
import { HOLIDAY_HUB_LINK_LABEL, HOLIDAY_HUB_PATH, isHolidayAnalysis } from '@/lib/holiday-hub'
import { FEE_BY_PRICE_PATH, FEE_BY_PRICE_TITLE } from '@/lib/fee-by-price'
import { getCategory, MARKETPLACES, type Marketplace, type MarketplaceSlug } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'
import { SALE_PRICES } from '@/lib/sale-fee-pages'

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

/**
 * A head-to-head Etsy and eBay fee piece. Named in the slug (`etsy-vs-ebay-…` or
 * `ebay-vs-etsy-…`) or the leading tag. A passing mention of both does not qualify.
 */
export function isEtsyEbayFeeComparison(article: Pick<AnalysisArticle, 'slug' | 'tags'>): boolean {
  const tag = article.tags[0] ?? ''
  return /^(?:etsy-vs-ebay|ebay-vs-etsy)-/.test(article.slug) || tag === 'Etsy vs eBay' || tag === 'eBay vs Etsy'
}

/**
 * An analysis page is an Etsy piece when the slug is etsy-* or the first tag is
 * Etsy. A passing mention (holiday returns, parcel surcharges) does not qualify.
 */
export function isEtsyAnalysis(article: Pick<AnalysisArticle, 'slug' | 'tags'>): boolean {
  return article.slug.startsWith('etsy-') || article.tags[0] === 'Etsy'
}

type FeeMarketplace = 'ebay' | 'etsy'

const FEE_HREF: Record<FeeMarketplace, RegExp> = {
  ebay: /^\/fees\/ebay(?:\/[a-z0-9-]+)?$/,
  etsy: /^\/fees\/etsy(?:\/[a-z0-9-]+)?$/,
}
const SALE_HREF: Record<FeeMarketplace, RegExp> = {
  ebay: /^\/fees\/ebay\/on-a-(\d+)-sale$/,
  etsy: /^\/fees\/etsy\/on-a-(\d+)-sale$/,
}

function allowlistedCampaign(key: string): boolean {
  return newsletterSource(`?source=${key}`) === `newsletter_${key}`
}

/**
 * Brief signup key for the high-intent block on an eBay or Etsy analysis page.
 * Strips `kw_` from the article's keyword campaign so this signup is distinct
 * from the sidebar (`campaign_kw_ebay_per_order` → `campaign_ebay_per_order`).
 * A generated key is used only when it passes lib/newsletter-source.ts.
 */
function marketplaceAnalysisBriefSource(
  article: Pick<AnalysisArticle, 'slug' | 'tags' | 'newsletterSource'>,
  marketplace: FeeMarketplace,
  matches: boolean,
): `campaign_${string}` | null {
  if (!matches) return null
  const fromKeyword = article.newsletterSource.replace(/^campaign_kw_/, 'campaign_')
  if (fromKeyword !== article.newsletterSource && allowlistedCampaign(fromKeyword)) {
    return fromKeyword as `campaign_${string}`
  }
  const generated = briefCtaSource(marketplace, article.slug)
  if (generated !== article.newsletterSource && allowlistedCampaign(generated)) return generated
  return briefCtaSource(marketplace, article.slug, 'read')
}

/** Brief signup key for the high-intent block on an eBay analysis page. */
export function ebayAnalysisBriefSource(
  article: Pick<AnalysisArticle, 'slug' | 'tags' | 'newsletterSource'>,
): `campaign_${string}` | null {
  return marketplaceAnalysisBriefSource(article, 'ebay', isEbayAnalysis(article))
}

/** Brief signup key for the high-intent block on an Etsy analysis page. */
export function etsyAnalysisBriefSource(
  article: Pick<AnalysisArticle, 'slug' | 'tags' | 'newsletterSource'>,
): `campaign_${string}` | null {
  return marketplaceAnalysisBriefSource(article, 'etsy', isEtsyAnalysis(article))
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

const FEE_NAME: Record<FeeMarketplace, string> = { ebay: 'eBay', etsy: 'Etsy' }

function feeFallbackLabel(marketplace: FeeMarketplace, href: string): string {
  const name = FEE_NAME[marketplace]
  const hub = `/fees/${marketplace}`
  if (href === hub) return marketplace === 'ebay' ? 'eBay fees by category' : 'Etsy fees by category'
  const sale = SALE_HREF[marketplace].exec(href)
  if (sale) return `${name} fees on a $${sale[1]} sale`
  const category = getCategory(marketplace, href.slice(`${hub}/`.length))
  return category ? `${category.label} calculator` : `${name} fee page`
}

function feeNote(marketplace: FeeMarketplace, href: string): string {
  if (href === `/fees/${marketplace}`) return 'Fee table'
  return SALE_HREF[marketplace].test(href) ? 'Sale fee page' : 'Calculator'
}

/** True when `href` is a fee hub, category calculator, or sale page this repo already generates. */
function feeRouteExists(marketplace: FeeMarketplace, href: string): boolean {
  const hub = `/fees/${marketplace}`
  if (href === hub) return true
  const prefix = `${hub}/`
  if (!href.startsWith(prefix)) return false
  const rest = href.slice(prefix.length)
  if (getCategory(marketplace, rest)) return true
  const sale = /^on-a-(\d+)-sale$/.exec(rest)
  return sale !== null && (SALE_PRICES as readonly number[]).includes(Number(sale[1]))
}

/**
 * Hub first, then calculators and sale pages in the order the article cites them.
 * Etsy drops a cited path that is not a page this repo already generates.
 */
function citedFeeHrefs(
  article: Pick<AnalysisArticle, 'sections' | 'sources'>,
  marketplace: FeeMarketplace,
  onlyExisting: boolean,
): string[] {
  const hub = `/fees/${marketplace}`
  const chunks = article.sections.flatMap(s => [...s.paragraphs, ...(s.bullets ?? [])])
  const hrefs = [...chunks.flatMap(linkHrefs), ...article.sources.map(s => s.href)]
  const seen = new Set<string>()
  const calculators: string[] = []
  for (const href of hrefs) {
    if (!FEE_HREF[marketplace].test(href) || href === hub || seen.has(href)) continue
    if (onlyExisting && !feeRouteExists(marketplace, href)) continue
    seen.add(href)
    calculators.push(href)
  }
  return [hub, ...calculators]
}

function analysisReadingLink(article: AnalysisArticle): AnalysisReadingLink {
  return {
    href: `/intelligence/analysis/${article.slug}`,
    label: article.headline,
    note: 'Analysis',
    date: article.publishedOn,
  }
}

/** Hub link used in holiday analysis related reading. Label is the hub's own link text. */
export function holidayHubReadingLink(): AnalysisReadingLink {
  return { href: HOLIDAY_HUB_PATH, label: HOLIDAY_HUB_LINK_LABEL, note: 'Holiday hub' }
}

function withHolidayHub(article: Pick<AnalysisArticle, 'tags' | 'publishedOn'>, links: AnalysisReadingLink[]): AnalysisReadingLink[] {
  if (!isHolidayAnalysis(article) || links.some(link => link.href === HOLIDAY_HUB_PATH)) return links
  return [...links, holidayHubReadingLink()]
}

/**
 * Related reading for a holiday analysis page that does not already have an
 * eBay or Etsy related-reading block. Null otherwise, so those pages keep a
 * single related-reading section.
 */
export function holidayAnalysisReading(article: AnalysisArticle): AnalysisReadingLink[] | null {
  if (!isHolidayAnalysis(article) || isEbayAnalysis(article) || isEtsyAnalysis(article)) return null
  return [holidayHubReadingLink()]
}

function feeReadingLinks(article: AnalysisArticle, marketplace: FeeMarketplace, hrefs: string[]): AnalysisReadingLink[] {
  return hrefs.map(href => ({
    href,
    label: citedFeeLabel(article, href) ?? feeFallbackLabel(marketplace, href),
    note: feeNote(marketplace, href),
  }))
}

function newestFirst(articles: readonly AnalysisArticle[], keep: (article: AnalysisArticle) => boolean, exceptSlug: string): AnalysisArticle[] {
  return articles.filter(a => a.slug !== exceptSlug && keep(a)).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
}

/**
 * Sibling eBay analysis (newest first), then any Etsy-vs-eBay fee comparison
 * already published (newest first), then the eBay fee table and any /fees/ebay
 * calculators the piece already cites. Null for other articles.
 */
export function ebayAnalysisRelated(
  article: AnalysisArticle,
  articles: readonly AnalysisArticle[] = latestAnalysis(),
): AnalysisReadingLink[] | null {
  if (!isEbayAnalysis(article)) return null
  const siblings = newestFirst(articles, isEbayAnalysis, article.slug)
  const seen = new Set(siblings.map(a => a.slug))
  const comparisons = newestFirst(articles, isEtsyEbayFeeComparison, article.slug).filter(a => !seen.has(a.slug))
  return withHolidayHub(article, [
    ...siblings.map(analysisReadingLink),
    ...comparisons.map(analysisReadingLink),
    ...feeReadingLinks(article, 'ebay', citedFeeHrefs(article, 'ebay', false)),
  ])
}

/**
 * Other Etsy analysis, then the eBay fee analyses already published, newest
 * first, then the Etsy fee table and any /fees/etsy pages this piece cites
 * that already exist. Null for other articles.
 */
export function etsyAnalysisRelated(
  article: AnalysisArticle,
  articles: readonly AnalysisArticle[] = latestAnalysis(),
): AnalysisReadingLink[] | null {
  if (!isEtsyAnalysis(article)) return null
  return withHolidayHub(article, [
    ...newestFirst(articles, isEtsyAnalysis, article.slug).map(analysisReadingLink),
    ...newestFirst(articles, isEbayAnalysis, article.slug).map(analysisReadingLink),
    ...feeReadingLinks(article, 'etsy', citedFeeHrefs(article, 'etsy', true)),
  ])
}
