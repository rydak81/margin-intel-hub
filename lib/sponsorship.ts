// Sponsorship configuration: the optional newsletter sponsor slot and dossier sponsor credit.
import { parseHttpUrl, withUtm } from '@/lib/utm'
import { isEasternWeekday, isWithinSponsorWindow, readSponsorWindow } from '@/lib/sponsor-window'

export interface NewsletterSponsor {
  name: string
  /** Destination, UTM-tagged (utm_source=marketplacebeta, utm_medium=brief) unless the sponsor already set those keys. */
  url: string
  tagline?: string
  ctaText?: string
}

const truthy = (v: string | undefined) => /^(1|true|yes|on)$/i.test(v?.trim() ?? '')
const falsy = (v: string | undefined) => /^(0|false|no|off)$/i.test(v?.trim() ?? '')

/**
 * Newsletter sponsor slot, driven by env. Returns null (slot renders nothing) unless
 * name and an http(s) URL are set and `now` is inside the booking:
 *
 * - NEWSLETTER_SPONSOR_START / NEWSLETTER_SPONSOR_END: optional YYYY-MM-DD dates on the
 *   America/New_York calendar, both inclusive. Unset = always on (the previous behaviour).
 *   An invalid date, or END before START, hides the slot rather than running it open-ended.
 * - NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: true/false. Defaults to true when both START and END
 *   are set (a "5 weekday slots" booking never lands in a weekend issue), false otherwise.
 */
export function getNewsletterSponsor(env: Record<string, string | undefined> = process.env, now: Date = new Date()): NewsletterSponsor | null {
  const name = env.NEWSLETTER_SPONSOR_NAME?.trim()
  const url = parseHttpUrl(env.NEWSLETTER_SPONSOR_URL)
  if (!name || !url) return null
  const window = readSponsorWindow(env.NEWSLETTER_SPONSOR_START, env.NEWSLETTER_SPONSOR_END)
  if (!window || !isWithinSponsorWindow(window, now)) return null
  const weekdaysOnly = truthy(env.NEWSLETTER_SPONSOR_WEEKDAYS_ONLY)
    || (!falsy(env.NEWSLETTER_SPONSOR_WEEKDAYS_ONLY) && !!window.start && !!window.end)
  if (weekdaysOnly && !isEasternWeekday(now)) return null
  return {
    name,
    url: withUtm(url, 'brief'),
    tagline: env.NEWSLETTER_SPONSOR_TAGLINE?.trim() || undefined,
    ctaText: env.NEWSLETTER_SPONSOR_CTA?.trim() || undefined,
  }
}

export interface DossierSponsor {
  name: string
  url: string
  logoUrl?: string
}

/**
 * Presenting sponsor credit for the Intelligence Dossier page and its delivery email.
 * Returns null (credit renders nothing) unless DOSSIER_SPONSOR_NAME and an http(s)
 * DOSSIER_SPONSOR_URL are set. DOSSIER_SPONSOR_LOGO_URL is optional and ignored unless http(s).
 * The URL gets utm_source=marketplacebeta&utm_medium=dossier unless the sponsor already set those keys.
 */
export function getDossierSponsor(env: Record<string, string | undefined> = process.env): DossierSponsor | null {
  const name = env.DOSSIER_SPONSOR_NAME?.trim()
  const url = parseHttpUrl(env.DOSSIER_SPONSOR_URL)
  if (!name || !url) return null
  return { name, url: withUtm(url, 'dossier'), logoUrl: parseHttpUrl(env.DOSSIER_SPONSOR_LOGO_URL) ?? undefined }
}
