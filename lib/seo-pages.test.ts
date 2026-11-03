import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import nextConfig from '@/next.config.mjs'
import { generateMetadata as categoryMetadata } from '@/app/fees/[marketplace]/[category]/page'
import { generateMetadata as saleMetadata } from '@/app/fees/[marketplace]/sale/[price]/page'
import { metadata as forecastsMetadata } from '@/app/intelligence/forecasts/page'
import { MARKETPLACES, getAllFeeRoutes } from '@/lib/marketplace-fees'
import { SALE_PRICES, getAllSaleRoutes } from '@/lib/sale-fee-pages'
import { INDEXABLE_SALE_PAGES, feeCategoryCanonicalPath, isIndexableSalePage, isSelfCanonicalFeeCategory } from '@/lib/seo-indexing'
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
    // Each new analysis article adds one URL; 157 was counted with 5 articles. +1: /fees/compare-by-item-price.
    expect(urls).toHaveLength(157 - 19 - 25 + 1 + INDEXABLE_SALE_PAGES.length + (ANALYSIS_ARTICLES.length - 5))
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
    const { renderToStaticMarkup } = await import('react-dom/server')
    const { createElement } = await import('react')
    const { ArticlesStaticList } = await import('@/app/articles/articles-static-list')
    expect(renderToStaticMarkup(createElement(ArticlesStaticList, { initial: null }))).toContain('<h1')
  })
})
