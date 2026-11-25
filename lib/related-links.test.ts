import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { FeeRelatedLinks, AnalysisEbayReading, AnalysisEtsyReading, AnalysisFeeLinks } from '@/components/related-links'
import { newsletterSource } from '@/lib/newsletter-source'
import {
  RELATED_ANALYSIS_LIMIT, RELATED_FEE_COMPARE, EBAY_TRADING_CARD_ANSWER, analysisMarketplaces, countMentions, ebayAnalysisBriefSource, ebayAnalysisRelated, etsyAnalysisBriefSource, etsyAnalysisRelated, feeCategoryAnswerLink, isEbayAnalysis, isEtsyAnalysis, isEtsyEbayFeeComparison, relatedAnalysisForMarketplace,
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
const articleHref = (a: AnalysisArticle) => `/intelligence/analysis/${a.slug}`
const byDate = (articles: readonly AnalysisArticle[]) => articles.map((a, i) => ({ a, i }))
  .sort((x, y) => y.a.publishedOn.localeCompare(x.a.publishedOn) || x.i - y.i)
  .map(({ a }) => a)

/** Sibling analyses, then Etsy-vs-eBay comparisons, then the fee pages this piece cites. */
function ebayReadingHrefs(article: AnalysisArticle, feeHrefs: string[], articles: readonly AnalysisArticle[] = latestAnalysis()) {
  const ordered = byDate(articles)
  const siblings = ordered.filter(a => a.slug !== article.slug && isEbayAnalysis(a))
  const seen = new Set(siblings.map(a => a.slug))
  const comparisons = ordered.filter(a => a.slug !== article.slug && isEtsyEbayFeeComparison(a) && !seen.has(a.slug))
  return [...siblings.map(articleHref), ...comparisons.map(articleHref), ...feeHrefs]
}

/** Other Etsy analyses, then eBay analyses, then the Etsy fee pages this piece cites. */
function etsyReadingHrefs(article: AnalysisArticle, feeHrefs: string[], articles: readonly AnalysisArticle[] = latestAnalysis()) {
  const ordered = byDate(articles)
  const etsy = ordered.filter(a => a.slug !== article.slug && isEtsyAnalysis(a))
  const ebay = ordered.filter(a => a.slug !== article.slug && isEbayAnalysis(a))
  return [...etsy.map(articleHref), ...ebay.map(articleHref), ...feeHrefs]
}

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

  it('links the newer watch analysis, the Etsy vs eBay comparison, and the eBay fee pages the per-order piece already cites', () => {
    const links = ebayAnalysisRelated(perOrder)!
    const fees = ['/fees/ebay', '/fees/ebay/most-categories', '/fees/ebay/on-a-10-sale']
    expect(links.map(l => l.href)).toEqual(ebayReadingHrefs(perOrder, fees))
    const byHref = Object.fromEntries(links.map(l => [l.href, l]))
    expect(byHref[articleHref(watches)].label).toBe(watches.headline)
    expect(byHref['/fees/ebay'].label).toBe('eBay fee table')
    expect(byHref['/fees/ebay/most-categories'].label).toBe('Most Categories calculator')
    expect(byHref['/fees/ebay/on-a-10-sale'].label).toBe('$10 sale page')
    expect(links.map(l => `${l.label} ${l.note}`).join('\n')).not.toMatch(FORBIDDEN)
  })

  it('on the watch piece, links the per-order analysis, the Etsy vs eBay comparison, the fee table and the watches calculator', () => {
    const links = ebayAnalysisRelated(watches)!
    const fees = ['/fees/ebay', '/fees/ebay/watches']
    expect(links.map(l => l.href)).toEqual(ebayReadingHrefs(watches, fees))
    const byHref = Object.fromEntries(links.map(l => [l.href, l]))
    expect(byHref[articleHref(perOrder)].label).toBe(perOrder.headline)
    expect(byHref['/fees/ebay/watches'].label).toBe('eBay watches calculator')
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
    expect(html).toContain('href="/intelligence/analysis/etsy-vs-ebay-fees-2026-20-50-100"')
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
    const pool = [fixture, ...latestAnalysis()]
    const hrefs = ebayAnalysisRelated(fixture, pool)!.map(l => l.href)
    expect(hrefs).toEqual(ebayReadingHrefs(fixture, ['/fees/ebay', '/fees/ebay/guitars-basses'], pool))
    expect(hrefs[0]).toBe(articleHref(byDate(pool).find(a => a.slug !== fixture.slug && isEbayAnalysis(a))!))
    expect(hrefs).toContain('/intelligence/analysis/ebay-watch-fees-2026-15-percent-to-1000')
    expect(hrefs).toContain('/intelligence/analysis/ebay-per-order-fee-2026-under-10')
    expect(hrefs).toContain('/intelligence/analysis/etsy-vs-ebay-fees-2026-20-50-100')
    expect(ebayAnalysisBriefSource(fixture)).toBe('campaign_ebay_fixture')
    const unkeyed = article({ slug: 'ebay-custom', tags: ['seller fees'], newsletterSource: 'campaign_custom_ebay' })
    expect(ebayAnalysisBriefSource(unkeyed)).toBe('campaign_cta_ebay_ebay-custom')
  })
})

describe('Etsy analysis related reading', () => {
  const comparison = ANALYSIS_ARTICLES.find(a => a.slug === 'etsy-vs-ebay-fees-2026-20-50-100')!
  const ddp = ANALYSIS_ARTICLES.find(a => a.slug === 'etsy-ddp-us-orders-2026-duty-paid-pricing')!
  const offsite = ANALYSIS_ARTICLES.find(a => a.slug === 'etsy-offsite-ads-fees-2026')!
  const watches = ANALYSIS_ARTICLES.find(a => a.slug === 'ebay-watch-fees-2026-15-percent-to-1000')!
  const perOrder = ANALYSIS_ARTICLES.find(a => a.slug === 'ebay-per-order-fee-2026-under-10')!

  it('treats etsy-* slugs and a leading Etsy tag as Etsy analysis', () => {
    expect(isEtsyAnalysis(ddp)).toBe(true)
    expect(isEtsyAnalysis(offsite)).toBe(true)
    expect(isEtsyAnalysis(article({ slug: 'future-etsy-note', tags: ['Etsy', 'fees'] }))).toBe(true)
    const returns = ANALYSIS_ARTICLES.find(a => a.slug === 'holiday-returns-2026-amazon-walmart-etsy-ebay')!
    expect(isEtsyAnalysis(returns)).toBe(false)
    expect(isEtsyAnalysis(perOrder)).toBe(false)
    for (const a of ANALYSIS_ARTICLES.filter(x => !isEtsyAnalysis(x))) expect(etsyAnalysisRelated(a)).toBeNull()
  })

  it('on the duty-paid piece, links the Etsy vs eBay comparison, the Offsite Ads analysis, the eBay fee analyses on main, and the Etsy fee page', () => {
    const links = etsyAnalysisRelated(ddp)!
    expect(links.map(l => l.href)).toEqual(etsyReadingHrefs(ddp, ['/fees/etsy']))
    const byHref = Object.fromEntries(links.map(l => [l.href, l]))
    expect(byHref[articleHref(comparison)].label).toBe(comparison.headline)
    expect(byHref[articleHref(offsite)].label).toBe(offsite.headline)
    expect(byHref[articleHref(watches)].label).toBe(watches.headline)
    expect(byHref[articleHref(perOrder)].label).toBe(perOrder.headline)
    expect(byHref['/fees/etsy'].label).toBe('Etsy fee page')
    expect(byHref['/fees/etsy'].note).toBe('Fee table')
    expect(links.map(l => `${l.label} ${l.note}`).join('\n')).not.toMatch(FORBIDDEN)
  })

  it('on the Offsite Ads piece, links the Etsy vs eBay comparison, the duty-paid analysis, the eBay fee analyses, and the Etsy fee pages it already cites', () => {
    const links = etsyAnalysisRelated(offsite)!
    const fees = ['/fees/etsy', '/fees/etsy/on-a-20-sale', '/fees/etsy/on-a-50-sale']
    expect(links.map(l => l.href)).toEqual(etsyReadingHrefs(offsite, fees))
    const byHref = Object.fromEntries(links.map(l => [l.href, l]))
    expect(byHref[articleHref(comparison)].label).toBe(comparison.headline)
    expect(byHref[articleHref(ddp)].label).toBe(ddp.headline)
    expect(byHref['/fees/etsy'].label).toBe('Etsy fee table')
    expect(byHref['/fees/etsy/on-a-20-sale'].label).toBe('$20 sale')
    expect(byHref['/fees/etsy/on-a-50-sale'].label).toBe('$50 sale')
    expect(byHref['/fees/etsy/on-a-20-sale'].note).toBe('Sale fee page')
    expect(links.map(l => l.href)).not.toContain('/fees/compare/ebay-vs-etsy')
    expect(links.map(l => l.href)).not.toContain('/fees/ebay')
  })

  it('attributes the inline Brief signup as campaign_etsy_ddp, distinct from the sidebar key', () => {
    expect(ddp.newsletterSource).toBe('campaign_kw_etsy_ddp')
    expect(etsyAnalysisBriefSource(ddp)).toBe('campaign_etsy_ddp')
    expect(newsletterSource('?source=campaign_etsy_ddp')).toBe('newsletter_campaign_etsy_ddp')
    expect(offsite.newsletterSource).toBe('campaign_kw_etsy_offsite_ads')
    expect(etsyAnalysisBriefSource(offsite)).toBe('campaign_etsy_offsite_ads')
    expect(newsletterSource('?source=campaign_etsy_offsite_ads')).toBe('newsletter_campaign_etsy_offsite_ads')
    expect(etsyAnalysisBriefSource(offsite)).not.toBe(offsite.newsletterSource)
    expect(etsyAnalysisBriefSource(ANALYSIS_ARTICLES.find(a => !isEtsyAnalysis(a))!)).toBeNull()
  })

  it('renders the block with the signup only on Etsy analysis', () => {
    const html = renderToStaticMarkup(createElement(AnalysisEtsyReading, { article: ddp }))
    expect(html).toContain('id="related-reading"')
    expect(html).toContain(`href="/intelligence/analysis/${comparison.slug}"`)
    expect(html).toContain(`href="/intelligence/analysis/${offsite.slug}"`)
    expect(html).toContain(`href="/intelligence/analysis/${watches.slug}"`)
    expect(html).toContain(`href="/intelligence/analysis/${perOrder.slug}"`)
    expect(html).toContain('href="/fees/etsy"')
    expect(html).toContain('href="/newsletter?source=campaign_etsy_ddp#subscribe"')
    expect(html).toContain('data-cta="brief_signup"')
    expect(html).not.toMatch(FORBIDDEN)
    const other = ANALYSIS_ARTICLES.find(a => !isEtsyAnalysis(a))!
    expect(renderToStaticMarkup(createElement(AnalysisEtsyReading, { article: other }))).toBe('')
  })

  it('picks up a later Etsy article and skips a cited fee path that is not a page', () => {
    const fixture = article({
      slug: 'etsy-fixture-fees',
      tags: ['Etsy', 'fees'],
      newsletterSource: 'campaign_kw_etsy_fixture',
      publishedOn: '2099-01-01',
      updatedOn: '2099-01-01',
      seoTitle: 'Fixture Etsy fees',
      headline: 'Fixture Etsy fees',
      sections: [{ id: 's', title: 'Body', paragraphs: ['See the [handmade calculator](/fees/etsy/handmade) and the [missing page](/fees/etsy/not-a-page).'] }],
    })
    const pool = [fixture, ...latestAnalysis()]
    const hrefs = etsyAnalysisRelated(fixture, pool)!.map(l => l.href)
    expect(hrefs).toEqual(etsyReadingHrefs(fixture, ['/fees/etsy', '/fees/etsy/handmade'], pool))
    expect(hrefs[0]).toBe(articleHref(byDate(pool).find(a => a.slug !== fixture.slug && isEtsyAnalysis(a))!))
    expect(hrefs).toContain(`/intelligence/analysis/${comparison.slug}`)
    expect(hrefs).toContain(`/intelligence/analysis/${ddp.slug}`)
    expect(hrefs).toContain(`/intelligence/analysis/${offsite.slug}`)
    expect(hrefs).toContain(`/intelligence/analysis/${watches.slug}`)
    expect(hrefs).toContain(`/intelligence/analysis/${perOrder.slug}`)
    expect(hrefs).not.toContain('/fees/etsy/not-a-page')
    expect(etsyAnalysisBriefSource(fixture)).toBe('campaign_etsy_fixture')
    expect(newsletterSource('?source=campaign_etsy_fixture')).toBe('newsletter_campaign_etsy_fixture')
    const unkeyed = article({ slug: 'etsy-custom', tags: ['seller fees'], newsletterSource: 'campaign_custom_etsy' })
    expect(etsyAnalysisBriefSource(unkeyed)).toBe('campaign_cta_etsy_etsy-custom')
    expect(newsletterSource('?source=campaign_cta_etsy_etsy-custom')).toBe('newsletter_campaign_cta_etsy_etsy-custom')
  })

  it('the Etsy vs eBay comparison links back to the Etsy and eBay fee analyses, which link to it', () => {
    expect(isEtsyAnalysis(comparison)).toBe(true)
    expect(isEbayAnalysis(comparison)).toBe(false)
    const links = etsyAnalysisRelated(comparison)!
    const fees = ['/fees/etsy', '/fees/etsy/on-a-20-sale', '/fees/etsy/on-a-100-sale']
    expect(links.map(l => l.href)).toEqual(etsyReadingHrefs(comparison, fees))
    const byHref = Object.fromEntries(links.map(l => [l.href, l]))
    expect(byHref[articleHref(ddp)].label).toBe(ddp.headline)
    expect(byHref[articleHref(offsite)].label).toBe(offsite.headline)
    expect(byHref['/fees/etsy'].label).toBe('Etsy fee table')
    expect(byHref['/fees/etsy'].note).toBe('Fee table')
    expect(byHref['/fees/etsy/on-a-20-sale'].label).toBe('Etsy $20 sale page')
    expect(byHref['/fees/etsy/on-a-100-sale'].label).toBe('Etsy $100 sale page')
    expect(byHref['/fees/etsy/on-a-20-sale'].note).toBe('Sale fee page')
    expect(links.map(l => l.href)).not.toContain(`/intelligence/analysis/${comparison.slug}`)
    expect(links.map(l => l.href)).not.toContain('/fees/compare/ebay-vs-etsy')
    expect(links.map(l => l.href)).not.toContain('/fees/ebay')
    expect(links.map(l => `${l.label} ${l.note}`).join('\n')).not.toMatch(FORBIDDEN)
    expect(comparison.newsletterSource).toBe('campaign_kw_cmp_ebay_etsy')
    expect(etsyAnalysisBriefSource(comparison)).toBe('campaign_cmp_ebay_etsy')
    expect(etsyAnalysisBriefSource(comparison)).not.toBe(comparison.newsletterSource)
    expect(newsletterSource('?source=campaign_cmp_ebay_etsy')).toBe('newsletter_campaign_cmp_ebay_etsy')
    expect(ebayAnalysisBriefSource(comparison)).toBeNull()
    const html = renderToStaticMarkup(createElement(AnalysisEtsyReading, { article: comparison }))
    for (const slug of [ddp.slug, offsite.slug, watches.slug, perOrder.slug]) {
      expect(html).toContain(`href="/intelligence/analysis/${slug}"`)
    }
    expect(html).toContain('id="related-reading"')
    expect(html).toContain('href="/newsletter?source=campaign_cmp_ebay_etsy#subscribe"')
    expect(html).toContain('data-cta="brief_signup"')
    expect(renderToStaticMarkup(createElement(AnalysisEbayReading, { article: comparison }))).toBe('')
    for (const article of [ddp, offsite]) {
      expect(etsyAnalysisRelated(article)!.map(l => l.href)).toContain(`/intelligence/analysis/${comparison.slug}`)
    }
    for (const article of [watches, perOrder]) {
      expect(ebayAnalysisRelated(article)!.map(l => l.href)).toContain(`/intelligence/analysis/${comparison.slug}`)
    }
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

  it('links the trading card answer from the two card calculators only', async () => {
    expect(feeCategoryAnswerLink('ebay', 'trading-cards')).toEqual(EBAY_TRADING_CARD_ANSWER)
    expect(feeCategoryAnswerLink('ebay', 'trading-cards-store')).toEqual(EBAY_TRADING_CARD_ANSWER)
    expect(feeCategoryAnswerLink('ebay', 'most-categories')).toBeNull()
    expect(feeCategoryAnswerLink('etsy', 'trading-cards')).toBeNull()
    const { default: Page } = await import('@/app/fees/[marketplace]/[category]/page')
    for (const category of ['trading-cards', 'trading-cards-store']) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ marketplace: 'ebay', category }) } as never))
      expect(html, category).toContain(`href="${EBAY_TRADING_CARD_ANSWER.href}"`)
      expect(html, category).toContain('What are eBay')
    }
    const other = renderToStaticMarkup(await Page({ params: Promise.resolve({ marketplace: 'ebay', category: 'most-categories' }) } as never))
    expect(other).not.toContain(`href="${EBAY_TRADING_CARD_ANSWER.href}"`)
    const related = /<section id="related"[\s\S]*?<\/section>/.exec(other)?.[0] ?? ''
    expect(related).toBe(renderToStaticMarkup(createElement(FeeRelatedLinks, { marketplace: mp('ebay') })))
  })

  it('Walmart category pages link the Walmart analyses selected for the Related block', async () => {
    const selected = relatedAnalysisForMarketplace('walmart')
    expect(selected.length).toBeGreaterThan(0)
    expect(relatedAnalysisForMarketplace('walmart', Infinity).map(a => a.slug)).toContain('walmart-new-seller-savings-2026-worth-it')
    const { getAllFeeRoutes } = await import('@/lib/marketplace-fees')
    const { default: Page } = await import('@/app/fees/[marketplace]/[category]/page')
    const walmart = getAllFeeRoutes().filter(r => r.marketplace === 'walmart')
    expect(walmart.length).toBeGreaterThan(0)
    for (const r of walmart) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve(r) } as never))
      for (const a of selected) expect(html, r.category).toContain(`href="/intelligence/analysis/${a.slug}"`)
      expect(html).not.toMatch(FORBIDDEN)
    }
  })
})
