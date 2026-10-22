import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SponsoredToolListing } from './sponsored-tool-listing'

const view = { name: 'Acme <b>', url: 'https://acme.test/?utm_source=marketplacebeta&utm_medium=listing', blurb: 'Reprice to a margin floor.', category: 'Repricing', ctaText: 'Visit Acme', window: {} }

describe('SponsoredToolListing', () => {
  it('renders nothing without a listing', () => {
    expect(renderToStaticMarkup(<SponsoredToolListing listing={null} placement="fees-amazon" />)).toBe('')
  })
  it('renders a labelled, escaped card with a sponsored link', () => {
    const html = renderToStaticMarkup(<SponsoredToolListing listing={view} placement="fees-amazon" />)
    expect(html).toContain('>Sponsored<')
    expect(html).toContain('Acme &lt;b&gt;')
    expect(html).toContain('rel="sponsored nofollow noopener"')
    expect(html).toContain('href="https://acme.test/?utm_source=marketplacebeta&amp;utm_medium=listing"')
    expect(html).toContain('Reprice to a margin floor.')
    expect(html).toContain('Visit Acme')
  })
  it('a dated listing waits for the browser clock instead of rendering on the server', () => {
    const dated = { ...view, window: { start: '2026-11-09', end: '2026-12-08' } }
    expect(renderToStaticMarkup(<SponsoredToolListing listing={dated} placement="fees-amazon" />)).toBe('')
  })
})
