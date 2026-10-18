/**
 * One-off archive backfill for article classification.
 *
 * Ground rules (the archive is the forecast training/backtest set):
 *  - Never deletes anything, never inserts articles, never touches title, summary,
 *    full_content, source, published_at or image fields.
 *  - Classification changes and their exact before/after audit are committed atomically.
 *  - Idempotent: processed rows leave the mode's selector. Each transaction rechecks
 *    eligibility, classification inputs, and prior values against the selected snapshot.
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
  'id, title, summary, full_content, source_name, published_at, ai_summary, our_take, key_takeaways, bottom_line, what_this_means, key_stat, category, platforms, audience, impact_level, relevant, relevance_score, rejection_reason, classified_at, updated_at'

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
  if (typeof c.aiSummary !== 'string' || !c.aiSummary.trim()
    || !(CLASSIFIER_CATEGORIES as readonly string[]).includes(c.category)
    || !Array.isArray(c.platforms) || !c.platforms.every(p => typeof p === 'string')
    || !Array.isArray(c.audience) || !c.audience.every(a => typeof a === 'string')
    || !Array.isArray(c.keyTakeaways) || !c.keyTakeaways.every(t => typeof t === 'string')
    || typeof c.ourTake !== 'string' || typeof c.bottomLine !== 'string'
    || ![c.whatThisMeans, c.keyStat, c.rejectionReason].every(t => t === null || typeof t === 'string')
    || !IMPACT_LEVELS.has(c.impactLevel)
    || !Number.isFinite(c.relevanceScore) || typeof c.relevant !== 'boolean') {
    throw new Error('Invalid classification; article left pending')
  }
  if (mode === 'unclassified' && (!c.ourTake.trim() || !c.bottomLine.trim()
    || !c.keyTakeaways.length || !c.keyTakeaways.every(t => t.trim()))) {
    throw new Error('Incomplete classification text; article left pending')
  }
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

/**
 * Rough Sonnet 4.6 cost per article: ~2,000 input tokens (prompt + up to 4,000 chars of
 * body) and ~450 output tokens at $3 / $15 per million.
 */
export function estimateCostUsd(articles: number, inputTokens = 2000, outputTokens = 450, inPerM = 3, outPerM = 15): number {
  return Math.round(articles * (inputTokens * inPerM + outputTokens * outPerM) / 1e6 * 100) / 100
}

