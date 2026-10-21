// Date windows for sponsor placements, evaluated on the America/New_York calendar.
// Dates are ISO calendar days (YYYY-MM-DD) and both ends are inclusive.

const EASTERN = 'America/New_York'
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export interface SponsorWindow {
  start?: string
  end?: string
}

/** Today's date on the Eastern calendar, as YYYY-MM-DD. */
export function easternDateIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: EASTERN, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Day of week on the Eastern calendar: 0 = Sunday … 6 = Saturday. */
export function easternWeekday(now: Date = new Date()): number {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: EASTERN, weekday: 'short' }).format(now)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
}

export function isEasternWeekday(now: Date = new Date()): boolean {
  const d = easternWeekday(now)
  return d >= 1 && d <= 5
}

/**
 * Parse an env date. Returns undefined when unset/blank, null when set but not a
 * real YYYY-MM-DD calendar date (callers treat that as misconfigured and hide).
 */
export function parseSponsorDate(value: string | undefined): string | undefined | null {
  const v = value?.trim()
  if (!v) return undefined
  const m = ISO_DATE.exec(v)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null
  return v
}

/**
 * Read a start/end pair. Returns null when either date is invalid or end is
 * before start; otherwise the (possibly open-ended) window.
 */
export function readSponsorWindow(startValue: string | undefined, endValue: string | undefined): SponsorWindow | null {
  const start = parseSponsorDate(startValue)
  const end = parseSponsorDate(endValue)
  if (start === null || end === null) return null
  if (start && end && end < start) return null
  return { ...(start ? { start } : {}), ...(end ? { end } : {}) }
}

/** True when `now` (Eastern calendar day) is inside the inclusive window. An empty window is always open. */
export function isWithinSponsorWindow(window: SponsorWindow, now: Date = new Date()): boolean {
  const today = easternDateIso(now)
  if (window.start && today < window.start) return false
  if (window.end && today > window.end) return false
  return true
}
