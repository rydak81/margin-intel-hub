/**
 * Single source of truth for the site's Organization entity.
 *
 * The full Organization node is rendered once, in the root layout, so it is present on
 * every page. Every Article / NewsArticle / Dataset points at it with `{ "@id": ... }`
 * instead of embedding its own copy, so crawlers see one publisher entity.
 *
 * `sameAs` is intentionally absent until the brand's social accounts exist. Do not add
 * placeholder profile URLs.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

/** Reference to the Organization node; use as `publisher` / `creator`. */
export const ORGANIZATION_REF = { '@id': ORGANIZATION_ID } as const

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'MarketplaceBeta',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-192.png`, width: 192, height: 192 },
    description: 'Source-linked, dated ecommerce intelligence for Amazon, Walmart, TikTok Shop, eBay and Etsy sellers: seller fee tables, operator analysis and a public forecast ledger.',
    knowsAbout: ['Amazon seller fees', 'Etsy seller fees', 'eBay seller fees', 'Walmart Marketplace fees', 'TikTok Shop fees', 'US tariffs and de minimis for small sellers', 'Parcel shipping surcharges', 'Ecommerce unit economics'],
    publishingPrinciples: `${SITE_URL}/editorial-policy`,
    contactPoint: { '@type': 'ContactPoint', contactType: 'sponsorships and partnerships', url: `${SITE_URL}/sponsor#inquiry` },
  }
}
