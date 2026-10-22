// Send-window helpers for the Daily Marketplace Brief.
//
// Vercel crons run in UTC, but the Brief goes out at 7:00 AM Eastern. 7 AM EDT is
// 11:00 UTC and 7 AM EST is 12:00 UTC, so vercel.json schedules the route at both
// 11:00 and 12:00 UTC and the route sends only on the run that lands in the 7 AM
// Eastern hour. Exactly one of the two runs qualifies on every calendar day,
// including both DST transition days.

const EASTERN = 'America/New_York'

export const BRIEF_SEND_HOUR_ET = 7

/** Prefix of the placeholder content for the daily_briefs row a run claims before it does any work. */
export const BRIEF_CLAIM_PREFIX = 'Brief run claimed at '

/** A claim older than this is presumed abandoned (the route's maxDuration is 60 s). */
export const BRIEF_CLAIM_LEASE_MS = 5 * 60 * 1000

export function briefClaimContent(now: Date = new Date()): string {
  return `${BRIEF_CLAIM_PREFIX}${now.toISOString()}; generation in progress.`
}

/** When `content` is a claim placeholder, the time it was claimed; otherwise null (a real brief or heartbeat). */
export function claimedAt(content: string | null | undefined): Date | null {
  if (!content?.startsWith(BRIEF_CLAIM_PREFIX)) return null
  const at = new Date(content.slice(BRIEF_CLAIM_PREFIX.length).split(';')[0])
  return Number.isNaN(at.getTime()) ? null : at
}

export type BriefClaim =
  | { status: 'claimed'; content: string }
  | { status: 'taken' }
  | { status: 'error'; message: string }

// Minimal shape of the Supabase client calls used below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = { from: (table: string) => any }

/**
 * Claim today's Brief by inserting the daily_briefs row for the Eastern date (id is
 * unique). A conflicting row means another run already sent or is sending it, unless
 * that row is a claim placeholder older than the lease, which is taken over with a
 * compare-and-swap update so only one retry can win.
 */
export async function claimTodaysBrief(db: Db, dayIso: string, now: Date = new Date()): Promise<BriefClaim> {
  const content = briefClaimContent(now)
  const { error } = await db.from('daily_briefs').insert({ id: dayIso, brief_date: dayIso, content, article_count: 0, article_ids: [] })
  if (!error) return { status: 'claimed', content }
  if (error.code !== '23505') return { status: 'error', message: error.message }

  // Past this point a row for today provably exists (the insert hit the unique
  // id), so a transient read/swap failure must fail CLOSED: sending anyway
  // could duplicate the brief to every subscriber, while skipping costs at
  // most one takeover attempt of an already-abandoned claim.
  const { data: existing, error: readError } = await db.from('daily_briefs').select('content').eq('id', dayIso).maybeSingle()
  if (readError) return { status: 'taken' }
  const at = claimedAt(existing?.content)
  if (!at || now.getTime() - at.getTime() < BRIEF_CLAIM_LEASE_MS) return { status: 'taken' }

  const { data: swapped, error: swapError } = await db.from('daily_briefs')
    .update({ content }).eq('id', dayIso).eq('content', existing!.content).select('id')
  if (swapError) return { status: 'taken' }
  return swapped?.length ? { status: 'claimed', content } : { status: 'taken' }
}

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
