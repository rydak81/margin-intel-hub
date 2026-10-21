// Sponsored tool listing: one paid, clearly labelled tool card shown next to our
// recommended tools on fee, fee-comparison, guide and repricer pages. Driven by
// env so a booking can be switched on without a code change; renders nothing
// unless SPONSORED_LISTING_NAME and an http(s) SPONSORED_LISTING_URL are set.
//
//   SPONSORED_LISTING_NAME          required  sponsor / tool name
//   SPONSORED_LISTING_URL           required  http(s) destination; UTM-tagged (medium=listing) unless already tagged
//   SPONSORED_LISTING_BLURB         optional  one-line description
//   SPONSORED_LISTING_CATEGORY      optional  small label above the name, e.g. "Repricing"
//   SPONSORED_LISTING_CTA           optional  link text (default "Visit {name}")
//   SPONSORED_LISTING_MARKETPLACES  optional  comma list (amazon, walmart, ebay, etsy, tiktok-shop, shopify); default all
//   SPONSORED_LISTING_PAGES         optional  comma list (fees, compare, guides, repricer); default all
// A list that is set but has no recognised entries hides the listing (fails closed)
// rather than widening a targeted booking to every page or marketplace.
//   SPONSORED_LISTING_START         optional  YYYY-MM-DD, first day shown (America/New_York, inclusive)
//   SPONSORED_LISTING_ENDS          optional  YYYY-MM-DD, last day shown (America/New_York, inclusive)
import { withUtm } from '@/lib/utm'
import { isWithinSponsorWindow, readSponsorWindow, type SponsorWindow } from '@/lib/sponsor-window'

export const LISTING_PAGES = ['fees', 'compare', 'guides', 'repricer'] as const
export type ListingPage = (typeof LISTING_PAGES)[number]

export interface SponsoredListing {
  name: string
  url: string
  blurb?: string
  category?: string
  ctaText: string
  /** null = every marketplace */
  marketplaces: string[] | null
  pages: ListingPage[]
  window: SponsorWindow
}

/** What the client card needs. Dates travel with it so a statically built page still starts/stops on time. */
export type SponsoredListingView = Pick<SponsoredListing, 'name' | 'url' | 'blurb' | 'category' | 'ctaText' | 'window'>

export const LISTING_MARKETPLACES = ['amazon', 'walmart', 'ebay', 'etsy', 'tiktok-shop', 'shopify'] as const

const list = (value: string | undefined) =>
  (value ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

/** undefined = unset or blank (use the default); [] = set but nothing recognised. */
function allowList<T extends string>(value: string | undefined, allowed: readonly T[]): T[] | undefined {
  const raw = list(value)
  if (!raw.length) return undefined
  return raw.filter((v): v is T => (allowed as readonly string[]).includes(v))
}

/** Parsed, absolute http(s) URL, or null. */
function safeHttpUrl(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    if ((u.protocol !== 'http:' && u.protocol !== 'https:') || !u.hostname) return null
    return u.toString()
  } catch {
    return null
  }
}

export function getSponsoredListing(env: Record<string, string | undefined> = process.env): SponsoredListing | null {
  const name = env.SPONSORED_LISTING_NAME?.trim()
  const url = safeHttpUrl(env.SPONSORED_LISTING_URL?.trim())
  if (!name || !url) return null
  const window = readSponsorWindow(env.SPONSORED_LISTING_START, env.SPONSORED_LISTING_ENDS)
  if (!window) return null // misconfigured dates: hide rather than run indefinitely
  const marketplaces = allowList(env.SPONSORED_LISTING_MARKETPLACES, LISTING_MARKETPLACES)
  const pages = allowList(env.SPONSORED_LISTING_PAGES, LISTING_PAGES)
  if (marketplaces?.length === 0 || pages?.length === 0) return null // typo'd targeting: hide, don't widen
  return {
    name,
    url,
    blurb: env.SPONSORED_LISTING_BLURB?.trim() || undefined,
    category: env.SPONSORED_LISTING_CATEGORY?.trim() || undefined,
    ctaText: env.SPONSORED_LISTING_CTA?.trim() || `Visit ${name}`,
    marketplaces: marketplaces ?? null,
    pages: pages ?? [...LISTING_PAGES],
    window,
  }
}

/**
 * The listing to render on one page, or null. `marketplaces` is the page's
 * marketplace context (one for a fee page, two for a comparison, none for guides
 * and the repricer hub). Pages without a marketplace ignore the marketplace filter.
 * A listing whose end date has already passed is dropped here; the start date and
 * any end date still ahead are enforced again in the browser, because these pages
 * are statically generated.
 */
export function sponsoredListingFor(
  page: ListingPage,
  marketplaces: string[] = [],
  options: { env?: Record<string, string | undefined>; now?: Date } = {},
): SponsoredListingView | null {
  const listing = getSponsoredListing(options.env)
  if (!listing || !listing.pages.includes(page)) return null
  if (listing.marketplaces && marketplaces.length && !marketplaces.some(m => listing.marketplaces!.includes(m.toLowerCase()))) return null
  if (listing.window.end && !isWithinSponsorWindow({ end: listing.window.end }, options.now)) return null
  return {
    name: listing.name,
    url: withUtm(listing.url, 'listing', { content: page }),
    blurb: listing.blurb,
    category: listing.category,
    ctaText: listing.ctaText,
    window: listing.window,
  }
}
