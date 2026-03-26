// Partner/sponsor configuration for MarketplaceBeta ad placements
// Toggle `active` to enable/disable any placement zone
// All partners are Threecolts family products

export interface SponsorConfig {
  name: string
  tagline: string
  description: string
  ctaText: string
  ctaUrl: string
  logoUrl?: string
  bannerImageUrl?: string
  bannerImageAlt?: string
  backgroundColor: string
  textColor: string
  badge: string // e.g., "Preferred Partner", "Recommended Tool"
}

export interface AdPlacement {
  id: string
  zone: 'top-banner' | 'sidebar' | 'inline' | 'footer'
  sponsor: SponsorConfig
  active: boolean
  pages: ('home' | 'article' | 'all')[]  // Which pages to show on
}

export const SPONSORS: Record<string, SponsorConfig> = {
  marginpro: {
    name: 'MarginPro',
    tagline: 'Stop Guessing Your Amazon Margins',
    description: 'Real-time profit analytics for Amazon sellers. Track fees, COGS, ad spend, and true profitability per SKU.',
    ctaText: 'Try MarginPro Free',
    ctaUrl: 'https://www.threecolts.com/margin-pro',
    logoUrl: '/sponsors/marginpro-logo.png',
    bannerImageUrl: '/sponsors/marginpro-banner.png',
    bannerImageAlt: 'MarginPro banner by Threecolts',
    backgroundColor: '#1a365d',
    textColor: '#ffffff',
    badge: 'Recommended Tool',
  },
  marketplacepulse: {
    name: 'Marketplace Pulse',
    tagline: 'Data-Driven Marketplace Intelligence',
    description: 'The leading source for e-commerce marketplace data, research, and insights. Trusted by the top brands and retailers worldwide.',
    ctaText: 'Visit Marketplace Pulse',
    ctaUrl: 'https://www.marketplacepulse.com?ref=marketplacebeta',
    logoUrl: '/sponsors/marketplacepulse-logo.png',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    badge: 'Preferred Source',
  },
  cedcommerce: {
    name: 'CedCommerce',
    tagline: 'Sell Everywhere From One Dashboard',
    description: 'Connect your store to Amazon, Walmart, TikTok Shop, eBay and more. Sync inventory, orders, and pricing automatically.',
    ctaText: 'Get Started Free',
    ctaUrl: 'https://cedcommerce.com?ref=marketplacebeta',
    logoUrl: '/sponsors/cedcommerce-logo.png',
    backgroundColor: '#0f766e',
    textColor: '#ffffff',
    badge: 'Integration Partner',
  },
  threecolts: {
    name: 'Threecolts',
    tagline: 'The Operating System for Marketplace Sellers',
    description: 'Suite of tools for Amazon and Walmart sellers — repricing, inventory, messaging, analytics, and more.',
    ctaText: 'Explore Threecolts',
    ctaUrl: 'https://www.threecolts.com/',
    logoUrl: '/sponsors/threecolts-logo.png',
    bannerImageUrl: '/sponsors/threecolts-banner.png',
    bannerImageAlt: 'Threecolts banner',
    backgroundColor: '#7c3aed',
    textColor: '#ffffff',
    badge: 'Strategic Partner',
  },
}

// Ad placements — toggle `active` to turn zones on/off
export const AD_PLACEMENTS: AdPlacement[] = [
  // Top banner on homepage — full-width, prominent
  {
    id: 'home-top-banner',
    zone: 'top-banner',
    sponsor: SPONSORS.marginpro,
    active: true,
    pages: ['home'],
  },
  // Sidebar on homepage
  {
    id: 'home-sidebar',
    zone: 'sidebar',
    sponsor: SPONSORS.marketplacepulse,
    active: false,
    pages: ['home'],
  },
  // Inline between articles on homepage (after ~6th article)
  {
    id: 'home-inline',
    zone: 'inline',
    sponsor: SPONSORS.marginpro,
    active: true,
    pages: ['home'],
  },
  // Footer banner — all pages
  {
    id: 'global-footer',
    zone: 'footer',
    sponsor: SPONSORS.threecolts,
    active: true,
    pages: ['all'],
  },
  // Sidebar on article detail pages
  {
    id: 'article-sidebar',
    zone: 'sidebar',
    sponsor: SPONSORS.marginpro,
    active: false,
    pages: ['article'],
  },
  // Inline on article pages (between AI brief and full content)
  {
    id: 'article-inline',
    zone: 'inline',
    sponsor: SPONSORS.marginpro,
    active: true,
    pages: ['article'],
  },
  // CedCommerce — homepage inline (after ~12th article, second inline slot)
  {
    id: 'home-inline-2',
    zone: 'inline',
    sponsor: SPONSORS.cedcommerce,
    active: false,
    pages: ['home'],
  },
]

// Helper to get active placements for a specific page and zone
export function getActivePlacements(page: 'home' | 'article', zone?: AdPlacement['zone']): AdPlacement[] {
  return AD_PLACEMENTS.filter(p =>
    p.active &&
    (p.pages.includes(page) || p.pages.includes('all')) &&
    (!zone || p.zone === zone)
  )
}
