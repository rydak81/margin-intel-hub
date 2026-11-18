// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BriefSignupLink } from './brief-signup-link'
import { BriefCta } from './brief-cta'
import { PremiumSiteHeader } from './premium-site-header'
import { PremiumSiteFooter } from './premium-site-footer'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { BRIEF_SOURCE_STORAGE_KEY } from '@/lib/brief-cta'

const analytics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@vercel/analytics', () => ({ track: analytics.track }))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const PAGE = 'campaign_kw_marketplace_fee_comparison'
let container: HTMLDivElement
let root: Root

const mount = async (url: string) => {
  window.history.replaceState(null, '', url)
  await act(async () => { root.render(<BriefSignupLink source={PAGE}>Get the free Brief</BriefSignupLink>) })
  return container.querySelector('a')!.getAttribute('href')
}

beforeEach(() => {
  analytics.track.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove() })

/** Click and report whether the handler cancelled it. Stops the browser from following href. */
function clickLink(anchor: HTMLAnchorElement): boolean {
  let prevented = false
  const note = (event: Event) => {
    prevented = event.defaultPrevented
    event.preventDefault()
  }
  document.addEventListener('click', note)
  anchor.click()
  document.removeEventListener('click', note)
  return prevented
}

describe('BriefSignupLink source pass-through', () => {
  it('server HTML always uses the page key', () => {
    window.history.replaceState(null, '', '/fees/compare-by-item-price?source=tiktok')
    expect(renderToString(<BriefSignupLink source={PAGE}>x</BriefSignupLink>)).toContain(`href="/newsletter?source=${PAGE}#subscribe"`)
  })
  it('a valid incoming ?source overrides the page key and is remembered for the visit', async () => {
    expect(await mount('/fees/compare-by-item-price?source=tiktok')).toBe('/newsletter?source=tiktok#subscribe')
    expect(sessionStorage.getItem(BRIEF_SOURCE_STORAGE_KEY)).toBe('tiktok')
    act(() => root.unmount()); root = createRoot(container)
    expect(await mount('/intelligence/forecasts')).toBe('/newsletter?source=tiktok#subscribe')
  })
  it('an invalid incoming key is ignored', async () => {
    expect(await mount('/fees/compare-by-item-price?source=evil.com')).toBe(`/newsletter?source=${PAGE}#subscribe`)
    expect(sessionStorage.getItem(BRIEF_SOURCE_STORAGE_KEY)).toBeNull()
  })
  it('no incoming key keeps the page key', async () => {
    expect(await mount('/fees/compare-by-item-price')).toBe(`/newsletter?source=${PAGE}#subscribe`)
  })
})

describe('brief_cta_click', () => {
  it('tracks the button source key without cancelling navigation or changing the href', async () => {
    const followed: boolean[] = []
    window.history.replaceState(null, '', '/fees/compare-by-item-price')
    await act(async () => { root.render(
      <BriefSignupLink source={PAGE} onClick={() => { followed.push(true) }}>Get the free Brief</BriefSignupLink>,
    ) })
    const anchor = container.querySelector('a')!
    expect(anchor.getAttribute('href')).toBe(`/newsletter?source=${PAGE}#subscribe`)
    expect(clickLink(anchor)).toBe(false)
    expect(followed).toEqual([true])
    expect(analytics.track).toHaveBeenCalledTimes(1)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: PAGE })
    expect(anchor.getAttribute('href')).toBe(`/newsletter?source=${PAGE}#subscribe`)
  })

  it('keeps an incoming ?source on the href and still counts the button key', async () => {
    expect(await mount('/fees/compare-by-item-price?source=tiktok')).toBe('/newsletter?source=tiktok#subscribe')
    const anchor = container.querySelector('a')!
    expect(clickLink(anchor)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: PAGE })
    expect(anchor.getAttribute('href')).toBe('/newsletter?source=tiktok#subscribe')
  })

  it('still runs the link click when analytics throws', async () => {
    analytics.track.mockImplementation(() => { throw new Error('analytics down') })
    const followed: boolean[] = []
    await act(async () => { root.render(
      <BriefSignupLink source="campaign_cta_news" onClick={() => { followed.push(true) }}>Subscribe Free</BriefSignupLink>,
    ) })
    expect(clickLink(container.querySelector('a')!)).toBe(false)
    expect(followed).toEqual([true])
    expect(container.querySelector('a')!.getAttribute('href')).toBe('/newsletter?source=campaign_cta_news#subscribe')
  })

  it('BriefCta tracks its signup link once and leaves the sponsor link alone', async () => {
    await act(async () => { root.render(<BriefCta source="campaign_home_latest" />) })
    const signup = container.querySelector('a[data-cta="brief_signup"]') as HTMLAnchorElement
    const sponsor = container.querySelector('a[data-cta="sponsor_brief"]') as HTMLAnchorElement
    expect(signup.getAttribute('href')).toBe('/newsletter?source=campaign_home_latest#subscribe')
    expect(clickLink(signup)).toBe(false)
    expect(analytics.track).toHaveBeenCalledTimes(1)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_home_latest' })
    analytics.track.mockClear()
    clickLink(sponsor)
    expect(analytics.track).not.toHaveBeenCalled()
  })

  it('header and footer buttons count their own keys, including a page-specific header key', async () => {
    await act(async () => { root.render(<PremiumSiteHeader />) })
    const desktop = [...container.querySelectorAll('a')].find(a => a.textContent?.includes('Get the daily brief'))!
    expect(desktop.getAttribute('href')).toBe('/newsletter?source=campaign_cta_header#subscribe')
    expect(clickLink(desktop)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_cta_header' })

    await act(async () => { (container.querySelector('button[aria-controls="site-mobile-navigation"]') as HTMLButtonElement).click() })
    const mobile = container.querySelector('#site-mobile-navigation a[href^="/newsletter"]') as HTMLAnchorElement
    let menuPrevented = false
    await act(async () => { menuPrevented = clickLink(mobile) })
    expect(menuPrevented).toBe(false)
    expect(container.querySelector('#site-mobile-navigation')).toBeNull()
    expect(analytics.track).toHaveBeenCalledTimes(2)

    analytics.track.mockClear()
    window.history.replaceState(null, '', '/intelligence/analysis/ebay-watch-fees-2026-15-percent-to-1000?source=tiktok')
    act(() => root.unmount()); root = createRoot(container)
    await act(async () => { root.render(<PremiumSiteHeader ctaHref="/newsletter?source=campaign_kw_ebay_watches#subscribe" />) })
    const articleHeader = [...container.querySelectorAll('a')].find(a => a.textContent?.includes('Get the daily brief'))!
    expect(articleHeader.getAttribute('href')).toBe('/newsletter?source=tiktok#subscribe')
    expect(clickLink(articleHeader)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_kw_ebay_watches' })

    analytics.track.mockClear()
    act(() => root.unmount()); root = createRoot(container)
    await act(async () => { root.render(<PremiumSiteFooter />) })
    const footer = [...container.querySelectorAll('a')].find(a => a.textContent?.includes('Get the daily brief'))!
    // The visit's incoming source rewrites the href; the click still counts as the footer button.
    expect(footer.getAttribute('href')).toBe('/newsletter?source=tiktok#subscribe')
    expect(clickLink(footer)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_cta_footer' })
  })

  it('an Etsy analysis inline Brief signup counts campaign_etsy_ddp', async () => {
    const article = ANALYSIS_ARTICLES.find(a => a.slug === 'etsy-ddp-us-orders-2026-duty-paid-pricing')!
    window.history.replaceState(null, '', `/intelligence/analysis/${article.slug}`)
    const { default: Page } = await import('@/app/intelligence/analysis/[slug]/page')
    const element = await Page({ params: Promise.resolve({ slug: article.slug }) })
    await act(async () => { root.render(element) })
    const signup = container.querySelector('a[data-cta="brief_signup"][href="/newsletter?source=campaign_etsy_ddp#subscribe"]') as HTMLAnchorElement
    expect(signup).toBeTruthy()
    expect(container.querySelector('#related-reading')).toBeTruthy()
    expect(clickLink(signup)).toBe(false)
    expect(analytics.track).toHaveBeenCalledTimes(1)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_etsy_ddp' })
    expect(signup.getAttribute('href')).toBe('/newsletter?source=campaign_etsy_ddp#subscribe')
  })

  it('an analysis article sidebar click counts that article key and keeps its signup url', async () => {
    const article = ANALYSIS_ARTICLES.find(a => a.newsletterSource === 'campaign_kw_ebay_watches')!
    window.history.replaceState(null, '', `/intelligence/analysis/${article.slug}`)
    const { default: Page } = await import('@/app/intelligence/analysis/[slug]/page')
    const element = await Page({ params: Promise.resolve({ slug: article.slug }) })
    await act(async () => { root.render(element) })
    const sidebar = [...container.querySelectorAll('a')].find(a => a.textContent?.includes('Subscribe free'))!
    expect(sidebar.getAttribute('href')).toBe('/newsletter?source=campaign_kw_ebay_watches#subscribe')
    expect(sidebar.getAttribute('data-cta')).toBe('brief_signup')
    expect(clickLink(sidebar)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: 'campaign_kw_ebay_watches' })
    expect(sidebar.getAttribute('href')).toBe('/newsletter?source=campaign_kw_ebay_watches#subscribe')
  })
})
