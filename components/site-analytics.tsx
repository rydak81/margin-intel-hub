'use client'
import { Analytics } from '@vercel/analytics/next'
import { scrubAnalyticsUrl } from '@/lib/analytics-url'
export function SiteAnalytics() {
  return <Analytics beforeSend={event => {
    // Keep page and campaign attribution (utm_*, allowlisted ?source) without recording archive searches or auth query values.
    const url = scrubAnalyticsUrl(event.url)
    return url ? { ...event, url } : null
  }} />
}
