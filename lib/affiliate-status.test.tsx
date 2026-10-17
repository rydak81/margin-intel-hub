import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { affiliateDestination } from './affiliates'
import { RecommendedTools } from '@/components/recommended-tools'
import { trackResourceEvent } from './resource-analytics'
vi.mock('./resource-analytics', () => ({ trackResourceEvent: vi.fn() }))
const fallback = 'https://vendor.example/'
const offer = (configured: boolean, id = 'fixture') => ({ id, name: 'Fixture', category: 'Tools', blurb: 'Synthetic fixture', url: fallback, affiliateLinkConfigured: configured })

describe('affiliate destination configuration', () => {
  it.each([undefined, '', '   ', fallback, 'https://vendor.example', 'https://', 'javascript:alert(1)', 'http://vendor.example/?ref=fixture', 'https://user:secret@vendor.example/'])('does not report a usable affiliate URL for %s', value => {
    expect(affiliateDestination(value, fallback)).toEqual({ url: fallback, affiliateLinkConfigured: false })
  })
  it('preserves merchant-issued referral parameters without claiming approval', () => {
    const url = 'https://partner.example/ref/fixture?partner=sample%2Btag&campaign=guide#offer'
    expect(affiliateDestination(` ${url} `, fallback)).toEqual({ url, affiliateLinkConfigured: true })
  })
})

describe('recommendation disclosure and analytics', () => {
  it('does not claim affiliate links when every destination is a fallback', () => {
    const html = renderToStaticMarkup(<RecommendedTools offers={[offer(false)]} placement="fixture" />)
    expect(html).toContain('direct vendor links')
    expect(html).not.toContain('may earn')
    expect(html).not.toContain('sponsored')
  })
  it('identifies individual affiliate links in a mixed list', () => {
    const html = renderToStaticMarkup(<RecommendedTools offers={[offer(false), offer(true, 'tracked')]} placement="fixture" />)
    expect(html.match(/\(affiliate link\)/g)).toHaveLength(1)
    expect(html.match(/sponsored/g)).toHaveLength(1)
    expect(html).toContain('may earn')
  })
  it.each([false, true])('keeps direct vendor clicks out of affiliate analytics: %s', configured => {
    vi.mocked(trackResourceEvent).mockClear()
    const tree = RecommendedTools({ offers: [offer(configured)], placement: 'fixture' })!
    const ul = tree.props.children[1]
    const anchor = ul.props.children[0].props.children[3]
    anchor.props.onClick()
    expect(trackResourceEvent).toHaveBeenCalledWith(configured ? 'affiliate_click' : 'vendor_link_click', 'fixture:fixture')
  })
})
