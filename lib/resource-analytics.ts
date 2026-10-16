'use client'
import { track } from '@vercel/analytics'
export function trackResourceEvent(event: 'manufacturing_meshnomics_click' | 'affiliate_click' | 'resource_download_click' | 'guide_tool_click' | 'guide_newsletter_click' | 'newsletter_signup', resource: string) {
  // Fixed resource identifiers only. Never email addresses, search terms, or account fields.
  try { track(event, { resource }) } catch { /* Analytics must not block the user's task. */ }
  // Mirror to GA4 when the gtag snippet is loaded (NEXT_PUBLIC_GA_ID set).
  try {
    const gtag = typeof window !== 'undefined' ? (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag : undefined
    if (typeof gtag === 'function') gtag('event', event, { resource })
  } catch { /* Analytics must not block the user's task. */ }
}
