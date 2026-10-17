/**
 * One-off archive backfill for article classification.
 *
 * Ground rules (the archive is the forecast training/backtest set):
 *  - Never deletes anything, never inserts articles, never touches title, summary,
 *    full_content, source, published_at or image fields.
 *  - Only classification fields are written, and every write is preceded by an audit row
 *    (article_classification_audit) holding the before/after values, so any change can be
 *    reviewed or reverted.
 *  - Idempotent: a row that has been processed no longer matches its mode's selector, and
 *    each UPDATE repeats the selector as a guard, so re-running or overlapping with the
 *    classify cron can't double-write or clobber newer data.
 */

export type BackfillMode = 'unclassified' | 'overwritten'

/** Categories the classifier prompt can return. */
export const CLASSIFIER_CATEGORIES = [
  'breaking', 'platform_updates', 'market_metrics', 'profitability', 'mergers_acquisitions',
  'tools_technology', 'advertising', 'logistics', 'events', 'tactics', 'compliance_policy',
] as const

/**
 * Feed-default fingerprint. RSS ingestion writes audience ['brand_sellers','agencies'] and
 * NewsAPI writes ['brand_sellers']; the classifier only returns sellers/agencies/brands/
 * new_sellers/experts. So a row that has an ai_summary but still carries 'brand_sellers'
 * had its classification overwritten by the old aggregate re-upsert.
 */
export const FEED_DEFAULT_AUDIENCE_MARKER = 'brand_sellers'

/** Columns read for classification + audit. Deliberately excludes images and search vector. */
export const BACKFILL_SELECT =
  'id, title, summary, full_content, source_name, published_at, ai_summary, our_take, key_takeaways, bottom_line, what_this_means, key_stat, category, platforms, audience, impact_level, relevant, relevance_score, rejection_reason, classified_at'

export interface BackfillRow {
  id: string
  ai_summary: string | null
  audience: string[] | null
  [key: string]: unknown
}

export function isUnclassified(row: Pick<BackfillRow, 'ai_summary'>): boolean {
  return row.ai_summary === null || row.ai_summary === undefined
}

export function isFeedDefaultOverwrite(row: Pick<BackfillRow, 'ai_summary' | 'audience'>): boolean {
  return !isUnclassified(row) && Array.isArray(row.audience) && row.audience.includes(FEED_DEFAULT_AUDIENCE_MARKER)
}

export function matchesMode(row: BackfillRow, mode: BackfillMode): boolean {
  return mode === 'unclassified' ? isUnclassified(row) : isFeedDefaultOverwrite(row)
}

export interface ClassifiedResult {
  aiSummary: string
  ourTake: string
  keyTakeaways: string[]
  bottomLine: string
  whatThisMeans: string | null
  category: string
  platforms: string[]
  audience: string[]
  impactLevel: string
  keyStat: string | null
  relevanceScore: number
  relevant: boolean
  rejectionReason: string | null
}

const IMPACT_LEVELS = new Set(['high', 'medium', 'low'])

export function toRelevanceInt(score: number): number {
  const n = Number(score) || 0
  const pct = n > 1 ? n : n * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

/**
 * Build the column update for one row. 'unclassified' fills the AI text fields (they are
 * NULL, guarded by ai_summary IS NULL). 'overwritten' restores only the structured fields
 * the re-upsert clobbered; the original AI text and classified_at are left untouched.
 */
export function buildBackfillUpdate(mode: BackfillMode, c: ClassifiedResult, now: string): Record<string, unknown> {
  const audience = (c.audience || []).filter(a => a !== FEED_DEFAULT_AUDIENCE_MARKER)
  const structured = {
    category: c.category || 'market_metrics',
    platforms: c.platforms || [],
    // Never leave the marker in place, or the row would be selected again forever.
    audience,
    impact_level: IMPACT_LEVELS.has(c.impactLevel) ? c.impactLevel : 'medium',
    relevant: c.relevant,
    relevance_score: toRelevanceInt(c.relevanceScore),
    rejection_reason: c.rejectionReason,
  }
  if (mode === 'overwritten') return structured
  return {
    ...structured,
    ai_summary: c.aiSummary || '',
    our_take: c.ourTake || null,
    key_takeaways: c.keyTakeaways || [],
    bottom_line: c.bottomLine || null,
    what_this_means: c.whatThisMeans,
    key_stat: c.keyStat,
    classified_at: now,
  }
}

/** Subset of `row` covering exactly the keys being changed, for the audit "before" snapshot. */
export function snapshotBefore(row: Record<string, unknown>, update: Record<string, unknown>): Record<string, unknown> {
  const before: Record<string, unknown> = {}
  for (const key of Object.keys(update)) before[key] = row[key] ?? null
  if (!('classified_at' in before)) before.classified_at = row.classified_at ?? null
  return before
}

/**
 * Rough Sonnet 4.6 cost per article: ~2,000 input tokens (prompt + up to 4,000 chars of
 * body) and ~450 output tokens at $3 / $15 per million.
 */
export function estimateCostUsd(articles: number, inputTokens = 2000, outputTokens = 450, inPerM = 3, outPerM = 15): number {
  return Math.round(articles * (inputTokens * inPerM + outputTokens * outPerM) / 1e6 * 100) / 100
}
