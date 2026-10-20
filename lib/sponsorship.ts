// Sponsorship configuration: media-kit contact and the optional newsletter sponsor slot.
export const SPONSOR_CONTACT_EMAIL = process.env.NEXT_PUBLIC_SPONSOR_CONTACT_EMAIL?.trim() || 'hello@marketplacebeta.com'

export function sponsorMailto(subject = 'Sponsorship rates: Daily Marketplace Brief'): string {
  return `mailto:${SPONSOR_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

export interface NewsletterSponsor {
  name: string
  url: string
  tagline?: string
  ctaText?: string
}

/** Newsletter sponsor slot, driven by env. Returns null (slot renders nothing) unless name and an http(s) URL are set. */
export function getNewsletterSponsor(env: Record<string, string | undefined> = process.env): NewsletterSponsor | null {
  const name = env.NEWSLETTER_SPONSOR_NAME?.trim()
  const url = env.NEWSLETTER_SPONSOR_URL?.trim()
  if (!name || !url || !/^https?:\/\//.test(url)) return null
  return {
    name,
    url,
    tagline: env.NEWSLETTER_SPONSOR_TAGLINE?.trim() || undefined,
    ctaText: env.NEWSLETTER_SPONSOR_CTA?.trim() || undefined,
  }
}

export interface DossierSponsor {
  name: string
  url: string
  logoUrl?: string
}

const HTTP_URL = /^https?:\/\//

/**
 * Presenting sponsor credit for the Intelligence Dossier page and its delivery email.
 * Returns null (credit renders nothing) unless DOSSIER_SPONSOR_NAME and an http(s)
 * DOSSIER_SPONSOR_URL are set. DOSSIER_SPONSOR_LOGO_URL is optional and ignored unless http(s).
 */
export function getDossierSponsor(env: Record<string, string | undefined> = process.env): DossierSponsor | null {
  const name = env.DOSSIER_SPONSOR_NAME?.trim()
  const url = env.DOSSIER_SPONSOR_URL?.trim()
  if (!name || !url || !HTTP_URL.test(url)) return null
  const logo = env.DOSSIER_SPONSOR_LOGO_URL?.trim()
  return { name, url, logoUrl: logo && HTTP_URL.test(logo) ? logo : undefined }
}
