import Parser from 'rss-parser'
import { MANUFACTURING_SOURCES, normalizeManufacturingItems, dedupeManufacturingStories, type ManufacturingFeedItem, type ManufacturingSnapshot, type ManufacturingSource } from '@/lib/manufacturing'

// Surface the fields cover-image extraction reads; rss-parser drops unmapped namespaced tags.
const newParser = () => new Parser<Record<string, unknown>, ManufacturingFeedItem>({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})

const MAX_FEED_BYTES = 2_000_000
export async function readManufacturingFeed(source: ManufacturingSource, now: number, fetcher: typeof fetch = fetch) {
  const response = await fetcher(source.feed, {
    headers: { 'User-Agent': 'MarketplaceBeta/1.0 (+https://marketplacebeta.com/about)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store',
  })
  if (!response.ok || !response.body) throw new Error(`Feed unavailable: ${response.status}`)
  const reader = response.body.getReader(), chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_FEED_BYTES) { await reader.cancel(); throw new Error('Feed exceeds size limit') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const xml = Buffer.concat(chunks).toString('utf8')
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported XML declaration')
  const feed = await newParser().parseString(xml)
  if (!Array.isArray(feed.items)) throw new Error('Invalid feed')
  // Headline, date, classification, original link, a validated cover image, and the
  // coverage the publisher distributes in this public feed (excerpt + capped body text)
  // for the on-site article view — always credited and linked to the original.
  return normalizeManufacturingItems(feed.items, source, now)
}
export async function buildManufacturingSnapshot(now = Date.now(), fetcher: typeof fetch = fetch): Promise<ManufacturingSnapshot> {
  const results = await Promise.allSettled(MANUFACTURING_SOURCES.map(source => readManufacturingFeed(source, now, fetcher)))
  const stories = dedupeManufacturingStories(results.flatMap(result => result.status === 'fulfilled' ? result.value : []))
  return {
    checkedAt: new Date(now).toISOString(), stories,
    sources: results.map((result, i) => {
      const items = result.status === 'fulfilled' ? result.value : []
      return { id: MANUFACTURING_SOURCES[i].id, available: result.status === 'fulfilled', count: items.length, latestPublishedAt: items.reduce<string | null>((latest, item) => !latest || item.publishedAt > latest ? item.publishedAt : latest, null) }
    }),
  }
}
