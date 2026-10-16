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
