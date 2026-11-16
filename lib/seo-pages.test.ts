import { AI_PLAYBOOKS } from '@/lib/ai-playbooks'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { NewsArticleFollowOn } from '@/components/news-article-follow-on'
import nextConfig from '@/next.config.mjs'
import { generateMetadata as categoryMetadata } from '@/app/fees/[marketplace]/[category]/page'
import { generateMetadata as saleMetadata } from '@/app/fees/[marketplace]/sale/[price]/page'
import { metadata as forecastsMetadata } from '@/app/intelligence/forecasts/page'
import { MARKETPLACES, getAllFeeRoutes } from '@/lib/marketplace-fees'
import { SALE_PRICES, getAllSaleRoutes } from '@/lib/sale-fee-pages'
import { INDEXABLE_SALE_PAGES, feeCategoryCanonicalPath, isIndexableSalePage, isSelfCanonicalFeeCategory } from '@/lib/seo-indexing'
import { newsArticleCopy, newsArticleJsonLd, newsArticleMetadataFields, relatedAnalysisForNews } from '@/lib/news-article-seo'
import { analysisMarketplaces, relatedAnalysisForMarketplace } from '@/lib/related-links'
import { ORGANIZATION_ID } from '@/lib/site-jsonld'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { parseInitialArticles } from '@/lib/articles-initial'

const SITE = 'https://marketplacebeta.com'
const params = (p: object) => ({ params: Promise.resolve(p) }) as never

describe('fee category canonicals', () => {
  it('canonicalises TikTok Shop and Etsy categories to the marketplace page', async () => {
    const routes = getAllFeeRoutes().filter(r => r.marketplace === 'tiktok-shop' || r.marketplace === 'etsy')
    expect(routes.filter(r => r.marketplace === 'tiktok-shop')).toHaveLength(12)
    expect(routes.filter(r => r.marketplace === 'etsy')).toHaveLength(7)
    for (const r of routes) {
      const meta = await categoryMetadata(params(r))
      expect(meta.alternates?.canonical).toBe(`${SITE}/fees/${r.marketplace}`)
      // canonical only: noindex plus a cross-URL canonical sends conflicting signals
      expect(meta.robots).toBeUndefined()
    }
  })
  it('keeps Amazon, Walmart and eBay category pages self-canonical', async () => {
    for (const m of ['amazon', 'walmart', 'ebay']) {
      const r = getAllFeeRoutes().find(x => x.marketplace === m)!
      const meta = await categoryMetadata(params(r))
      expect(meta.alternates?.canonical).toBe(`${SITE}/fees/${r.marketplace}/${r.category}`)
      expect(isSelfCanonicalFeeCategory(m)).toBe(true)
      expect(feeCategoryCanonicalPath(m, r.category)).toBe(`/fees/${m}/${r.category}`)
    }
  })
})

describe('"$N sale" pages', () => {
  it('are noindex,follow and keep a self canonical, except the allowlist', async () => {
    const routes = getAllSaleRoutes()
    expect(routes).toHaveLength(MARKETPLACES.length * SALE_PRICES.length)
    expect(routes).toHaveLength(25)
    for (const r of routes) {
      const meta = await saleMetadata(params(r))
      if (isIndexableSalePage(r.marketplace, Number(r.price))) expect(meta.robots).toBeUndefined()
      else expect(meta.robots).toEqual({ index: false, follow: true })
      expect(meta.alternates?.canonical).toBe(`${SITE}/fees/${r.marketplace}/on-a-${r.price}-sale`)
    }
  })
  it('the allowlist is exactly /fees/tiktok-shop/on-a-20-sale, and every entry is a real sale route', async () => {
    expect(INDEXABLE_SALE_PAGES).toEqual([{ marketplace: 'tiktok-shop', price: 20 }])
    const routes = getAllSaleRoutes()
    for (const p of INDEXABLE_SALE_PAGES) expect(routes).toContainEqual({ marketplace: p.marketplace, price: String(p.price) })
    const meta = await saleMetadata(params({ marketplace: 'tiktok-shop', price: '20' }))
    expect(meta.robots).toBeUndefined()
    expect(meta.alternates?.canonical).toBe(`${SITE}/fees/tiktok-shop/on-a-20-sale`)
    expect((await saleMetadata(params({ marketplace: 'tiktok-shop', price: '30' }))).robots).toEqual({ index: false, follow: true })
    expect((await saleMetadata(params({ marketplace: 'etsy', price: '20' }))).robots).toEqual({ index: false, follow: true })
  })
})

describe('sitemap after dedupe', () => {
  it('drops canonicalised category pages and sale pages, keeps the rest', async () => {
    const urls = (await sitemap()).map(e => e.url)
    expect(urls.filter(u => /\/fees\/(tiktok-shop|etsy)\/[^/]+$/.test(u) && !u.endsWith('fee-change-2026') && !/\/on-a-\d+-sale$/.test(u))).toEqual([])
    expect(urls.filter(u => /\/on-a-\d+-sale$/.test(u))).toEqual([`${SITE}/fees/tiktok-shop/on-a-20-sale`])
    for (const m of MARKETPLACES) expect(urls).toContain(`${SITE}/fees/${m.slug}`)
    expect(urls).toContain(`${SITE}/fees/tiktok-shop/fee-change-2026`)
    expect(urls).toContain(`${SITE}/fees/amazon/holiday-peak-2026`)
    const expectedCategories = getAllFeeRoutes().filter(r => isSelfCanonicalFeeCategory(r.marketplace)).length
    expect(urls.filter(u => /\/fees\/(amazon|walmart|ebay)\/[^/]+$/.test(u) && !/holiday-peak/.test(u))).toHaveLength(expectedCategories)
  })
  it('lists 43 fewer URLs than before (19 category + 25 sale pages, 1 sale page allowlisted back)', async () => {
    // 157 URLs on main before this change; the sitemap has no news rows without database credentials.
    const urls = (await sitemap()).map(e => e.url)
    // Each new analysis article adds one URL; 157 was counted with 5 articles. +1: /fees/compare-by-item-price. Final +1: /holiday-2026.
    expect(urls).toHaveLength(157 - 19 - 25 + 1 + INDEXABLE_SALE_PAGES.length + (ANALYSIS_ARTICLES.length - 5) + AI_PLAYBOOKS.length + 1)
    expect(new Set(urls).size).toBe(urls.length)
  })
})

describe('permanent redirects', () => {
  it('uses permanent redirects for the retired section paths', async () => {
    expect(nextConfig.redirects).toBeTypeOf('function')
    const redirects = await nextConfig.redirects!()
    const bySource = Object.fromEntries(redirects.map(r => [r.source, r.permanent === true]))
    for (const s of ['/solutions/:path*', '/partners/:path*', '/community/:path*']) expect(bySource[s]).toBe(true)
  })
})

describe('forecasts title', () => {
  it('is at most 60 characters, targets the holiday query and shows no CPI naming', () => {
    const title = String(forecastsMetadata.title)
    expect(title.length).toBeLessThanOrEqual(60)
    expect(title.toLowerCase()).toContain('2026 holiday forecast for sellers')
    expect(`${title} ${forecastsMetadata.description}`).not.toMatch(/\bCPI\b|%\s*probab|probabilit/i)
  })
})

describe('/articles initial data', () => {
  it('accepts a successful non-empty search response', () => {
    const body = { success: true, articles: [{ id: 'a', title: 'T', summary: 'S', category: 'c', sourceName: 'x', publishedAt: '2026-10-01' }], total: 5, facets: { categories: {}, platforms: {}, impactLevels: {} } }
    expect(parseInitialArticles(body)?.total).toBe(5)
  })
  it('falls back to the client fetch when the response is unusable', () => {
    expect(parseInitialArticles(null)).toBeNull()
    expect(parseInitialArticles({ error: 'Missing credentials' })).toBeNull()
    expect(parseInitialArticles({ success: true, articles: [], total: 0 })).toBeNull()
  })
})

describe('/articles crawler HTML', () => {
  it('server-renders an H1 and article links', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server')
    const { createElement } = await import('react')
    const { ArticlesStaticList } = await import('@/app/articles/articles-static-list')
    const initial = parseInitialArticles({ success: true, total: 2, articles: [
      { id: 'art_one', title: 'First story', summary: 'One.', category: 'logistics', sourceName: 'Source A', publishedAt: '2026-10-01' },
      { id: 'art_two', title: 'Second story', summary: '', category: 'logistics', sourceName: 'Source B', publishedAt: '2026-10-02' },
    ] })
    const html = renderToStaticMarkup(createElement(ArticlesStaticList, { initial }))
    expect(html).toContain('<h1')
    expect(html).toContain('href="/news/art_one"')
    expect(html).toContain('href="/news/art_two"')
    expect(html).not.toContain('Loading research archive')
  })
  it('still has an H1 when the list could not be loaded', async () => {
    const { ArticlesStaticList } = await import('@/app/articles/articles-static-list')
    expect(renderToStaticMarkup(createElement(ArticlesStaticList, { initial: null }))).toContain('<h1')
  })
})

const REPRICER = {
  id: 'art_jir4d3',
  title: 'Seller Snap launches MCP server connecting its Amazon repricer to ChatGPT and Claude',
  aiSummary: 'Ask your Amazon repricer anything in ChatGPT and Claude LAS VEGAS, Nevada, November 9, 2026.',
  sourceName: 'Seller Snap Blog',
  sourceUrl: 'https://sellersnap.io/amazon-repricer-mcp-chatgpt-claude/',
  publishedAt: '2026-11-09T14:00:35+00:00',
  imageUrl: 'https://sellersnap.io/wp-content/uploads/2026/11/seller-snap-amazon-repricer-mcp-chatgpt-claude-1024x538.png',
}

describe('news article head', () => {
  it('builds a unique title, description, canonical and social tags from the row', () => {
    const meta = newsArticleMetadataFields({ ...REPRICER, updatedAt: '2026-11-10T08:00:00Z', siteUrl: SITE })
    expect(meta.title).toBe(`${REPRICER.title} | MarketplaceBeta`)
    expect(meta.description).toContain('Ask your Amazon repricer')
    expect(meta.description).not.toBe(newsArticleMetadataFields({
      ...REPRICER,
      id: 'art_other',
      title: 'Walmart changed a referral fee',
      aiSummary: 'Walmart changed a referral fee.',
      siteUrl: SITE,
    }).description)
    expect(meta.authors).toBeNull()
    expect(meta.alternates?.canonical).toBe(`${SITE}/news/art_jir4d3`)
    expect(meta.openGraph).toMatchObject({
      title: REPRICER.title,
      description: meta.description,
      url: `${SITE}/news/art_jir4d3`,
      siteName: 'MarketplaceBeta',
      type: 'article',
      publishedTime: '2026-11-09T14:00:35.000Z',
      modifiedTime: '2026-11-10T08:00:00.000Z',
    })
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: REPRICER.title,
      description: meta.description,
      images: [REPRICER.imageUrl],
    })
    expect(meta.openGraph && 'authors' in meta.openGraph && meta.openGraph.authors).toBeFalsy()
  })

  it('omits modified time when the row has no updated_at', () => {
    const meta = newsArticleMetadataFields({ ...REPRICER, siteUrl: SITE })
    expect(meta.openGraph).toMatchObject({ publishedTime: '2026-11-09T14:00:35.000Z' })
    expect(meta.openGraph).not.toHaveProperty('modifiedTime')
  })

  it('uses a per-article description when the row has no summary', () => {
    const alpha = newsArticleCopy({ id: 'art_a', title: 'Alpha fee change', sourceName: 'Example', publishedAt: '2026-11-09T00:00:00Z' })
    const beta = newsArticleCopy({ id: 'art_b', title: 'Beta fee change', sourceName: 'Example', publishedAt: '2026-11-09T00:00:00Z' })
    expect(alpha.description).toContain('Alpha fee change')
    expect(beta.description).toContain('Beta fee change')
    expect(alpha.description).not.toBe(beta.description)
  })

  it('withholds a stale time-relative summary from the description', () => {
    const copy = newsArticleCopy({
      id: 'art_5ggnzl',
      title: 'How we built the agents that built AWS Emulator',
      aiSummary: 'The emulator ships today.',
      sourceName: 'About Amazon',
      publishedAt: '2020-01-01T00:00:00Z',
    })
    expect(copy.description).not.toMatch(/\bships today\b/)
    expect(copy.description).toContain('How we built the agents that built AWS Emulator')
    expect(copy.description).toContain('2020-01-01')
  })
})

describe('news article JSON-LD', () => {
  it('names MarketplaceBeta as publisher and does not invent an author or a modified date', () => {
    const ld = newsArticleJsonLd(REPRICER, SITE)
    expect(ld['@type']).toBe('NewsArticle')
    expect(ld.headline).toBe(REPRICER.title)
    expect(ld.datePublished).toBe('2026-11-09T14:00:35.000Z')
    expect(ld).not.toHaveProperty('dateModified')
    expect(ld).not.toHaveProperty('author')
    expect(ld.mainEntityOfPage).toBe(`${SITE}/news/art_jir4d3`)
    expect(ld.publisher).toEqual({
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'MarketplaceBeta',
      url: SITE,
    })
    expect(ld.isBasedOn).toEqual({
      '@type': 'CreativeWork',
      url: REPRICER.sourceUrl,
      publisher: { '@type': 'Organization', name: 'Seller Snap Blog' },
    })
  })

  it('uses updated_at for dateModified and drops unparseable dates', () => {
    expect(newsArticleJsonLd({ ...REPRICER, updatedAt: '2026-11-12T01:02:03Z' }, SITE).dateModified).toBe('2026-11-12T01:02:03.000Z')
    const blank = newsArticleJsonLd({ id: 'art_x', title: 'Untitled briefing', publishedAt: 'not-a-date', updatedAt: '' }, SITE)
    expect(blank).not.toHaveProperty('datePublished')
    expect(blank).not.toHaveProperty('dateModified')
    expect(blank).not.toHaveProperty('author')
  })
})

describe('news article follow-on', () => {
  const vendor = [ ['kee', 'pa'], ['ever', 'bee'] ].map(parts => parts.join('')).join('|')
  const forbidden = new RegExp(`${vendor}|probability|\\bodds\\b`, 'i')

  it('links at most three analysis pages on the tagged marketplace', () => {
    const picked = relatedAnalysisForNews(['Amazon'])
    expect(picked.length).toBeGreaterThan(0)
    expect(picked.length).toBeLessThanOrEqual(3)
    const amazon = new Set(relatedAnalysisForMarketplace('amazon', 3).map(article => article.slug))
    for (const article of picked) expect(amazon.has(article.slug)).toBe(true)
    for (const article of relatedAnalysisForNews(['ebay'])) {
      expect(analysisMarketplaces(article).some(marketplace => marketplace.slug === 'ebay')).toBe(true)
    }
    expect(relatedAnalysisForNews(['tiktok']).map(article => article.slug)).toEqual(
      relatedAnalysisForMarketplace('tiktok-shop', 3).map(article => article.slug),
    )
  })

  it('skips analysis links when no marketplace matches', () => {
    expect(relatedAnalysisForNews(['shopify', 'target', 'multi_platform'])).toEqual([])
    expect(relatedAnalysisForNews(undefined)).toEqual([])
  })

  it('renders the matched links and the existing Daily Brief signup', () => {
    const html = renderToStaticMarkup(createElement(NewsArticleFollowOn, { platforms: ['ebay'] }))
    expect(html).toContain('id="related-analysis"')
    const hrefs = [...html.matchAll(/href="(\/intelligence\/analysis\/[^"]+)"/g)].map(match => match[1])
    expect(hrefs.length).toBeGreaterThanOrEqual(1)
    expect(hrefs.length).toBeLessThanOrEqual(3)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(html).toContain('href="/newsletter?source=campaign_cta_news#subscribe"')
    expect(html).toContain('href="/sponsor#inquiry"')
    expect(html).not.toMatch(forbidden)
  })

  it('keeps the Brief signup when there is no analysis match', () => {
    const html = renderToStaticMarkup(createElement(NewsArticleFollowOn, { platforms: ['shopify'] }))
    expect(html).not.toContain('id="related-analysis"')
    expect(html).toContain('href="/newsletter?source=campaign_cta_news#subscribe"')
    expect(html).not.toMatch(forbidden)
  })
})
