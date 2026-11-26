// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsHolidayCallout } from '@/components/news-holiday-callout'
import { HOLIDAY_HUB_DESCRIPTION, HOLIDAY_HUB_PATH, HOLIDAY_HUB_TITLE } from '@/lib/holiday-hub'
import { NEWS_HOLIDAY_CALLOUT_THROUGH, NEWS_HOLIDAY_SOURCE, newsHolidayHubVisible } from '@/lib/news-holiday-callout'
import { newsletterSource } from '@/lib/newsletter-source'

const analytics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@vercel/analytics', () => ({ track: analytics.track }))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

/** 2026-12-31 23:59 America/New_York (EST, UTC-5). */
const LAST_MINUTE = new Date('2027-01-01T04:59:00Z')
/** 2027-01-01 00:00 America/New_York. */
const NEXT_DAY = new Date('2027-01-01T05:00:00Z')

const markup = (now: Date) => renderToStaticMarkup(<NewsHolidayCallout now={now} />)

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  analytics.track.mockReset()
  window.history.replaceState(null, '', '/news/art_mkztjc')
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove() })

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

describe('news holiday callout date gate', () => {
  it('keeps the hub link through the last minute of 2026-12-31 in New York', () => {
    expect(NEWS_HOLIDAY_CALLOUT_THROUGH).toBe('2026-12-31')
    expect(newsHolidayHubVisible(new Date('2026-11-26T15:00:00Z'))).toBe(true)
    expect(newsHolidayHubVisible(new Date('2027-01-01T04:59:00Z'))).toBe(true)
    expect(newsHolidayHubVisible(LAST_MINUTE)).toBe(true)
  })

  it('drops the hub link at 2027-01-01 in New York, including when UTC is already the next day', () => {
    expect(newsHolidayHubVisible(new Date('2027-01-01T03:30:00Z'))).toBe(true)
    expect(newsHolidayHubVisible(NEXT_DAY)).toBe(false)
    expect(newsHolidayHubVisible(new Date('2027-01-01T15:00:00Z'))).toBe(false)
  })
})

describe('news holiday callout HTML', () => {
  it('server-renders the hub title, hub description, and newsletter CTA', () => {
    const html = markup(LAST_MINUTE)
    expect(html).toContain('id="news-holiday-hub"')
    expect(html).toContain(HOLIDAY_HUB_TITLE.replace(/&/g, '&amp;'))
    expect(html).toContain(`href="${HOLIDAY_HUB_PATH}"`)
    expect(html).toContain('data-cta="holiday_hub"')
    expect(html).toContain(HOLIDAY_HUB_DESCRIPTION)
    expect(html).toContain(`href="/newsletter?source=${NEWS_HOLIDAY_SOURCE}#subscribe"`)
    expect(html).toContain('data-cta="brief_signup"')
    expect(newsletterSource(`?source=${NEWS_HOLIDAY_SOURCE}`)).toBe(`newsletter_${NEWS_HOLIDAY_SOURCE}`)
    expect(html).not.toMatch(/keepa|everbee|supabase|\bCPI\b|probabilit/i)
  })

  it('keeps only the newsletter CTA after the gate date', () => {
    const html = markup(NEXT_DAY)
    expect(html).not.toContain('id="news-holiday-hub"')
    expect(html).not.toContain(HOLIDAY_HUB_PATH)
    expect(html).not.toContain(HOLIDAY_HUB_DESCRIPTION)
    expect(html).toContain(`href="/newsletter?source=${NEWS_HOLIDAY_SOURCE}#subscribe"`)
    expect(html).toContain('data-cta="brief_signup"')
  })

  it('sits after the executive summary and before Original Source on the briefing template', () => {
    const src = readFileSync(join(process.cwd(), 'app/news/[id]/page.tsx'), 'utf8')
    const summary = src.indexOf('Executive Summary')
    const callout = src.indexOf('<NewsHolidayCallout')
    const original = src.indexOf('Original Source')
    expect(summary).toBeGreaterThan(-1)
    expect(callout).toBeGreaterThan(summary)
    expect(original).toBeGreaterThan(callout)
  })
})

describe('news holiday callout clicks', () => {
  it('counts the hub link and the newsletter button as brief_cta_click with resource news_holiday', async () => {
    await act(async () => { root.render(<NewsHolidayCallout now={LAST_MINUTE} />) })
    const hub = container.querySelector('a[data-cta="holiday_hub"]') as HTMLAnchorElement
    const signup = container.querySelector('a[data-cta="brief_signup"]') as HTMLAnchorElement
    expect(hub.getAttribute('href')).toBe(HOLIDAY_HUB_PATH)
    expect(signup.getAttribute('href')).toBe(`/newsletter?source=${NEWS_HOLIDAY_SOURCE}#subscribe`)
    expect(clickLink(hub)).toBe(false)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: NEWS_HOLIDAY_SOURCE })
    analytics.track.mockClear()
    expect(clickLink(signup)).toBe(false)
    expect(analytics.track).toHaveBeenCalledTimes(1)
    expect(analytics.track).toHaveBeenCalledWith('brief_cta_click', { resource: NEWS_HOLIDAY_SOURCE })
    expect(signup.getAttribute('href')).toBe(`/newsletter?source=${NEWS_HOLIDAY_SOURCE}#subscribe`)
  })

  it('leaves the hub link clickable when analytics throws', async () => {
    analytics.track.mockImplementation(() => { throw new Error('analytics down') })
    await act(async () => { root.render(<NewsHolidayCallout now={LAST_MINUTE} />) })
    const hub = container.querySelector('a[data-cta="holiday_hub"]') as HTMLAnchorElement
    expect(clickLink(hub)).toBe(false)
    expect(hub.getAttribute('href')).toBe(HOLIDAY_HUB_PATH)
  })
})
