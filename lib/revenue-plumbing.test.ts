import { describe, expect, it } from 'vitest'
import { AFFILIATE_OFFERS, getRecommendedOffers } from './affiliates'
import { getAllPairs, matchedCategories, resolvePair } from './fee-compare'
import { MARKETPLACES } from './marketplace-fees'
import { getNewsletterSponsor } from './sponsorship'
import { renderSponsorSlot } from './email-templates'

describe('affiliates', () => {
  it('falls back to vendor homepages and filters by marketplace', () => {
    for (const o of AFFILIATE_OFFERS) expect(o.url).toMatch(/^https:\/\//)
    expect(getRecommendedOffers({ marketplace: 'etsy' }).every(o => o.marketplaces.includes('etsy'))).toBe(true)
  })
})

describe('fee comparisons', () => {
  it('covers every unordered pair and resolves reversed slugs', () => {
    const n = MARKETPLACES.length
    expect(getAllPairs()).toHaveLength((n * (n - 1)) / 2)
    expect(resolvePair('tiktok-shop-vs-amazon')).toMatchObject({ reversed: true, pair: { slug: 'amazon-vs-tiktok-shop' } })
    expect(resolvePair('nope-vs-amazon')).toBeNull()
  })
  it('only compares categories present in both datasets', () => {
    const p = getAllPairs().find(x => x.slug === 'amazon-vs-walmart')!
    for (const r of matchedCategories(p.a, p.b)) {
      expect(p.a.categories).toContain(r.aCategory)
      expect(p.b.categories).toContain(r.bCategory)
    }
  })
})

describe('newsletter sponsor slot', () => {
  it('renders nothing without config and escapes when set', () => {
    expect(getNewsletterSponsor({})).toBeNull()
    expect(renderSponsorSlot(null)).toBe('')
    const html = renderSponsorSlot(getNewsletterSponsor({ NEWSLETTER_SPONSOR_NAME: 'A<b>', NEWSLETTER_SPONSOR_URL: 'https://x.test' }))
    expect(html).toContain('A&lt;b&gt;')
    expect(html).toContain('rel="sponsored nofollow noopener"')
  })
})
