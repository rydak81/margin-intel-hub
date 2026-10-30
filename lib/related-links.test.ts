import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { FeeRelatedLinks, AnalysisFeeLinks } from '@/components/related-links'
import {
  RELATED_ANALYSIS_LIMIT, RELATED_FEE_COMPARE, analysisMarketplaces, countMentions, relatedAnalysisForMarketplace,
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
