import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BRIEF_CTA_KEYS, SPONSOR_CTA_HREF, SPONSOR_CTA_LABEL, briefCtaSource, briefSignupHref, sponsorFromPrice } from '@/lib/brief-cta'
import { newsletterSource } from '@/lib/newsletter-source'
import { SPONSOR_OFFER_DEFS } from '@/lib/sponsor-offers'
import { MARKETPLACES, getAllFeeRoutes } from '@/lib/marketplace-fees'
import { getAllPairs } from '@/lib/fee-compare'
import { getAllSaleRoutes } from '@/lib/sale-fee-pages'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { BriefCta } from '@/components/brief-cta'

vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probability|odds`, 'i')
const params = (p: object) => ({ params: Promise.resolve(p) }) as never
const html = (el: unknown) => renderToStaticMarkup(el as ReactElement)
const signupKeys = (markup: string) => [...markup.matchAll(/<a [^>]*data-cta="brief_signup"[^>]*href="\/newsletter\?source=([^"#&]+)#subscribe"/g)].map(m => m[1])
const sponsorLinks = (markup: string) => markup.match(/href="\/sponsor#inquiry"/g)?.length ?? 0
const valid = (key: string) => newsletterSource(`?source=${key}`) === `newsletter_${key}`

describe('brief CTA keys', () => {
  it('every generated key passes the newsletter source allowlist', () => {
    const keys = [
      BRIEF_CTA_KEYS.feeHub, BRIEF_CTA_KEYS.feeChangelog, BRIEF_CTA_KEYS.articles, BRIEF_CTA_KEYS.news, BRIEF_CTA_KEYS.guidesHub,
      ...MARKETPLACES.flatMap(m => [BRIEF_CTA_KEYS.feeMarketplace(m.slug), BRIEF_CTA_KEYS.feeCategory(m.slug), BRIEF_CTA_KEYS.feeSale(m.slug)]),
      ...getAllPairs().map(p => BRIEF_CTA_KEYS.feeCompare(p.slug)),
      ...OPERATOR_GUIDES.map(g => BRIEF_CTA_KEYS.guide(g.slug)),
    ]
    expect(keys.length).toBeGreaterThan(10)
    for (const k of keys) expect(valid(k), k).toBe(true)
  })
  it('normalizes and clips long or messy slugs to a valid key', () => {
    expect(briefCtaSource('fee', 'TikTok Shop!')).toBe('campaign_cta_fee_tiktok_shop')
    const long = briefCtaSource('x'.repeat(40), 'y'.repeat(40))
    expect(long.length).toBeLessThanOrEqual(64)
    expect(valid(long)).toBe(true)
  })
  it('builds the signup href', () => {
    expect(briefSignupHref('campaign_cta_fee_hub')).toBe('/newsletter?source=campaign_cta_fee_hub#subscribe')
  })
})

describe('sponsor link', () => {
  it('takes the lowest price from lib/sponsor-offers.ts', () => {
    const lowest = Math.min(...SPONSOR_OFFER_DEFS.map(o => Number(o.price.replace(/[^0-9.]/g, ''))))
    expect(sponsorFromPrice()).toBe(`$${lowest}`)
    expect(SPONSOR_CTA_LABEL).toBe(`Sponsor the Brief from $${lowest}`)
    expect(SPONSOR_CTA_HREF).toBe('/sponsor#inquiry')
  })
  it('BriefCta renders one signup link and one sponsor link, with no forbidden terms', () => {
    const out = html(createElement(BriefCta, { source: 'campaign_cta_fee_hub' }))
    expect(signupKeys(out)).toEqual(['campaign_cta_fee_hub'])
    expect(sponsorLinks(out)).toBe(1)
    expect(out).toContain(SPONSOR_CTA_LABEL)
    expect(out).not.toMatch(FORBIDDEN)
  })
})

describe('every fee and article template shows exactly one keyed Brief CTA and one sponsor link', () => {
  const check = (out: string, key: string) => {
    expect(signupKeys(out)).toEqual([key])
    expect(sponsorLinks(out)).toBe(1)
    expect(valid(key)).toBe(true)
  }
  it('/fees hub', async () => {
    const { default: Page } = await import('@/app/fees/page')
    check(html(Page()), BRIEF_CTA_KEYS.feeHub)
  })
  it('/fees/[marketplace]', async () => {
    const { default: Page } = await import('@/app/fees/[marketplace]/page')
    for (const m of MARKETPLACES) check(html(await Page(params({ marketplace: m.slug }))), BRIEF_CTA_KEYS.feeMarketplace(m.slug))
  })
  it('/fees/[marketplace]/[category]', async () => {
    const { default: Page } = await import('@/app/fees/[marketplace]/[category]/page')
    for (const m of MARKETPLACES) {
      const r = getAllFeeRoutes().find(x => x.marketplace === m.slug)!
      check(html(await Page(params(r))), BRIEF_CTA_KEYS.feeCategory(m.slug))
    }
  })
  it('on-a-$N-sale pages (replaces the old unkeyed fee_compare link)', async () => {
    const { default: Page } = await import('@/app/fees/[marketplace]/sale/[price]/page')
    for (const r of getAllSaleRoutes().slice(0, 6)) {
      const out = html(await Page(params(r)))
      check(out, BRIEF_CTA_KEYS.feeSale(r.marketplace))
      expect(out).not.toContain('source=fee_compare"')
    }
  })
  it('/fees/compare/[pair]', async () => {
    const { default: Page } = await import('@/app/fees/compare/[pair]/page')
    for (const p of getAllPairs()) check(html(await Page(params({ pair: p.slug }))), BRIEF_CTA_KEYS.feeCompare(p.slug))
  })
  it('/fees/compare-by-item-price keeps its campaign_kw key', async () => {
    const { default: Page } = await import('@/app/fees/compare-by-item-price/page')
    check(html(Page()), 'campaign_kw_marketplace_fee_comparison')
  })
  it('/fees/changelog', async () => {
    const { default: Page } = await import('@/app/fees/changelog/page')
    check(html(Page()), BRIEF_CTA_KEYS.feeChangelog)
  })
  it('fee explainers keep their campaign_kw keys', async () => {
    const { default: Peak } = await import('@/app/fees/amazon/holiday-peak-2026/page')
    check(html(Peak()), 'campaign_kw_amazon_peak_fee_2026')
    const { default: TikTok } = await import('@/app/fees/tiktok-shop/fee-change-2026/page')
    check(html(TikTok()), 'campaign_kw_tiktok_fee_change')
  })
  it('/intelligence/analysis hub and every analysis article', async () => {
    const { default: Hub } = await import('@/app/intelligence/analysis/page')
    check(html(Hub()), 'campaign_analysis')
    const { default: Article } = await import('@/app/intelligence/analysis/[slug]/page')
    for (const a of ANALYSIS_ARTICLES) {
      const out = html(await Article(params({ slug: a.slug })))
      // The article keeps its existing per-article key on its existing sidebar CTA.
      expect(out).toContain(`href="/newsletter?source=${a.newsletterSource}#subscribe"`)
      expect(sponsorLinks(out)).toBe(1)
    }
  })
  it('/guides hub and guide pages', async () => {
    const { default: Hub } = await import('@/app/guides/page')
    check(html(Hub()), BRIEF_CTA_KEYS.guidesHub)
    const src = readFileSync(join(process.cwd(), 'app/guides/[slug]/page.tsx'), 'utf8')
    expect(src).toContain('briefSignupHref(BRIEF_CTA_KEYS.guide(slug))')
    expect(src).toContain('<SponsorBriefLink')
  })
  it('/articles archive and news briefings use keyed links plus the sponsor link', () => {
    for (const [file, key] of [['app/articles/articles-browser.tsx', 'articles'], ['app/news/[id]/page.tsx', 'news']]) {
      const src = readFileSync(join(process.cwd(), file), 'utf8')
      expect(src).toContain(`<BriefSignupLink source={BRIEF_CTA_KEYS.${key}}>`)
      expect(src).toContain('<SponsorBriefLink')
      expect(src).not.toMatch(/href="\/newsletter"/)
    }
  })
})

describe('/pricing', () => {
  it('no longer claims payments are processed by Stripe', () => {
    const src = readFileSync(join(process.cwd(), 'app/pricing/page.tsx'), 'utf8')
    expect(src).not.toMatch(/processed by Stripe/i)
    expect(src).toContain('Questions before you join?')
  })
})
