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

export interface SectionListItem {
  name: string
  /** Site path (optional hash) or an absolute URL. */
  path: string
}

export interface SectionCrumb {
  name: string
  path: string
}

/** Absolute URL for a site path, preserving a hash. Absolute URLs pass through. */
export function absoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const hashAt = path.indexOf('#')
  const hash = hashAt >= 0 ? path.slice(hashAt) : ''
  const pathname = hashAt >= 0 ? path.slice(0, hashAt) : path
  const normalized = pathname === '/' || pathname === '' ? '' : (pathname.startsWith('/') ? pathname : `/${pathname}`)
  return `${SITE_URL}${normalized}${hash}`
}

/**
 * Section hub graph: a CollectionPage whose ItemList is the items the page
 * actually lists, plus a BreadcrumbList. Same shape as the analysis index.
 */
export function sectionPageJsonLd(input: {
  name: string
  description?: string
  path: string
  items: SectionListItem[]
  breadcrumbs: SectionCrumb[]
}) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
      url: absoluteSiteUrl(input.path),
      isPartOf: { '@type': 'WebSite', name: 'MarketplaceBeta', url: SITE_URL },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: input.items.length,
        itemListElement: input.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: absoluteSiteUrl(item.path),
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteSiteUrl(crumb.path),
      })),
    },
  ]
}

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
