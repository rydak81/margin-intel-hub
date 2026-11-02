// @vitest-environment jsdom
// Renders the real /newsletter page and homepage-style submit flow with fetch
// and @vercel/analytics mocked: checks the source sent to /api/subscribe and
// that newsletter_signup is tracked (only) after a successful signup.
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_SOURCE_STORAGE_KEY } from '@/lib/brief-cta'

const analytics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@vercel/analytics', () => ({ track: analytics.track }))
vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))
vi.mock('next/image', () => ({ default: () => null }))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root
const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  vi.stubGlobal('fetch', fetchMock)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })

function setInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

async function submitNewsletterForm(url: string) {
  window.history.replaceState(null, '', url)
  const { default: NewsletterPage } = await import('@/app/newsletter/page')
  await act(async () => { root.render(<NewsletterPage />) })
  const form = container.querySelector('#subscribe form') as HTMLFormElement
  expect(form).toBeTruthy()
  await act(async () => { setInput(form.querySelector('#email') as HTMLInputElement, 'reader@example.com') })
  await act(async () => { (form.querySelector('[role="button"][aria-pressed]') as HTMLElement).click() })
  await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
  return JSON.parse(fetchMock.mock.calls[0][1].body)
}

const ok = () => ({ ok: true, status: 200, json: async () => ({ success: true }) })

describe('/newsletter#subscribe form', () => {
  it('sends the CTA key from ?source and tracks newsletter_signup with it on success', async () => {
    fetchMock.mockResolvedValue(ok())
    const body = await submitNewsletterForm('/newsletter?source=campaign_cta_fee_amazon#subscribe')
    expect(fetchMock.mock.calls[0][0]).toBe('/api/subscribe')
    expect(body).toMatchObject({ email: 'reader@example.com', role: 'brand_seller', source: 'newsletter_campaign_cta_fee_amazon' })
    expect(analytics.track).toHaveBeenCalledWith('newsletter_signup', { resource: 'newsletter_campaign_cta_fee_amazon' })
    expect(container.textContent).toContain("You're in.")
  })

  it('uses the key remembered for the visit when the URL has none', async () => {
    fetchMock.mockResolvedValue(ok())
    sessionStorage.setItem(BRIEF_SOURCE_STORAGE_KEY, 'campaign_dist_var')
    const body = await submitNewsletterForm('/newsletter')
    expect(body.source).toBe('newsletter_campaign_dist_var')
    expect(analytics.track).toHaveBeenCalledWith('newsletter_signup', { resource: 'newsletter_campaign_dist_var' })
  })

  it('does not track a signup that failed or was already subscribed, and shows the error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({ success: false, error: 'Signups are temporarily unavailable. Please try again later.' }) })
    await submitNewsletterForm('/newsletter?source=campaign_cta_header#subscribe')
    expect(analytics.track).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Signups are temporarily unavailable')

    act(() => root.unmount()); root = createRoot(container); fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: false, status: 409, json: async () => ({ success: false, error: 'already_subscribed' }) })
    await submitNewsletterForm('/newsletter?source=campaign_cta_header#subscribe')
    expect(analytics.track).not.toHaveBeenCalled()
    expect(container.textContent).toContain("You're already on the list.")
  })
})
