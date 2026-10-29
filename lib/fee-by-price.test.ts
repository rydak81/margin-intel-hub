import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import sitemap from '@/app/sitemap'
import FeesIndexPage from '@/app/fees/page'
import { buildLlmsTxt } from '@/lib/llms-txt'
import { MARKETPLACES, formatVerifiedDate } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'
import {
  COMPARE_PRICES, FEE_BY_PRICE_CTA, FEE_BY_PRICE_DESCRIPTION, FEE_BY_PRICE_PATH, FEE_BY_PRICE_TITLE, OFFSITE_ADS,
  buildOffsiteRows, buildRows, feeByPriceFaq, feeByPriceShortAnswer, offsiteFee, referenceCategory,
} from '@/lib/fee-by-price'

vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))

const SITE = 'https://marketplacebeta.com'
const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|consumer price index`, 'i')
const rows = buildRows()
const row = (slug: string) => rows.find(r => r.marketplace.slug === slug)!
const totals = (slug: string) => row(slug).cells.map(c => c.totalFees)
const nets = (slug: string) => row(slug).cells.map(c => c.netProceeds)

describe('fee math, hand-computed from the fee tables', () => {
  it('uses the four prices in order', () => expect([...COMPARE_PRICES]).toEqual([10, 25, 50, 100]))
  it('Amazon "Everything Else" 15% referral fee', () => {
    expect(totals('amazon')).toEqual([1.5, 3.75, 7.5, 15])
    expect(nets('amazon')).toEqual([8.5, 21.25, 42.5, 85])
  })
  it('Walmart "Home & Garden" 15% referral fee', () => {
    expect(totals('walmart')).toEqual([1.5, 3.75, 7.5, 15])
    expect(nets('walmart')).toEqual([8.5, 21.25, 42.5, 85])
  })
  it('TikTok Shop 6% commission (published rate)', () => {
    expect(totals('tiktok-shop')).toEqual([0.6, 1.5, 3, 6])
    expect(nets('tiktok-shop')).toEqual([9.4, 23.5, 47, 94])
  })
  it('eBay 13.6% + $0.30 per order through $10, $0.40 above', () => {
    // 10: 1.36 + 0.30; 25: 3.40 + 0.40; 50: 6.80 + 0.40; 100: 13.60 + 0.40
    expect(totals('ebay')).toEqual([1.66, 3.8, 7.2, 14])
    expect(nets('ebay')).toEqual([8.34, 21.2, 42.8, 86])
  })
  it('Etsy 6.5% + $0.20 listing + 3% + $0.25 processing, Offsite Ads excluded', () => {
    // 10: 0.65 + 0.20 + (0.30 + 0.25); 25: 1.63 + 0.20 + (0.75 + 0.25); 50: 3.25 + 0.20 + (1.50 + 0.25); 100: 6.50 + 0.20 + (3.00 + 0.25)
    expect(totals('etsy')).toEqual([1.4, 2.83, 5.2, 9.95])
    expect(nets('etsy')).toEqual([8.6, 22.17, 44.8, 90.05])
  })
  it('Etsy Offsite Ads: 15% / 12% of the order total, capped at $100 per order, kept apart from the baseline', () => {
    const o = buildOffsiteRows(rows)
    expect(o.map(r => r.fee15)).toEqual([1.5, 3.75, 7.5, 15])
    expect(o.map(r => r.fee12)).toEqual([1.2, 3, 6, 12])
    expect(o.map(r => r.netAfter15)).toEqual([7.1, 18.42, 37.3, 75.05])
    expect(o.map(r => r.netAfter12)).toEqual([7.4, 19.17, 38.8, 78.05])
    expect(o.map(r => r.baselineFees)).toEqual(totals('etsy'))
    expect(offsiteFee(1000, 15)).toBe(100)
    expect(offsiteFee(10000, 12)).toBe(100)
    expect(OFFSITE_ADS).toMatchObject({ standardPct: 15, discountedPct: 12, thresholdUsd: 10000, capUsd: 100 })
  })
  it('each total plus net equals the price', () => {
    for (const r of rows) r.cells.forEach(c => expect(Math.round((c.totalFees + c.netProceeds) * 100) / 100).toBe(c.price))
  })
  it('reference categories exist and carry the rate most categories share (Amazon, Walmart) or the published one', () => {
    for (const m of MARKETPLACES) expect(referenceCategory(m).category.referralPct).toBeGreaterThan(0)
    for (const slug of ['amazon', 'walmart']) {
      const m = MARKETPLACES.find(x => x.slug === slug)!
      const counts = new Map<number, number>()
      for (const c of m.categories) counts.set(c.referralPct, (counts.get(c.referralPct) ?? 0) + 1)
      const modal = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
      expect(referenceCategory(m).category.referralPct, slug).toBe(modal)
    }
    expect(referenceCategory(MARKETPLACES.find(m => m.slug === 'tiktok-shop')!).category.referralPct).toBe(6)
    expect(referenceCategory(MARKETPLACES.find(m => m.slug === 'etsy')!).category.tiers).toBeUndefined()
  })
})

describe('short answer and FAQ', () => {
  const answer = feeByPriceShortAnswer(rows)
  it('is one dated sentence computed from the table', () => {
    expect(answer.startsWith(`As of ${formatVerifiedDate('2026-10-16')}, `)).toBe(true)
    expect(answer.endsWith('.')).toBe(true)
    expect(answer.slice(0, -1)).not.toMatch(/\.\s/)
    expect(answer).toContain('hypothetical')
    expect(answer).toContain('TikTok Shop at every price ($0.60, $1.50, $3.00 and $6.00)')
    expect(answer).toContain('eBay at $10 and $25 ($1.66 and $3.80), then Amazon and Walmart at $50 and $100 ($7.50 and $15.00)')
  })
  it('is the first FAQ answer', () => expect(feeByPriceFaq(rows)[0].answer).toBe(answer))
  it('says Offsite Ads are optional only below $10,000 and never shows the unconfirmed TikTok rate or banned names', () => {
    const faq = JSON.stringify(feeByPriceFaq(rows))
    expect(faq).toContain('optional only for shops that earned less than $10,000 in the past 365 days')
    expect(faq).not.toMatch(/\b8% (rate|commission)|Aug(ust)? 4/)
    expect(faq).not.toMatch(FORBIDDEN)
    expect(faq).not.toMatch(/probabilit|\bodds\b/i)
  })
})

describe('page', () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
  async function html() {
    const { default: Page } = await import('@/app/fees/compare-by-item-price/page')
    return renderToStaticMarkup(createElement(Page))
  }
  const ld = (h: string) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => { const v = JSON.parse(m[1].replace(/\\u003c/g, '<')); return Array.isArray(v) ? v : [v] })
  const text = (h: string) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

  it('has metadata within limits and a self canonical', async () => {
    const { metadata } = await import('@/app/fees/compare-by-item-price/page')
    expect(FEE_BY_PRICE_TITLE.length).toBeLessThanOrEqual(60)
    expect(FEE_BY_PRICE_DESCRIPTION.length).toBeLessThanOrEqual(155)
    expect(metadata.title).toBe(FEE_BY_PRICE_TITLE)
    expect(metadata.alternates?.canonical).toBe(`${SITE}${FEE_BY_PRICE_PATH}`)
    expect(metadata.robots).toBeUndefined()
  })
  it('puts the short answer first, labels everything hypothetical, and repeats it as the first FAQ answer', async () => {
    const h = await html()
    const answer = feeByPriceShortAnswer(rows)
    const body = h.slice(h.indexOf('<main'))
    expect(body.indexOf('<h1')).toBeLessThan(body.indexOf('id="short-answer"'))
    expect(body.indexOf('id="short-answer"')).toBeLessThan(body.indexOf('<table'))
    expect(text(h)).toContain(answer)
    expect(h).toContain('HYPOTHETICAL EXAMPLES')
    const dds = [...h.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)].map(m => text(m[1]).trim())
    expect(dds[0]).toBe(answer)
    expect(dds).toEqual(feeByPriceFaq(rows).map(f => text(f.answer).trim()))
  })
  it('shows the computed values, Offsite Ads as a separate section, and the exclusions', async () => {
    const t = text(await html())
    for (const v of ['$1.66', '$3.80', '$9.95', '$90.05', '$22.17', '$75.05', '$78.05', '$0.60', '$94.00']) expect(t).toContain(v)
    expect(t).toContain('a separate line, not in the Etsy total above')
    expect(t).toContain('capped at $100 per order')
    expect(t).toContain('Not included anywhere on this page')
    expect(t).toContain('shipping and fulfillment')
    expect(t).not.toMatch(FORBIDDEN)
    expect(t).not.toMatch(/Aug(ust)? 4|trade reports of an 8%/)
  })
  it('emits BreadcrumbList, FAQPage and Dataset JSON-LD that match the visible FAQ', async () => {
    const h = await html()
    const blocks = ld(h)
    expect(blocks.map(b => b['@type'])).toEqual(['BreadcrumbList', 'FAQPage', 'Dataset'])
    const faq = blocks[1]
    const items = feeByPriceFaq(rows)
    expect(faq.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => [q.name, q.acceptedAnswer.text])).toEqual(items.map(f => [f.question, f.answer]))
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(feeByPriceShortAnswer(rows))
    const ds = blocks[2]
    expect(ds.creator).toEqual({ '@id': `${SITE}/#organization` })
    expect(ds.dateModified).toBe('2026-10-21')
    expect(ds.isAccessibleForFree).toBe(true)
    expect(JSON.stringify(blocks)).not.toMatch(/sameAs/)
    expect(read('app/fees/compare-by-item-price/page.tsx')).toContain('creator: ORGANIZATION_REF')
  })
  it('links the newsletter with an allowlisted source key', async () => {
    expect(FEE_BY_PRICE_CTA).toBe('/newsletter?source=campaign_kw_marketplace_fee_comparison#subscribe')
    expect(newsletterSource('?source=campaign_kw_marketplace_fee_comparison')).toBe('newsletter_campaign_kw_marketplace_fee_comparison')
    expect(await html()).toContain(`href="${FEE_BY_PRICE_CTA}"`)
  })
  it('is linked from /fees, listed in the sitemap and in llms.txt', async () => {
    expect(renderToStaticMarkup(createElement(FeesIndexPage))).toContain(`href="${FEE_BY_PRICE_PATH}"`)
    const urls = (await sitemap()).map(e => e.url)
    expect(urls.filter(u => u === `${SITE}${FEE_BY_PRICE_PATH}`)).toHaveLength(1)
    expect(buildLlmsTxt()).toContain(`${SITE}${FEE_BY_PRICE_PATH}`)
  })
})
