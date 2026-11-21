'use client'
import { Analytics } from '@vercel/analytics/next'
import { filterAnalyticsEvent } from '@/lib/analytics-event'

export function SiteAnalytics() {
  // Drops not-found renders. Other events keep utm_* and an allowlisted ?source. See lib/analytics-event.ts.
  return <Analytics beforeSend={filterAnalyticsEvent} />
}
