/**
 * Paid-offer configuration for MarketplaceBeta.
 *
 * Checkout lives entirely in Stripe (Payment Links). This module never creates
 * Stripe objects; it only reads public Payment Link URLs from env vars and
 * refuses anything that is not a live Stripe-hosted checkout URL.
 *
 *   NEXT_PUBLIC_PRO_CHECKOUT_URL       Stripe Payment Link for the Pro membership
 *   NEXT_PUBLIC_PRO_PRICE_LABEL        e.g. "$19/month founding rate"
 *   NEXT_PUBLIC_DOSSIER_CHECKOUT_URL   Stripe Payment Link for the one-time Operator Edition
 *   NEXT_PUBLIC_DOSSIER_PRICE_LABEL    e.g. "$29 one-time"
 *
 * Until a checkout URL is set, every upgrade CTA falls back to a founding-member
 * list signup (attributed as newsletter_campaign_pro_waitlist), so the page still
 * captures paid intent and nothing links to a broken or test checkout.
 */

export type OfferKind = 'pro' | 'dossier'

export const PRO_WAITLIST_HREF = '/newsletter?source=campaign_pro_waitlist#subscribe'
export const DOSSIER_WAITLIST_HREF = '/newsletter?source=campaign_dossier_operator#subscribe'

const STRIPE_CHECKOUT_HOSTS = new Set(['buy.stripe.com', 'checkout.stripe.com'])

/**
 * Accept only https Stripe-hosted checkout URLs. Test-mode Payment Links
 * (buy.stripe.com/test_...) are rejected unless explicitly allowed, so a test
 * link can never ship to production readers.
 */
export function validCheckoutUrl(raw: string | undefined | null, opts: { allowTest?: boolean } = {}): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  if (!STRIPE_CHECKOUT_HOSTS.has(url.hostname)) return null
  if (url.pathname.length <= 1) return null
  if (!opts.allowTest && /^\/(c\/pay\/cs_test_|test_)/.test(url.pathname)) return null
  return url.toString()
}

export type ResolvedOffer = {
  kind: OfferKind
  /** True when a valid live Stripe checkout URL is configured. */
  live: boolean
  href: string
  /** Shown only when configured; never invented. */
  priceLabel: string | null
  ctaLabel: string
}

type OfferEnv = {
  proUrl?: string
  proPrice?: string
  dossierUrl?: string
  dossierPrice?: string
  allowTest?: boolean
}

function cleanLabel(raw: string | undefined): string | null {
  const v = raw?.trim()
  return v && v.length <= 60 ? v : null
}

export function resolveOffers(env: OfferEnv = readEnv()): Record<OfferKind, ResolvedOffer> {
  const proHref = validCheckoutUrl(env.proUrl, { allowTest: env.allowTest })
  const dossierHref = validCheckoutUrl(env.dossierUrl, { allowTest: env.allowTest })
  return {
    pro: {
      kind: 'pro',
      live: proHref !== null,
      href: proHref ?? PRO_WAITLIST_HREF,
      priceLabel: proHref ? cleanLabel(env.proPrice) : null,
      ctaLabel: proHref ? 'Become a founding member' : 'Join the founding-member list',
    },
    dossier: {
      kind: 'dossier',
      live: dossierHref !== null,
      href: dossierHref ?? DOSSIER_WAITLIST_HREF,
      priceLabel: dossierHref ? cleanLabel(env.dossierPrice) : null,
      ctaLabel: dossierHref ? 'Get the Operator Edition' : 'Get notified when it opens',
    },
  }
}

function readEnv(): OfferEnv {
  // Referenced statically so Next.js can inline NEXT_PUBLIC_* values.
  return {
    proUrl: process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL,
    proPrice: process.env.NEXT_PUBLIC_PRO_PRICE_LABEL,
    dossierUrl: process.env.NEXT_PUBLIC_DOSSIER_CHECKOUT_URL,
    dossierPrice: process.env.NEXT_PUBLIC_DOSSIER_PRICE_LABEL,
    allowTest: process.env.VERCEL_ENV !== 'production' && process.env.NEXT_PUBLIC_ALLOW_TEST_CHECKOUT === '1',
  }
}

/** What free readers get today. Everything listed here is live on the site. */
export const FREE_FEATURES = [
  'The Daily Marketplace Brief, every weekday morning',
  'Intelligence dashboard across platforms, audiences and topics',
  'Intelligence Dossier Edition 1 (read online or download the PDF)',
  'Public forecast scorecard, graded hit or miss',
  'Weekly Marketplace Pressure Index',
  'Fee calculators, fee comparisons and the fee changelog',
] as const

/** Founding-member Pro benefits. Edit here; every CTA and the pricing page read from this list. */
export const PRO_FEATURES = [
  { title: 'Weekly Pro memo', text: 'The week’s biggest shifts in marketplace coverage, what is driving them, and the operator move we would make. Written for decisions, not headlines.' },
  { title: 'Forecast tracker', text: 'A monthly check-in on every open forecast: which confirming and invalidating indicators moved, and what that means for your plan.' },
  { title: 'Every Dossier edition first, with data', text: 'Early access to each new edition plus the data appendix: the opportunity ranking and the forecast ledger as spreadsheets.' },
  { title: 'Ask the desk', text: 'Send one operator question a quarter. We research it against our classified archive and reply with the evidence.' },
  { title: 'Founding rate, locked', text: 'Founding members keep their rate for as long as they stay subscribed.' },
] as const

/** One-time Operator Edition contents. */
export const DOSSIER_OPERATOR_FEATURES = [
  'The full 29-page Edition 1 dossier (PDF)',
  'Opportunity ranking as an editable spreadsheet',
  'The 12-forecast ledger with indicators and resolve-by dates, as a spreadsheet',
  'Edition 2 sent to you before it goes public',
] as const
