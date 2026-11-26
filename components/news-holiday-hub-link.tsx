'use client'

import Link from 'next/link'
import { track } from '@vercel/analytics'
import { HOLIDAY_HUB_DESCRIPTION, HOLIDAY_HUB_PATH } from '@/lib/holiday-hub'
import { NEWS_HOLIDAY_SOURCE } from '@/lib/news-holiday-callout'

/** Hub description as a link. Same brief_cta_click resource as the newsletter button on this callout. */
export function NewsHolidayHubLink({ className = 'font-semibold text-primary underline' }: { className?: string }) {
  return (
    <Link
      href={HOLIDAY_HUB_PATH}
      data-cta="holiday_hub"
      className={className}
      onClick={() => {
        try { track('brief_cta_click', { resource: NEWS_HOLIDAY_SOURCE }) } catch { /* analytics must not block the click */ }
      }}
    >
      {HOLIDAY_HUB_DESCRIPTION}
    </Link>
  )
}
