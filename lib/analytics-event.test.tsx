// @vitest-environment jsdom
// Web Analytics beforeSend: a not-found render drops pageviews and custom events;
// a normal page still sends them with a scrubbed URL. Covers client navigation
// away from a 404, where the marker unmounts and the next pageview must count.
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const analytics = vi.hoisted(() => ({
  beforeSend: undefined as ((event: { url: string; type?: string; payload?: unknown }) => { url: string } | null) | undefined,
}))

vi.mock('@vercel/analytics/next', () => ({
  Analytics: (props: { beforeSend?: typeof analytics.beforeSend }) => {
    analytics.beforeSend = props.beforeSend
    return null
  },
}))
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ children, href, className, onClick }: { children?: React.ReactNode; href?: string; className?: string; onClick?: React.MouseEventHandler }) =>
    <a href={href} className={className} onClick={onClick}>{children}</a>,
}))

import { SiteAnalytics } from '@/components/site-analytics'
import RootNotFound from '@/app/not-found'
import ManufacturingNotFound from '@/app/desktop-manufacturing/not-found'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const PAGE_URL = 'https://marketplacebeta.com/articles?q=private+search&utm_source=chatgpt.com&source=campaign_cta_header#x'
const PAGE_SCRUBBED = 'https://marketplacebeta.com/articles?utm_source=chatgpt.com&source=campaign_cta_header'
const SIGNUP_URL = 'https://marketplacebeta.com/newsletter?source=campaign_cta_header&email=a%40b.com#subscribe'
const SIGNUP_SCRUBBED = 'https://marketplacebeta.com/newsletter?source=campaign_cta_header'

const pageview = { type: 'pageview' as const, url: PAGE_URL }
const newsletterSignup = {
  type: 'event' as const,
  url: SIGNUP_URL,
  payload: { name: 'newsletter_signup', data: { resource: 'newsletter_campaign_cta_header' } },
}
const briefClick = {
  type: 'event' as const,
  url: PAGE_URL,
  payload: { name: 'brief_cta_click', data: { resource: 'campaign_cta_header' } },
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function show(page: React.ReactNode) {
  act(() => { root.render(<><SiteAnalytics />{page}</>) })
  if (!analytics.beforeSend) throw new Error('SiteAnalytics did not pass beforeSend')
  return analytics.beforeSend
}

describe('analytics on not-found pages', () => {
  it('drops a pageview and custom events while a 404 page is rendered', () => {
    for (const page of [<RootNotFound key="root" />, <ManufacturingNotFound key="desk" />]) {
      const beforeSend = show(page)
      expect(container.querySelector('[data-analytics-not-found]')).toBeTruthy()
      expect(beforeSend(pageview)).toBeNull()
      expect(beforeSend(newsletterSignup)).toBeNull()
      expect(beforeSend(briefClick)).toBeNull()
    }
  })

  it('sends a normal pageview with a scrubbed URL', () => {
    const beforeSend = show(<main>Home</main>)
    expect(container.querySelector('[data-analytics-not-found]')).toBeNull()
    expect(beforeSend(pageview)).toEqual({ type: 'pageview', url: PAGE_SCRUBBED })
    expect(beforeSend({ type: 'pageview', url: 'not a url' })).toBeNull()
  })

  it('sends a custom event on a normal page', () => {
    const beforeSend = show(<main>Newsletter</main>)
    expect(beforeSend(newsletterSignup)).toEqual({ ...newsletterSignup, url: SIGNUP_SCRUBBED })
    expect(beforeSend(briefClick)).toEqual({ ...briefClick, url: PAGE_SCRUBBED })
  })

  it('sends the pageview again after a client navigation away from a 404', () => {
    const beforeSend = show(<RootNotFound />)
    expect(beforeSend(pageview)).toBeNull()
    show(<main>Home</main>)
    expect(container.querySelector('[data-analytics-not-found]')).toBeNull()
    expect(beforeSend(pageview)).toEqual({ type: 'pageview', url: PAGE_SCRUBBED })
    expect(beforeSend(newsletterSignup)).toEqual({ ...newsletterSignup, url: SIGNUP_SCRUBBED })
  })
})
