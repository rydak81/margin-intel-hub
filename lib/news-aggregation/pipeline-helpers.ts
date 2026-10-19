/**
 * Pure helpers for the news cron jobs (/api/news/aggregate and /api/news/classify).
 *
 * Why these exist: the aggregate job used to walk all active sources one by one in
 * priority order and re-upsert every item still in each feed (up to 30 days old),
 * fetching the article page for each. That took the whole 50s budget after ~52 of 67
 * sources, so the lowest-priority feeds (e.g. Freightwaves, the only logistics feed)
 * silently stopped being read. The re-upsert also overwrote classifier output
 * (category, relevant, relevance_score, platforms, impact) with feed defaults.
 */

export interface SchedulableSource {
  priority_score?: number | null
  last_fetched_at?: string | null
}

/**
 * Stalest source first (never-fetched first), then higher priority. Combined with the
 * time budget this rotates through every source instead of starving the tail.
 */
export function orderSourcesForFetch<T extends SchedulableSource>(sources: T[]): T[] {
  const ts = (s: SchedulableSource) => {
    const t = s.last_fetched_at ? Date.parse(s.last_fetched_at) : NaN
    return Number.isFinite(t) ? t : -Infinity
  }
  return [...sources].sort((a, b) => {
    const diff = ts(a) - ts(b)
    if (diff !== 0 && Number.isFinite(diff)) return diff
    if (ts(a) !== ts(b)) return ts(a) === -Infinity ? -1 : 1
    return (b.priority_score || 0) - (a.priority_score || 0)
  })
}

/** Keep only articles whose source_url is not already stored, de-duplicated within the batch. */
export function selectNewArticles<T extends { source_url: string }>(articles: T[], existingUrls: Iterable<string>): T[] {
  const seen = new Set(existingUrls)
  const out: T[] = []
  for (const article of articles) {
    if (!article.source_url || seen.has(article.source_url)) continue
    seen.add(article.source_url)
    out.push(article)
  }
  return out
}

/**
 * Run `worker` over `items` with at most `concurrency` in flight. Stops starting new
 * items once `shouldStop()` returns true; items already started are awaited.
 * Returns the number of items started.
 */
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
  shouldStop: () => boolean = () => false
): Promise<number> {
  let next = 0
  let started = 0
  const lanes = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (next < items.length && !shouldStop()) {
      const item = items[next++]
      started++
      await worker(item)
    }
  })
  await Promise.all(lanes)
  return started
}

/** True when there is not enough time left to safely start another unit of work. */
export function budgetExhausted(startTime: number, budgetMs: number, now: number = Date.now()): boolean {
  return now - startTime > budgetMs
}
