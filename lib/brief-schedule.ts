// Send-window helpers for the Daily Marketplace Brief.
//
// Vercel crons run in UTC, but the Brief goes out at 7:00 AM Eastern. 7 AM EDT is
// 11:00 UTC and 7 AM EST is 12:00 UTC, so vercel.json schedules the route at both
// 11:00 and 12:00 UTC and the route sends only on the run that lands in the 7 AM
// Eastern hour. Exactly one of the two runs qualifies on every calendar day,
// including both DST transition days.

const EASTERN = 'America/New_York'

export const BRIEF_SEND_HOUR_ET = 7

/** Placeholder content for the daily_briefs row a run claims before it does any work. */
export const BRIEF_CLAIM_CONTENT = 'Brief run claimed; generation in progress.'

export function getEasternCalendarDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})

  return {
    long: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
    short: `${parts.month} ${parts.day}`,
    iso: new Intl.DateTimeFormat('en-CA', { timeZone: EASTERN, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date),
  }
}

export function getEasternSendWindow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})

  return {
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    display: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ET`,
  }
}

/** True when `date` falls in the 7 AM Eastern hour (EDT or EST). */
export function isBriefSendWindow(date = new Date()): boolean {
  return getEasternSendWindow(date).hour === BRIEF_SEND_HOUR_ET
}
