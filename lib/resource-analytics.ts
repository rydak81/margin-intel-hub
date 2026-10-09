'use client'
import { track } from '@vercel/analytics'
export function trackResourceEvent(event: 'resource_download_click' | 'guide_tool_click' | 'guide_newsletter_click' | 'newsletter_signup', resource: string) {
  // Fixed resource identifiers only. Never email addresses, search terms, or account fields.
  try { track(event, { resource }) } catch { /* Analytics must not block the user's task. */ }
}
