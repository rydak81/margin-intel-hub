'use client'
import { Analytics } from '@vercel/analytics/next'
export function SiteAnalytics() {
  return <Analytics beforeSend={event => {
    // Preserve page attribution without recording archive searches or auth query values.
    try { const url = new URL(event.url); url.search = ''; url.hash = ''; return { ...event, url: url.toString() } } catch { return null }
  }} />
}
