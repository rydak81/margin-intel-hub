import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { withUtm } from '@/lib/utm'
import { isWithinSponsorWindow, parseSponsorDate, readSponsorWindow } from '@/lib/sponsor-window'
import { getSponsoredListing, sponsoredListingFor } from '@/lib/sponsored-listing'

const base = { SPONSORED_LISTING_NAME: 'Acme Repricer', SPONSORED_LISTING_URL: 'https://acme.test/start' }
const at = (iso: string) => new Date(iso)

test('withUtm adds source/medium/content but never overrides sponsor UTMs', () => {
  assert.equal(withUtm('https://acme.test/start', 'listing', { content: 'fees' }), 'https://acme.test/start?utm_source=marketplacebeta&utm_medium=listing&utm_content=fees')
  const own = withUtm('https://acme.test/?utm_source=newsletter&utm_campaign=nov&x=1#top', 'listing')
  const u = new URL(own)
  assert.equal(u.searchParams.get('utm_source'), 'newsletter')
  assert.equal(u.searchParams.get('utm_campaign'), 'nov')
  assert.equal(u.searchParams.get('utm_medium'), 'listing')
  assert.equal(u.searchParams.get('x'), '1')
  assert.equal(u.hash, '#top')
  assert.equal(withUtm('not a url', 'listing'), 'not a url')
  assert.equal(withUtm('mailto:a@b.test', 'listing'), 'mailto:a@b.test')
})

test('sponsor dates are real YYYY-MM-DD days on the Eastern calendar, inclusive', () => {
  assert.equal(parseSponsorDate(undefined), undefined)
  assert.equal(parseSponsorDate(' '), undefined)
  assert.equal(parseSponsorDate('2026-11-09'), '2026-11-09')
  assert.equal(parseSponsorDate('2026-02-30'), null)
  assert.equal(parseSponsorDate('11/09/2026'), null)
  assert.equal(readSponsorWindow('2026-11-10', '2026-11-09'), null)
  const w = readSponsorWindow('2026-11-09', '2026-12-08')!
  assert.equal(isWithinSponsorWindow(w, at('2026-11-09T05:30:00Z')), true) // 00:30 EST Nov 9
  assert.equal(isWithinSponsorWindow(w, at('2026-11-09T04:30:00Z')), false) // 23:30 EST Nov 8
  assert.equal(isWithinSponsorWindow(w, at('2026-12-09T04:59:00Z')), true) // 23:59 EST Dec 8
  assert.equal(isWithinSponsorWindow(w, at('2026-12-09T05:00:00Z')), false) // Dec 9
  assert.equal(isWithinSponsorWindow({}, at('2030-01-01T00:00:00Z')), true)
})

test('renders nothing unless name and an http(s) URL are set', () => {
  assert.equal(getSponsoredListing({}), null)
  assert.equal(getSponsoredListing({ SPONSORED_LISTING_NAME: 'Acme' }), null)
  assert.equal(getSponsoredListing({ ...base, SPONSORED_LISTING_URL: 'javascript:alert(1)' }), null)
  assert.equal(getSponsoredListing({ ...base, SPONSORED_LISTING_ENDS: 'next week' }), null)
  assert.equal(sponsoredListingFor('fees', ['amazon'], { env: {} }), null)
})

test('reads fields with defaults', () => {
  const l = getSponsoredListing({ ...base, SPONSORED_LISTING_BLURB: ' Reprice to a margin floor. ', SPONSORED_LISTING_CATEGORY: 'Repricing', SPONSORED_LISTING_MARKETPLACES: 'Amazon, walmart', SPONSORED_LISTING_PAGES: 'fees, guides, bogus' })!
  assert.equal(l.blurb, 'Reprice to a margin floor.')
  assert.equal(l.ctaText, 'Visit Acme Repricer')
  assert.deepEqual(l.marketplaces, ['amazon', 'walmart'])
  assert.deepEqual(l.pages, ['fees', 'guides'])
  assert.equal(getSponsoredListing({ ...base, SPONSORED_LISTING_CTA: 'Try it free' })!.ctaText, 'Try it free')
  assert.deepEqual(getSponsoredListing(base)!.pages, ['fees', 'compare', 'guides', 'repricer'])
  assert.equal(getSponsoredListing(base)!.marketplaces, null)
})

test('targets pages and marketplaces', () => {
  const env = { ...base, SPONSORED_LISTING_MARKETPLACES: 'walmart', SPONSORED_LISTING_PAGES: 'fees,compare,guides' }
  assert.equal(sponsoredListingFor('fees', ['amazon'], { env }), null)
  assert.ok(sponsoredListingFor('fees', ['walmart'], { env }))
  assert.ok(sponsoredListingFor('compare', ['amazon', 'walmart'], { env }))
  assert.ok(sponsoredListingFor('guides', [], { env }), 'pages without a marketplace ignore the marketplace filter')
  assert.equal(sponsoredListingFor('repricer', [], { env }), null)
  const view = sponsoredListingFor('fees', ['walmart'], { env })!
  assert.equal(view.url, 'https://acme.test/start?utm_source=marketplacebeta&utm_medium=listing&utm_content=fees')
})

test('a listing past its end date is dropped at render; future and current windows travel to the client', () => {
  const env = { ...base, SPONSORED_LISTING_START: '2026-11-09', SPONSORED_LISTING_ENDS: '2026-12-08' }
  assert.equal(sponsoredListingFor('fees', ['amazon'], { env, now: at('2026-12-10T15:00:00Z') }), null)
  assert.deepEqual(sponsoredListingFor('fees', ['amazon'], { env, now: at('2026-10-21T15:00:00Z') })!.window, { start: '2026-11-09', end: '2026-12-08' })
  assert.ok(sponsoredListingFor('fees', ['amazon'], { env, now: at('2026-11-20T15:00:00Z') }))
})

test('every placement page wires the listing next to the recommended tools', () => {
  for (const [file, page] of [
    ['app/fees/[marketplace]/[category]/page.tsx', 'fees'],
    ['app/fees/compare/[pair]/page.tsx', 'compare'],
    ['app/guides/[slug]/page.tsx', 'guides'],
    ['app/tools/repricer/page.tsx', 'repricer'],
  ]) {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    assert.match(src, new RegExp(`sponsoredListingFor\\(["']${page}["']`), file)
    assert.ok(src.indexOf('<SponsoredToolListing') < src.indexOf('<RecommendedTools'), file)
  }
  const card = readFileSync(new URL('../components/sponsored-tool-listing.tsx', import.meta.url), 'utf8')
  assert.match(card, />Sponsored</)
  assert.match(card, /rel="sponsored nofollow noopener"/)
})
