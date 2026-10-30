// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BriefSignupLink } from './brief-signup-link'
import { BRIEF_SOURCE_STORAGE_KEY } from '@/lib/brief-cta'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const PAGE = 'campaign_kw_marketplace_fee_comparison'
let container: HTMLDivElement
let root: Root

const mount = async (url: string) => {
  window.history.replaceState(null, '', url)
  await act(async () => { root.render(<BriefSignupLink source={PAGE}>Get the free Brief</BriefSignupLink>) })
  return container.querySelector('a')!.getAttribute('href')
}

beforeEach(() => { sessionStorage.clear(); container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove() })

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
