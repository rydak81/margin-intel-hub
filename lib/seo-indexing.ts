// Indexing rules for news briefings. Kept in one place so the sitemap, the
// robots directive and the page metadata can never disagree with each other.

/**
 * Which /news/[id] pages may be indexed.
 *
 * Every row in the `articles` table is an ingested third-party item
 * (`source_type` is 'industry' or 'google'): the page carries the source's
 * own headline and, for most items, the source's own text, with a short
 * MarketplaceBeta summary on top. To a search engine these read as
 * syndicated duplicates of the original report, so they stay crawlable
 * (noindex, follow: links still pass) but out of the index and the sitemap.
 *
 * MarketplaceBeta's original analysis is published under
 * /intelligence/analysis, which stays indexed. If first-party news posts are
 * ever written into `articles`, give them source_type 'original' and they
 * become indexable here (and in the sitemap) automatically.
 */
export const INDEXABLE_NEWS_SOURCE_TYPES: readonly string[] = ['original']

export function isIndexableNewsArticle(article: { source_type?: string | null }): boolean {
  return !!article.source_type && INDEXABLE_NEWS_SOURCE_TYPES.includes(article.source_type)
}

const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Drop repeat ingests of the same story (same normalized title) so the
 * sitemap lists one URL per story: the earliest-published copy.
 */
export function dedupeByTitle<T extends { title: string; published_at: string | null }>(rows: T[]): T[] {
  const best = new Map<string, T>()
  for (const row of rows) {
    const key = normalizeTitle(row.title)
    if (!key) continue
    const prev = best.get(key)
    const t = row.published_at ? Date.parse(row.published_at) : NaN
    const pt = prev?.published_at ? Date.parse(prev.published_at) : NaN
    if (!prev || (Number.isFinite(t) && (!Number.isFinite(pt) || t < pt))) best.set(key, row)
  }
  const keep = new Set(best.values())
  return rows.filter(row => keep.has(row))
}

/**
 * Splits "Headline - Publisher" into its parts when the trailing segment is
 * the source name, or when the item came through a Google News feed (whose
 * titles always carry the publisher as a " - Publisher" suffix).
 */
export function splitSourceSuffix(title: string, sourceName?: string | null): { headline: string; publisher: string | null } {
  const idx = title.lastIndexOf(' - ')
  if (idx <= 0) return { headline: title, publisher: null }
  const head = title.slice(0, idx).trim()
  const tail = title.slice(idx + 3).trim()
  const fromAggregator = /^google news\b/i.test(sourceName ?? '')
  const matchesSource = !!sourceName && tail.toLowerCase() === sourceName.toLowerCase()
  if (!head || !tail || tail.length > 40 || !(fromAggregator || matchesSource)) return { headline: title, publisher: null }
  return { headline: head, publisher: tail }
}

/**
 * Meta description for a news briefing whose dated summary was withheld for
 * freshness. Unique per page (title + source + date) instead of one shared
 * boilerplate sentence.
 */
export function withheldSummaryDescription(title: string, sourceName: string | null | undefined, publishedAt: string | null | undefined): string {
  const date = publishedAt && Number.isFinite(Date.parse(publishedAt)) ? new Date(publishedAt).toISOString().slice(0, 10) : null
  const named = sourceName && !/^google news\b/i.test(sourceName) ? sourceName : null
  const source = named ? `${named} report` : 'Report'
  return `${source}${date ? ` from ${date}` : ''}: ${title}. Operator impact, why it matters and what to check next.`
}

/**
 * Flat-rate marketplaces whose fee category pages only differ by the category
 * name: the rule, the rate and ~85% of the copy are the same on every page
 * (5-word-shingle similarity >= 0.8 for every pair, see the SEO audit). Their
 * category URLs stay live for visitors and internal links, but declare the
 * marketplace fee page as canonical and stay out of the sitemap, so the
 * signals consolidate on one page instead of 19 near-duplicates.
 *
 * Amazon, Walmart and eBay have genuinely different rates per category and
 * keep self-canonical, indexable category pages.
 */
export const CANONICALISED_CATEGORY_MARKETPLACES: readonly string[] = ['tiktok-shop', 'etsy']

export function isCanonicalisedCategoryMarketplace(marketplaceSlug: string): boolean {
  return CANONICALISED_CATEGORY_MARKETPLACES.includes(marketplaceSlug)
}

/** Path (no origin) that a fee category page declares as its canonical. */
export function feeCategoryCanonicalPath(marketplaceSlug: string, categorySlug: string): string {
  return isCanonicalisedCategoryMarketplace(marketplaceSlug)
    ? `/fees/${marketplaceSlug}`
    : `/fees/${marketplaceSlug}/${categorySlug}`
}

/** Whether a fee category page is its own canonical (and so belongs in the sitemap). */
export function isSelfCanonicalFeeCategory(marketplaceSlug: string): boolean {
  return !isCanonicalisedCategoryMarketplace(marketplaceSlug)
}

/**
 * The "$N sale" fee pages are price-only template variants of the category
 * pages. They stay crawlable (follow: links still pass) and usable, but out of
 * the index and the sitemap.
 */
export const SALE_PAGE_ROBOTS = { index: false, follow: true } as const
