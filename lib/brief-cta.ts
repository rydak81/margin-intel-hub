// Shared Daily Marketplace Brief signup + "Sponsor the Brief" call to action.
// Every newsletter link built here carries a per-page-type attribution key that
// passes lib/newsletter-source.ts (campaign_<slug>, max 64 chars).
import { SPONSOR_OFFER_DEFS } from '@/lib/sponsor-offers'

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
