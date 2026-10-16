/** Allowlisted attribution keys for newsletter signups. Never forward arbitrary URL values. */

const FIXED_SOURCES = [
  'dossier_2026_10',
  'x',
  'linkedin',
  'reddit',
  'bluesky',
  'tiktok',
  'podcast',
  'newsletter_swap',
  'brief',
  'fee_compare',
  'sponsor',
] as const

const FIXED_SOURCE_SET = new Set<string>(FIXED_SOURCES)

/** campaign_<slug>: lowercase alphanumeric / underscore / hyphen; full key max 64 chars. */
const CAMPAIGN_SOURCE_RE = /^campaign_[a-z0-9](?:[a-z0-9_-]{0,53}[a-z0-9])?$/

export type NewsletterSourceKey = (typeof FIXED_SOURCES)[number] | `campaign_${string}`

export type NewsletterAttribution =
  | 'newsletter_page'
  | `newsletter_${NewsletterSourceKey}`

function isAllowlistedSource(raw: string): raw is NewsletterSourceKey {
  if (raw.length === 0 || raw.length > 64) return false
  if (FIXED_SOURCE_SET.has(raw)) return true
  // "campaign_" (9) + at least one slug char; full string already capped at 64.
  return CAMPAIGN_SOURCE_RE.test(raw) && raw.length <= 64
}

function toAttribution(key: NewsletterSourceKey): NewsletterAttribution {
  return `newsletter_${key}`
}

/**
 * Resolve signup attribution from a URL search string.
 * Prefers a single valid `source` param; if `source` is absent, accepts a single
 * valid `utm_source`. Duplicate or invalid values fall back to newsletter_page.
 */
export function newsletterSource(search: string): NewsletterAttribution {
  const params = new URLSearchParams(search.startsWith('?') || search === '' ? search : `?${search}`)

  const sources = params.getAll('source')
  if (sources.length === 1 && isAllowlistedSource(sources[0])) {
    return toAttribution(sources[0])
  }
  // Explicit but invalid/ambiguous `source` must not fall through to utm_source.
  if (sources.length > 0) {
    return 'newsletter_page'
  }

  const utmSources = params.getAll('utm_source')
  if (utmSources.length === 1 && isAllowlistedSource(utmSources[0])) {
    return toAttribution(utmSources[0])
  }

  return 'newsletter_page'
}

export const NEWSLETTER_FIXED_SOURCES: readonly string[] = FIXED_SOURCES
