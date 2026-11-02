// Client-side attribution for Daily Marketplace Brief signup forms.
//
// The /newsletter form and the homepage widget both send a `source` to
// /api/subscribe and use the same value as the `resource` of the
// `newsletter_signup` analytics event. A key on this URL wins; otherwise a
// valid key remembered earlier in the visit (sessionStorage mb_brief_source,
// written by components/brief-signup-link.tsx) is used, so a visitor who
// arrived with ?source=<key> and later reached the form through a plain,
// unkeyed /newsletter link is still attributed.
import { BRIEF_SOURCE_STORAGE_KEY, isAllowedBriefSource } from './brief-cta'
import { newsletterSource, type NewsletterAttribution } from './newsletter-source'

/** Remembered incoming key for this visit, or null (storage blocked / unset). */
export function readStoredBriefSource(): string | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(BRIEF_SOURCE_STORAGE_KEY)
  } catch {
    return null
  }
}

/** Attribution for the /newsletter form: URL key, else remembered key, else newsletter_page. */
export function newsletterSignupSource(search: string, stored?: string | null): NewsletterAttribution {
  const fromUrl = newsletterSource(search)
  if (fromUrl !== 'newsletter_page') return fromUrl
  return isAllowedBriefSource(stored) ? (`newsletter_${stored}` as NewsletterAttribution) : "newsletter_page"
}

export const HOMEPAGE_WIDGET_SOURCE = 'homepage_widget'

/** Attribution for the homepage widget: homepage_widget, or homepage_widget:<key> when the visit carries a valid key. */
export function homepageWidgetSource(search: string, stored?: string | null): string {
  const attribution = newsletterSignupSource(search, stored)
  return attribution === 'newsletter_page'
    ? HOMEPAGE_WIDGET_SOURCE
    : `${HOMEPAGE_WIDGET_SOURCE}:${attribution.slice('newsletter_'.length)}`
}
