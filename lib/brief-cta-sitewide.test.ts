import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  BRIEF_CTA_KEYS, FOOTER_BRIEF_HREF, FOOTER_BRIEF_SOURCE, HEADER_BRIEF_HREF, HEADER_BRIEF_SOURCE, SPONSOR_CTA_LABEL,
  incomingBriefSource, isAllowedBriefSource, resolveBriefSource, withBriefSource,
} from '@/lib/brief-cta'
import { newsletterSource } from '@/lib/newsletter-source'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { ArticlesStaticList } from '@/app/articles/articles-static-list'

// Keep the intelligence pages off the network: no archive reads in tests.
vi.mock('@/lib/pressure-index', async (orig) => ({ ...(await orig<typeof import('@/lib/pressure-index')>()), loadPressureArticles: async () => [] }))
vi.mock('@/lib/forecasts', async (orig) => {
  const mod = await orig<typeof import('@/lib/forecasts')>()
  return { ...mod, loadForecasts: async () => [] }
})
vi.mock('@/lib/analyst', async (orig) => ({ ...(await orig<typeof import('@/lib/analyst')>()), loadLatestAnalystRun: async () => null }))
vi.mock('@/components/workspace-discovery', () => ({ WorkspaceDiscovery: () => null }))

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probability|odds`, 'i')
const html = (el: unknown) => renderToStaticMarkup(el as ReactElement)
const valid = (key: string) => newsletterSource(`?source=${key}`) === `newsletter_${key}`
const sponsorCtas = (markup: string) => markup.match(/data-cta="sponsor_brief"/g)?.length ?? 0
const newsletterKeys = (markup: string) => [...markup.matchAll(/href="\/newsletter\?source=([^"#&]+)#subscribe"/g)].map(m => m[1])

describe('header and footer Brief signup keys', () => {
  it('pass the newsletter source allowlist', () => {
    expect(HEADER_BRIEF_SOURCE).toBe('campaign_cta_header')
    expect(FOOTER_BRIEF_SOURCE).toBe('campaign_cta_footer')
    expect(valid(HEADER_BRIEF_SOURCE)).toBe(true)
    expect(valid(FOOTER_BRIEF_SOURCE)).toBe(true)
    expect(HEADER_BRIEF_HREF).toBe('/newsletter?source=campaign_cta_header#subscribe')
    expect(FOOTER_BRIEF_HREF).toBe('/newsletter?source=campaign_cta_footer#subscribe')
  })
  it('header default button carries the header key; footer link carries the footer key', () => {
    const header = html(createElement(PremiumSiteHeader, {}))
    expect(newsletterKeys(header)).toEqual([HEADER_BRIEF_SOURCE])
    const footer = html(createElement(PremiumSiteFooter))
    expect(newsletterKeys(footer)).toEqual([FOOTER_BRIEF_SOURCE])
    expect(footer).not.toMatch(/href="\/newsletter"/)
    expect(header + footer).not.toMatch(FORBIDDEN)
  })
  it('a page passing its own header link keeps it', () => {
    const header = html(createElement(PremiumSiteHeader, { ctaHref: '/newsletter?source=campaign_forecasts#subscribe' }))
    expect(newsletterKeys(header)).toEqual(['campaign_forecasts'])
  })
})

describe('sponsor link on intelligence pages', () => {
  const pages: [string, () => Promise<unknown>][] = [
    ['/intelligence/forecasts', async () => (await import('@/app/intelligence/forecasts/page')).default()],
    ['/intelligence/dossier', async () => (await import('@/app/intelligence/dossier/page')).default()],
    ['/intelligence/pressure-index', async () => (await import('@/app/intelligence/pressure-index/page')).default()],
  ]
  for (const [path, render] of pages) {
    it(`${path} renders exactly one sponsor link and keeps its keyed signup box`, async () => {
      const out = html(await render())
      expect(sponsorCtas(out)).toBe(1)
      expect(out).toContain(SPONSOR_CTA_LABEL)
      const keys = newsletterKeys(out)
      expect(keys.length).toBeGreaterThan(0)
      for (const k of keys) expect(newsletterSource(`?source=${k}`)).not.toBe('newsletter_page')
      // No duplicated BriefCta box on these pages: they keep their own signup boxes.
      expect(out).not.toContain('aria-label="Daily Marketplace Brief"')
    })
  }
  it('new CTA copy has no tool names, "CPI", probabilities or odds', () => {
    expect(SPONSOR_CTA_LABEL).not.toMatch(FORBIDDEN)
    for (const file of ['components/brief-cta.tsx', 'components/brief-signup-link.tsx', 'lib/brief-cta.ts', 'components/premium-site-footer.tsx', 'components/premium-site-header.tsx']) {
      expect(readFileSync(join(process.cwd(), file), 'utf8'), file).not.toMatch(FORBIDDEN)
    }
  })
})

describe('/articles server-rendered fallback', () => {
  it('shows one keyed Brief CTA and one sponsor link for crawlers', () => {
    const out = html(createElement(ArticlesStaticList, { initial: null }))
    expect(newsletterKeys(out)).toEqual([BRIEF_CTA_KEYS.articles])
    expect(sponsorCtas(out)).toBe(1)
    expect(out).not.toMatch(FORBIDDEN)
  })
  it('is only the Suspense fallback, so it is replaced (not duplicated) once the interactive archive loads', () => {
    const src = readFileSync(join(process.cwd(), 'app/articles/page.tsx'), 'utf8')
    expect(src).toMatch(/<Suspense fallback=\{<ArticlesStaticList[^>]*\/>\}>\s*<ArticlesBrowser/)
  })
})

describe('incoming ?source pass-through', () => {
  const PAGE = 'campaign_kw_marketplace_fee_comparison'
  it('a valid incoming key overrides the page default', () => {
    expect(incomingBriefSource('?source=tiktok')).toBe('tiktok')
    expect(resolveBriefSource(PAGE, '?source=tiktok', null)).toBe('tiktok')
    expect(resolveBriefSource(PAGE, '?source=campaign_video_t05', null)).toBe('campaign_video_t05')
    expect(resolveBriefSource(PAGE, '?utm_source=linkedin', null)).toBe('linkedin')
  })
  it('an invalid, unknown or duplicated key is ignored and the page key is used', () => {
    for (const search of ['', '?source=evil.com', '?source=<script>', '?source=TikTok', '?source=tiktok&source=x', `?source=campaign_${'a'.repeat(60)}`, '?source=']) {
      expect(incomingBriefSource(search), search).toBeNull()
      expect(resolveBriefSource(PAGE, search, null), search).toBe(PAGE)
    }
  })
  it('a key remembered for the visit applies when this URL has none, but only if it is valid', () => {
    expect(resolveBriefSource(PAGE, '', 'tiktok')).toBe('tiktok')
    expect(resolveBriefSource(PAGE, '?source=x', 'tiktok')).toBe('x')
    expect(resolveBriefSource(PAGE, '', 'javascript:alert(1)')).toBe(PAGE)
    expect(isAllowedBriefSource('campaign_cta_header')).toBe(true)
    expect(isAllowedBriefSource('nope')).toBe(false)
  })
  it('rewrites only /newsletter links', () => {
    expect(withBriefSource('/newsletter?source=campaign_forecasts#subscribe', 'tiktok')).toBe('/newsletter?source=tiktok#subscribe')
    expect(withBriefSource('/newsletter', 'tiktok')).toBe('/newsletter?source=tiktok#subscribe')
    expect(withBriefSource('/pricing', 'tiktok')).toBe('/pricing')
  })
  it('server render ignores the query: page default key, canonical without ?source', async () => {
    const mod = await import('@/app/fees/compare-by-item-price/page')
    const canonical = String(mod.metadata.alternates?.canonical)
    expect(canonical).toMatch(/\/fees\/compare-by-item-price$/)
    expect(canonical).not.toContain('?')
    // The page takes no searchParams, so ?source cannot reach server output.
    expect(mod.default.length).toBe(0)
    const out = html(mod.default())
    expect(out).toContain(`href="/newsletter?source=${PAGE}#subscribe"`)
    expect(out).not.toContain('source=tiktok')
  })
})
