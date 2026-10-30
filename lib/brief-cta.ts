// Shared Daily Marketplace Brief signup + "Sponsor the Brief" call to action.
// Every newsletter link built here carries a per-page-type attribution key that
// passes lib/newsletter-source.ts (campaign_<slug>, max 64 chars).
import { SPONSOR_OFFER_DEFS } from '@/lib/sponsor-offers'
import { newsletterSource } from '@/lib/newsletter-source'

export type CampaignSourceKey = `campaign_${string}`

const MAX_KEY = 64

/** Normalize a slug part to [a-z0-9_-] and collapse separators. */
function cleanPart(part: string): string {
  return part.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/_{2,}/g, '_').replace(/^[_-]+|[_-]+$/g, '')
}

/**
 * Build a `campaign_cta_<part>_<part>...` key. Parts are normalized and the
 * result is clipped to the 64-char allowlist limit (never ending on a separator).
 */
export function briefCtaSource(...parts: string[]): CampaignSourceKey {
  const body = ['cta', ...parts.map(cleanPart).filter(Boolean)].join('_')
  let key = `campaign_${body}`.slice(0, MAX_KEY)
  key = key.replace(/[_-]+$/, '')
  return key as CampaignSourceKey
}

/** Newsletter signup URL for an attribution key. */
export function briefSignupHref(source: string): string {
  return `/newsletter?source=${source}#subscribe`
}

export const SPONSOR_CTA_HREF = '/sponsor#inquiry'

const priceValue = (price: string) => Number(price.replace(/[^0-9.]/g, ''))

/** Lowest sponsorship price from lib/sponsor-offers.ts, e.g. "$39". */
export function sponsorFromPrice(): string {
  const priced = SPONSOR_OFFER_DEFS.filter(o => Number.isFinite(priceValue(o.price)) && priceValue(o.price) > 0)
  return priced.reduce((min, o) => (priceValue(o.price) < priceValue(min.price) ? o : min), priced[0]).price
}

export const SPONSOR_CTA_LABEL = `Sponsor the Brief from ${sponsorFromPrice()}`

/** Keys for pages without an existing campaign_kw_* / fixed key. */
export const BRIEF_CTA_KEYS = {
  feeHub: briefCtaSource('fee_hub'),
  feeChangelog: briefCtaSource('fee_changelog'),
  feeMarketplace: (marketplace: string) => briefCtaSource('fee', marketplace),
  feeCategory: (marketplace: string) => briefCtaSource('fee_cat', marketplace),
  feeSale: (marketplace: string) => briefCtaSource('fee_sale', marketplace),
  feeCompare: (pair: string) => briefCtaSource('fee_compare', pair),
  articles: briefCtaSource('articles'),
  news: briefCtaSource('news'),
  guidesHub: briefCtaSource('guides'),
  guide: (slug: string) => briefCtaSource('guide', slug),
} as const

/** Sitewide chrome keys: header "Get the daily brief" button and footer link. */
export const HEADER_BRIEF_SOURCE = briefCtaSource('header')
export const FOOTER_BRIEF_SOURCE = briefCtaSource('footer')
export const HEADER_BRIEF_HREF = briefSignupHref(HEADER_BRIEF_SOURCE)
export const FOOTER_BRIEF_HREF = briefSignupHref(FOOTER_BRIEF_SOURCE)

// ---------------------------------------------------------------------------
// Source pass-through. A visitor who lands with ?source=<key> (e.g. a video
// caption link ?source=tiktok) keeps that key on the page's Brief signup CTAs,
// as long as it passes the lib/newsletter-source.ts allowlist. Server render
// always uses the page default; the swap happens on the client after mount,
// so crawlers and canonical URLs never see the query.
// ---------------------------------------------------------------------------

/** sessionStorage key that remembers the visit's incoming source. */
export const BRIEF_SOURCE_STORAGE_KEY = 'mb_brief_source'

const ATTRIBUTION_PREFIX = 'newsletter_'

/** Allowlisted key from a URL search string (`source`, else `utm_source`), or null. */
export function incomingBriefSource(search: string): string | null {
  const attribution = newsletterSource(search)
  if (attribution === 'newsletter_page') return null
  return attribution.slice(ATTRIBUTION_PREFIX.length)
}

/** True when a stored or passed key is on the allowlist. */
export function isAllowedBriefSource(key: string | null | undefined): key is string {
  if (!key) return false
  return incomingBriefSource(`?source=${encodeURIComponent(key)}`) === key
}

/**
 * Pick the key for a page's Brief CTA: a valid incoming ?source on this URL,
 * else a valid key remembered earlier in the visit, else the page default.
 */
export function resolveBriefSource(pageDefault: string, search: string, stored?: string | null): string {
  return incomingBriefSource(search) ?? (isAllowedBriefSource(stored) ? stored : pageDefault)
}

/**
 * Rewrite the `source` of a /newsletter link to `source`, keeping its hash.
 * Non-newsletter links are returned unchanged.
 */
export function withBriefSource(href: string, source: string): string {
  const [pathAndQuery, hash = 'subscribe'] = href.split('#')
  const [path] = pathAndQuery.split('?')
  if (path !== '/newsletter') return href
  return `/newsletter?source=${source}#${hash}`
}
