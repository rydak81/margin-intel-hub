import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { FeeRelatedLinks, AnalysisEbayReading, AnalysisFeeLinks } from '@/components/related-links'
import { newsletterSource } from '@/lib/newsletter-source'
import {
  RELATED_ANALYSIS_LIMIT, RELATED_FEE_COMPARE, analysisMarketplaces, countMentions, ebayAnalysisBriefSource, ebayAnalysisRelated, isEbayAnalysis, relatedAnalysisForMarketplace,
} from '@/lib/related-links'

const mp = (slug: string) => MARKETPLACES.find(m => m.slug === slug)!
const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probabilit|\\bodds\\b`, 'i')

function article(overrides: Partial<AnalysisArticle> = {}, body: string[] = []): AnalysisArticle {
  return {
    slug: 'test', seoTitle: 'Parcel rates', metaDescription: 'Parcel rates', headline: 'Parcel rates', dek: 'Parcel rates',
    publishedOn: '2026-10-01', updatedOn: '2026-10-01', author: 'x', readTime: '1 min', tags: ['logistics'],
    takeaway: 'Check your rates.', forecastIds: [], newsletterSource: 'campaign_test',
    sections: [{ id: 's', title: 'Body', paragraphs: body }], sources: [], ...overrides,
  }
}
const slugs = (a: AnalysisArticle) => analysisMarketplaces(a).map(m => m.slug)

describe('countMentions', () => {
  it('matches whole words, case-insensitive, including possessives', () => {
    expect(countMentions("eBay's fees and EBAY listings", mp('ebay'))).toBe(2)
    expect(countMentions('Etsy, etsy.', mp('etsy'))).toBe(2)
  })
  it('ignores the name inside longer words', () => {
    expect(countMentions('webay ebayer amazonian walmarts petsy etsyshop', mp('ebay'))).toBe(0)
    expect(countMentions('amazonian', mp('amazon'))).toBe(0)
    expect(countMentions('walmarts', mp('walmart'))).toBe(0)
    expect(countMentions('petsy etsyshop', mp('etsy'))).toBe(0)
  })
  it('matches both the full name and short name, counting each mention once', () => {
    expect(countMentions('Walmart Marketplace vs Walmart', mp('walmart'))).toBe(2)
    expect(countMentions('TikTok Shop sellers', mp('tiktok-shop'))).toBe(1)
  })
})

describe('analysisMarketplaces', () => {
  it('counts one mention in the framing (title, dek, tags...)', () => {
    expect(slugs(article({ headline: 'What Etsy sellers should do' }))).toEqual(['etsy'])
    expect(slugs(article({ tags: ['eBay'] }))).toEqual(['ebay'])
  })
  it('needs two body mentions; a single passing mention does not count', () => {
    expect(slugs(article({}, ['Amazon is mentioned once.']))).toEqual([])
    expect(slugs(article({}, ['Amazon once.', 'Amazon twice.']))).toEqual(['amazon'])
  })
  it('counts a body link to a fee page even without the name', () => {
    expect(slugs(article({}, ['See [the peak fees](/fees/amazon/holiday-peak-2026).']))).toEqual(['amazon'])
    expect(slugs(article({}, ['See [this table](/fees/etsy).']))).toEqual(['etsy'])
  })
  it('does not count URLs inside links, and /fees/compare does not match a marketplace', () => {
    expect(slugs(article({}, ['[help](https://www.ebay.com/help) and [x](https://ebay.com/y)']))).toEqual([])
    expect(slugs(article({}, ['[comparison](/fees/compare/amazon-vs-walmart)']))).toEqual([])
  })
  it('returns marketplaces in fee-table order', () => {
    expect(slugs(article({ headline: 'Etsy, eBay, Walmart and Amazon' }))).toEqual(['amazon', 'walmart', 'ebay', 'etsy'])
  })
})

describe('relatedAnalysisForMarketplace', () => {
  it('returns at most 3, newest first, all covering the marketplace', () => {
    for (const m of MARKETPLACES) {
      const got = relatedAnalysisForMarketplace(m.slug)
      expect(got.length).toBeLessThanOrEqual(RELATED_ANALYSIS_LIMIT)
      const order = latestAnalysis().map(a => a.slug)
      expect(got.map(a => order.indexOf(a.slug))).toEqual([...got.map(a => order.indexOf(a.slug))].sort((x, y) => x - y))
      for (const a of got) expect(analysisMarketplaces(a).map(x => x.slug)).toContain(m.slug)
    }
  })
  it('is symmetric with the article-side links', () => {
    for (const a of ANALYSIS_ARTICLES) for (const m of analysisMarketplaces(a)) {
      const all = relatedAnalysisForMarketplace(m.slug, Infinity)
      expect(all.map(x => x.slug)).toContain(a.slug)
    }
  })
})

describe('rendered blocks', () => {
  it('fee page block has plain <a> links to the comparison and analysis', () => {
    for (const m of MARKETPLACES) {
      const html = renderToStaticMarkup(createElement(FeeRelatedLinks, { marketplace: m }))
      expect(html).toContain(`href="${RELATED_FEE_COMPARE.href}"`)
      for (const a of relatedAnalysisForMarketplace(m.slug)) expect(html).toContain(`href="/intelligence/analysis/${a.slug}"`)
      expect(html).not.toMatch(FORBIDDEN)
    }
  })
  it('analysis block links back to each covered fee page', () => {
    for (const a of ANALYSIS_ARTICLES) {
      const html = renderToStaticMarkup(createElement(AnalysisFeeLinks, { article: a }))
      for (const m of analysisMarketplaces(a)) expect(html).toContain(`href="/fees/${m.slug}"`)
      expect(html).not.toMatch(FORBIDDEN)
    }
  })
})

describe('eBay analysis related reading', () => {
  const perOrder = ANALYSIS_ARTICLES.find(a => a.slug === 'ebay-per-order-fee-2026-under-10')!
  const watches = ANALYSIS_ARTICLES.find(a => a.slug === 'ebay-watch-fees-2026-15-percent-to-1000')!

  it('treats ebay-* slugs and a leading eBay tag as eBay analysis', () => {
    expect(isEbayAnalysis(perOrder)).toBe(true)
    expect(isEbayAnalysis(watches)).toBe(true)
    expect(isEbayAnalysis(article({ slug: 'future-ebay-note', tags: ['eBay', 'fees'] }))).toBe(true)
    const returns = ANALYSIS_ARTICLES.find(a => a.slug === 'holiday-returns-2026-amazon-walmart-etsy-ebay')!
    expect(isEbayAnalysis(returns)).toBe(false)
    for (const a of ANALYSIS_ARTICLES.filter(x => !isEbayAnalysis(x))) expect(ebayAnalysisRelated(a)).toBeNull()
  })

  it('links the newer watch analysis and the eBay fee pages the per-order piece already cites', () => {
    const links = ebayAnalysisRelated(perOrder)!
    expect(links.map(l => l.href)).toEqual([
      '/intelligence/analysis/ebay-watch-fees-2026-15-percent-to-1000',
      '/fees/ebay',
      '/fees/ebay/most-categories',
      '/fees/ebay/on-a-10-sale',
    ])
    expect(links[1].label).toBe('eBay fee table')
    expect(links[2].label).toBe('Most Categories calculator')
    expect(links[3].label).toBe('$10 sale page')
    expect(links.map(l => `${l.label} ${l.note}`).join('\n')).not.toMatch(FORBIDDEN)
  })

  it('on the watch piece, links the per-order analysis, the fee table and the watches calculator', () => {
    const links = ebayAnalysisRelated(watches)!
    expect(links.map(l => l.href)).toEqual([
      '/intelligence/analysis/ebay-per-order-fee-2026-under-10',
      '/fees/ebay',
      '/fees/ebay/watches',
    ])
    expect(links[2].label).toBe('eBay watches calculator')
    expect(links.map(l => l.href)).not.toContain('/fees/walmart')
  })

  it('attributes the inline Brief signup as campaign_ebay_per_order, distinct from the sidebar key', () => {
    expect(perOrder.newsletterSource).toBe('campaign_kw_ebay_per_order')
    expect(ebayAnalysisBriefSource(perOrder)).toBe('campaign_ebay_per_order')
    expect(newsletterSource('?source=campaign_ebay_per_order')).toBe('newsletter_campaign_ebay_per_order')
    expect(ebayAnalysisBriefSource(watches)).toBe('campaign_ebay_watches')
    expect(ebayAnalysisBriefSource(watches)).not.toBe(watches.newsletterSource)
    expect(ebayAnalysisBriefSource(ANALYSIS_ARTICLES.find(a => !isEbayAnalysis(a))!)).toBeNull()
  })

  it('renders the block with the signup only on eBay analysis', () => {
    const html = renderToStaticMarkup(createElement(AnalysisEbayReading, { article: perOrder }))
    expect(html).toContain('id="related-reading"')
    expect(html).toContain('href="/intelligence/analysis/ebay-watch-fees-2026-15-percent-to-1000"')
    expect(html).toContain('href="/fees/ebay/most-categories"')
    expect(html).toContain('href="/newsletter?source=campaign_ebay_per_order#subscribe"')
    expect(html).toContain('data-cta="brief_signup"')
    expect(html).not.toMatch(FORBIDDEN)
    const other = ANALYSIS_ARTICLES.find(a => !isEbayAnalysis(a))!
    expect(renderToStaticMarkup(createElement(AnalysisEbayReading, { article: other }))).toBe('')
  })

  it('picks up a later eBay article without a hand-maintained list', () => {
    const fixture = article({
      slug: 'ebay-fixture-fees',
      tags: ['eBay', 'fees'],
      newsletterSource: 'campaign_kw_ebay_fixture',
      publishedOn: '2099-01-01',
      updatedOn: '2099-01-01',
      seoTitle: 'Fixture eBay fees',
      headline: 'Fixture eBay fees',
      sections: [{ id: 's', title: 'Body', paragraphs: ['See the [guitars calculator](/fees/ebay/guitars-basses).'] }],
    })
    const hrefs = ebayAnalysisRelated(fixture, [fixture, ...latestAnalysis()])!.map(l => l.href)
    expect(hrefs[0]).toBe('/intelligence/analysis/ebay-watch-fees-2026-15-percent-to-1000')
    expect(hrefs).toContain('/intelligence/analysis/ebay-per-order-fee-2026-under-10')
    expect(hrefs).toContain('/fees/ebay')
    expect(hrefs).toContain('/fees/ebay/guitars-basses')
    expect(ebayAnalysisBriefSource(fixture)).toBe('campaign_ebay_fixture')
    const unkeyed = article({ slug: 'ebay-custom', tags: ['seller fees'], newsletterSource: 'campaign_custom_ebay' })
    expect(ebayAnalysisBriefSource(unkeyed)).toBe('campaign_cta_ebay_ebay-custom')
  })
})

describe('TikTok Shop coverage', () => {
  it('the TikTok Shop fee page links the 6% vs 8% analysis piece', () => {
    const slug = 'tiktok-shop-referral-fee-6-or-8-percent'
    expect(relatedAnalysisForMarketplace('tiktok-shop').map(a => a.slug)).toContain(slug)
    const html = renderToStaticMarkup(createElement(FeeRelatedLinks, { marketplace: mp('tiktok-shop') }))
    expect(html).toContain(`href="/intelligence/analysis/${slug}"`)
    expect(slugs(ANALYSIS_ARTICLES.find(a => a.slug === slug)!)).toEqual(['tiktok-shop'])
  })
})

describe('fee category pages show the same Related block', () => {
  it('every category route renders the marketplace Related block (comparison + matching analysis)', async () => {
    const { getAllFeeRoutes } = await import('@/lib/marketplace-fees')
    const { default: Page } = await import('@/app/fees/[marketplace]/[category]/page')
    const routes = getAllFeeRoutes()
    expect(new Set(routes.map(r => r.marketplace))).toEqual(new Set(MARKETPLACES.map(m => m.slug)))
    for (const r of routes) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve(r) } as never))
      const block = /<section id="related"[\s\S]*?<\/section>/.exec(html)?.[0] ?? ''
      expect(block, `${r.marketplace}/${r.category}`).toBe(renderToStaticMarkup(createElement(FeeRelatedLinks, { marketplace: mp(r.marketplace) })))
      expect(html.match(/id="related"/g), `${r.marketplace}/${r.category}`).toHaveLength(1)
    }
  })

  it('a new article covering a marketplace appears on that marketplace\'s category pages only (fixture)', () => {
    const fixture = article({ slug: 'fixture-walmart', headline: 'Walmart fixture piece', publishedOn: '2099-01-01', updatedOn: '2099-01-01' })
    const articles = [fixture, ...latestAnalysis()]
    expect(relatedAnalysisForMarketplace('walmart', RELATED_ANALYSIS_LIMIT, articles)[0].slug).toBe('fixture-walmart')
    for (const m of MARKETPLACES.filter(x => x.slug !== 'walmart')) {
      expect(relatedAnalysisForMarketplace(m.slug, RELATED_ANALYSIS_LIMIT, articles).map(a => a.slug)).not.toContain('fixture-walmart')
    }
  })

  it('Walmart category pages link the New Seller Savings analysis', async () => {
    const slug = 'walmart-new-seller-savings-2026-worth-it'
    expect(ANALYSIS_ARTICLES.some(a => a.slug === slug)).toBe(true)
    const { getAllFeeRoutes } = await import('@/lib/marketplace-fees')
    const { default: Page } = await import('@/app/fees/[marketplace]/[category]/page')
    const walmart = getAllFeeRoutes().filter(r => r.marketplace === 'walmart')
    expect(walmart.length).toBeGreaterThan(0)
    for (const r of walmart) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve(r) } as never))
      expect(html, r.category).toContain(`href="/intelligence/analysis/${slug}"`)
      expect(html).not.toMatch(FORBIDDEN)
    }
  })
})
