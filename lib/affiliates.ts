// Affiliate offers for seller tools recommended across fee, guide and tool pages.
// Reuses the SponsorTopic vocabulary from lib/sponsors.ts so sponsor modules and
// affiliate blocks target content the same way.
//
// Each URL comes from a NEXT_PUBLIC_AFF_* env var (the tracked affiliate link) and
// falls back to the vendor's plain homepage when unset. The env vars are referenced
// literally so Next.js can inline them in client bundles.
import type { SponsorTopic } from '@/lib/sponsors'
import type { MarketplaceSlug } from '@/lib/marketplace-fees'

export type AffiliateMarketplace = MarketplaceSlug | 'shopify'

export interface AffiliateOffer {
  id: string
  name: string
  category: string
  blurb: string
  envVar: string
  fallbackUrl: string
  url: string
  /** URL configuration only; not proof of merchant approval, attribution or payouts. */
  affiliateLinkConfigured: boolean
  marketplaces: AffiliateMarketplace[]
  topics: SponsorTopic[]
}

export function affiliateDestination(value: string | undefined, fallback: string): Pick<AffiliateOffer, 'url' | 'affiliateLinkConfigured'> {
  const direct = { url: fallback, affiliateLinkConfigured: false }
  if (!value?.trim()) return direct
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.username || url.password) return direct
    if (url.href === new URL(fallback).href) return direct
    return { url: url.href, affiliateLinkConfigured: true }
  } catch { return direct }
}

type OfferSeed = Omit<AffiliateOffer, 'url' | 'affiliateLinkConfigured'>

const SEEDS: { seed: OfferSeed; value: string | undefined }[] = [
  {
    value: process.env.NEXT_PUBLIC_AFF_HELIUM10_URL,
    seed: {
      id: 'helium10', name: 'Helium 10', category: 'Product & keyword research',
      blurb: 'Product research, keyword tracking and listing tools for marketplace sellers.',
      envVar: 'NEXT_PUBLIC_AFF_HELIUM10_URL', fallbackUrl: 'https://www.helium10.com/',
      marketplaces: ['amazon', 'walmart', 'tiktok-shop'], topics: ['tools', 'amazon', 'walmart', 'advertising'],
    },
  },
  {
    value: process.env.NEXT_PUBLIC_AFF_JUNGLESCOUT_URL,
    seed: {
      id: 'junglescout', name: 'Jungle Scout', category: 'Product research',
      blurb: 'Demand estimates and product research to size a niche before you buy inventory.',
      envVar: 'NEXT_PUBLIC_AFF_JUNGLESCOUT_URL', fallbackUrl: 'https://www.junglescout.com/',
      marketplaces: ['amazon', 'walmart'], topics: ['tools', 'amazon', 'walmart', 'market'],
    },
  },
  {
    value: process.env.NEXT_PUBLIC_AFF_A2X_URL,
    seed: {
      id: 'a2x', name: 'A2X', category: 'Marketplace accounting',
      blurb: 'Turns marketplace payouts into clean accounting entries so fees reconcile to the cent.',
      envVar: 'NEXT_PUBLIC_AFF_A2X_URL', fallbackUrl: 'https://www.a2xaccounting.com/',
      marketplaces: ['amazon', 'walmart', 'ebay', 'etsy', 'tiktok-shop', 'shopify'], topics: ['profitability', 'tools'],
    },
  },
  {
    value: process.env.NEXT_PUBLIC_AFF_LINKMYBOOKS_URL,
    seed: {
      id: 'linkmybooks', name: 'Link My Books', category: 'Marketplace accounting',
      blurb: 'Automated bookkeeping for marketplace sales, fees and refunds.',
      envVar: 'NEXT_PUBLIC_AFF_LINKMYBOOKS_URL', fallbackUrl: 'https://linkmybooks.com/',
      marketplaces: ['amazon', 'ebay', 'etsy', 'shopify'], topics: ['profitability', 'tools'],
    },
  },
  {
    value: process.env.NEXT_PUBLIC_AFF_REPRICER_URL,
    seed: {
      id: 'repricer', name: 'Aura Repricer', category: 'Repricing',
      blurb: 'Automated repricing to stay competitive on the Buy Box without racing to the bottom.',
      envVar: 'NEXT_PUBLIC_AFF_REPRICER_URL', fallbackUrl: 'https://goaura.com/',
      marketplaces: ['amazon'], topics: ['tools', 'amazon', 'profitability'],
    },
  },
]

export const AFFILIATE_OFFERS: AffiliateOffer[] = SEEDS.map(({ seed, value }) => ({ ...seed, ...affiliateDestination(value, seed.fallbackUrl) }))

export const AFFILIATE_ENV_VARS = AFFILIATE_OFFERS.map(o => o.envVar)

export function getAffiliateOffer(id: string): AffiliateOffer | undefined {
  return AFFILIATE_OFFERS.find(o => o.id === id)
}

/** Offers relevant to a marketplace (and/or topic), most specific first. */
export function getRecommendedOffers(opts: { marketplace?: string; topic?: SponsorTopic; ids?: string[]; limit?: number } = {}): AffiliateOffer[] {
  const { marketplace, topic, ids, limit = 3 } = opts
  if (ids?.length) return ids.map(getAffiliateOffer).filter((o): o is AffiliateOffer => !!o).slice(0, limit)
  const score = (o: AffiliateOffer) =>
    (marketplace && o.marketplaces.includes(marketplace as AffiliateMarketplace) ? 2 : 0) +
    (topic && o.topics.includes(topic) ? 1 : 0)
  const pool = marketplace ? AFFILIATE_OFFERS.filter(o => o.marketplaces.includes(marketplace as AffiliateMarketplace)) : AFFILIATE_OFFERS
  const base = pool.length ? pool : AFFILIATE_OFFERS
  return [...base].sort((a, b) => score(b) - score(a)).slice(0, limit)
}
