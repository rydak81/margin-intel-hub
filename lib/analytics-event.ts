// Vercel Web Analytics filter used by components/site-analytics.tsx.
//
// Not-found renders keep the URL the visitor asked for (an unpublished
// /intelligence/analysis/<slug>, an unknown fee page, and so on), so the event
// URL cannot tell a 404 from a real page. Those UIs render
// AnalyticsNotFoundMarker instead. @vercel/analytics/next turns off the
// script's history listener and sends the pageview from an effect after React
// commits the route, so the marker is already in the document for a 404 and
// already gone after a client navigation away from one. The next pageview
// still counts.
//
// Everything else is unchanged: attribution query params stay, other query
// values and the hash are dropped, and an unparseable URL is not sent.
import { scrubAnalyticsUrl } from './analytics-url'

/** Present on a not-found render. beforeSend drops the event while it is in the document. */
export const ANALYTICS_NOT_FOUND_ATTRIBUTE = 'data-analytics-not-found'

/** True while the committed page is a not-found UI. */
export function isAnalyticsNotFoundPage(): boolean {
  return typeof document !== 'undefined' && document.querySelector(`[${ANALYTICS_NOT_FOUND_ATTRIBUTE}]`) !== null
}

/** Drop not-found traffic; otherwise return the event with a scrubbed URL. */
export function filterAnalyticsEvent<E extends { url: string }>(event: E): E | null {
  if (isAnalyticsNotFoundPage()) return null
  const url = scrubAnalyticsUrl(event.url)
  return url ? { ...event, url } : null
}
