/** brief_cta_click resource and /newsletter?source= key for the news briefing callout. */
export const NEWS_HOLIDAY_SOURCE = 'news_holiday'

/**
 * Inclusive last day (America/New_York) the /holiday-2026 link is shown on
 * news briefings. Delete this constant to remove that link. The newsletter
 * CTA is not date-gated.
 */
export const NEWS_HOLIDAY_CALLOUT_THROUGH = '2026-12-31'

/** Calendar date in America/New_York as YYYY-MM-DD. */
export function newYorkCalendarDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

/** True on and before NEWS_HOLIDAY_CALLOUT_THROUGH in America/New_York. */
export function newsHolidayHubVisible(now: Date = new Date()): boolean {
  return newYorkCalendarDay(now) <= NEWS_HOLIDAY_CALLOUT_THROUGH
}
