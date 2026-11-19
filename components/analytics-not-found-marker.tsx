import { ANALYTICS_NOT_FOUND_ATTRIBUTE } from '@/lib/analytics-event'

/**
 * Marks a not-found render so Web Analytics drops its pageview and custom events.
 * Render this from every not-found UI. Route-level notFound() calls (analysis
 * articles, fee pages, guides, and the rest) use the nearest of those UIs.
 */
export function AnalyticsNotFoundMarker() {
  return <span {...{ [ANALYTICS_NOT_FOUND_ATTRIBUTE]: '' }} hidden />
}
