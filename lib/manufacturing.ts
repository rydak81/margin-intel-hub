import { isGoodArticleImage, normalizeArticleImageUrl } from '@/lib/article-images'

export const MANUFACTURING_SOURCES = [
  { id: 'prusa', name: 'Prusa Research', url: 'https://blog.prusa3d.com/', feed: 'https://blog.prusa3d.com/feed/', kind: 'Manufacturer', process: '3D printing' },
  { id: 'bambu', name: 'Bambu Lab', url: 'https://blog.bambulab.com/', feed: 'https://blog.bambulab.com/rss/', kind: 'Manufacturer', process: '3D printing' },
  { id: 'carbide', name: 'Carbide 3D', url: 'https://carbide3d.com/blog/', feed: 'https://carbide3d.com/blog/feed.xml', kind: 'Manufacturer', process: 'Desktop CNC' },
  { id: 'xtool', name: 'xTool', url: 'https://www.xtool.com/blogs/news', feed: 'https://www.xtool.com/blogs/news.atom', kind: 'Manufacturer', process: 'Laser & fabrication' },
  { id: '3dpi', name: '3D Printing Industry', url: 'https://3dprintingindustry.com/', feed: 'https://3dprintingindustry.com/feed/', kind: 'Trade publication', process: 'Industry context' },
] as const
export type ManufacturingSource = typeof MANUFACTURING_SOURCES[number]
export const MANUFACTURING_TOPICS = ['Equipment', 'Materials', 'Software & workflow', 'Design & selling', 'Business & policy', 'Events & community'] as const
export type ManufacturingTopic = typeof MANUFACTURING_TOPICS[number]
export const MANUFACTURING_PROCESSES = ['3D printing', 'Desktop CNC', 'Laser & fabrication', 'Industry context'] as const
export type ManufacturingProcess = typeof MANUFACTURING_PROCESSES[number]
export interface ManufacturingStory {
  id: string; title: string; url: string; sourceId: string; sourceName: string; sourceKind: string
  publishedAt: string; topic: ManufacturingTopic; process: ManufacturingProcess
  /** Stable path segment for the on-site brief page, ending in a hash of the article URL. */
  slug: string
  /** Validated cover image from the publisher feed, or null when the feed offers none. */
  imageUrl: string | null
  /** Short plain-text excerpt from the feed. Never the full article body. */
  excerpt: string | null
}
export interface ManufacturingSourceStatus {
  id: string; available: boolean; count: number; latestPublishedAt: string | null
}
export interface ManufacturingSnapshot {
  checkedAt: string; stories: ManufacturingStory[]; sources: ManufacturingSourceStatus[]
}
export const MANUFACTURING_PROMPTS: Record<ManufacturingTopic, string> = {
  Equipment: 'Compare installed cost, real throughput, maintenance, and workflow fit before adding capacity.',
  Materials: 'Check compatibility, landed cost, waste, and application requirements before changing materials.',
  'Software & workflow': 'Check supported machines and versions, then test the workflow on a noncritical job.',
  'Design & selling': 'Validate buyer demand and the exact commercial license before turning a design into a product.',
  'Business & policy': 'Check the original scope, geography, and effective date against your own business exposure.',
  'Events & community': 'Look for relevant machines, suppliers, and operator questions; confirm details with the organizer.',
}
export function manufacturingTopic(title: string): ManufacturingTopic {
  if (/\b(slicer|software|firmware|motion|CAD|simulation|security|support requests|workflow)\b/i.test(title)) return 'Software & workflow'
  if (/\b(filament|prusament|resin|material|PLA|PETG|TPU|nylon)\b/i.test(title)) return 'Materials'
  if (/\b(makerworld|printables|license|licensing|design|model|fashion|watch|product ideas)\b/i.test(title)) return 'Design & selling'
  if (/\b(faire|fest|workshops?|conferences?|exhibitions?|community|challenges?|tours?)\b/i.test(title)) return 'Events & community'
  if (/\b(market|economy|business|law|policy|price|pricing|sales|growth|investment|factory)\b/i.test(title)) return 'Business & policy'
  return 'Equipment'
}
/** Branded fallback covers served from /public — every card and brief renders an image. */
export const MANUFACTURING_FALLBACK_COVERS: Record<ManufacturingProcess, string> = {
  '3D printing': '/manufacturing/cover-3d-printing.svg',
  'Desktop CNC': '/manufacturing/cover-desktop-cnc.svg',
  'Laser & fabrication': '/manufacturing/cover-laser.svg',
  'Industry context': '/manufacturing/cover-industry.svg',
}
export const manufacturingFallbackCover = (process: ManufacturingProcess) => MANUFACTURING_FALLBACK_COVERS[process]

const slugHash = (value: string) => {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 0x01000193) >>> 0 }
  return hash.toString(36)
}
/** Readable slug ending in a hash of the article URL, so links survive headline edits. */
export function manufacturingStorySlug(title: string, url: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 8).join('-')
  return `${words || 'report'}-${slugHash(url)}`
}
/** Look a story up by slug; the trailing URL hash is authoritative when titles drift. */
export function findManufacturingStory(stories: ManufacturingStory[], slug: string): ManufacturingStory | null {
  const direct = stories.find(story => story.slug === slug)
  if (direct) return direct
  const hash = slug.split('-').pop()
  return (hash && stories.find(story => story.slug.split('-').pop() === hash)) || null
}

export interface ManufacturingFeedItem {
  title?: string; link?: string; isoDate?: string; pubDate?: string; contentSnippet?: string
  content?: string; contentEncoded?: string
  enclosure?: { url?: string; type?: string }
  mediaContent?: { $?: { url?: string; medium?: string; type?: string } }[]
  mediaThumbnail?: { $?: { url?: string } }
}

const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|webp)(\?|$)/i
const checkImage = (candidate: string | undefined | null): string | null => {
  const normalized = normalizeArticleImageUrl(candidate)
  return normalized && isGoodArticleImage(normalized) ? normalized : null
}
/** Cover image for a feed item: media tags, then enclosure, then the first usable <img> in the body HTML. */
export function manufacturingStoryImage(item: ManufacturingFeedItem): string | null {
  for (const media of item.mediaContent ?? []) {
    const attrs = media?.$
    if (!attrs?.url) continue
    if (attrs.medium && attrs.medium !== 'image') continue
    if (attrs.type && !attrs.type.startsWith('image/')) continue
    const found = checkImage(attrs.url)
    if (found) return found
  }
  const thumbnail = checkImage(item.mediaThumbnail?.$?.url)
  if (thumbnail) return thumbnail
  if (item.enclosure?.url && (item.enclosure.type?.startsWith('image/') || IMAGE_EXTENSION.test(item.enclosure.url))) {
    const found = checkImage(item.enclosure.url)
    if (found) return found
  }
  for (const tag of (item.contentEncoded || item.content || '').match(/<img[^>]+>/gi)?.slice(0, 5) ?? []) {
    const found = checkImage(tag.match(/src=["']([^"']+)["']/i)?.[1])
    if (found) return found
  }
  return null
}

/** Short plain-text excerpt (≤ 500 chars) from the feed snippet or body. Never the full article. */
export function manufacturingExcerpt(item: ManufacturingFeedItem): string | null {
  const text = (item.contentSnippet || item.contentEncoded || item.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&(?:#039|apos|rsquo);/g, '’').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
  if (text.length < 40) return null
  if (text.length <= 500) return text
  const cut = text.slice(0, 500)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 400))}…`
}

export function manufacturingLink(value: string, source: ManufacturingSource): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (url.hostname.replace(/^www\./, '') !== new URL(source.url).hostname.replace(/^www\./, '')) return null
    for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key)
    url.hash = ''
    return url.href
  } catch { return null }
}
export function normalizeManufacturingItems(items: ManufacturingFeedItem[], source: ManufacturingSource, now = Date.now()): ManufacturingStory[] {
  return items.slice(0, 60).flatMap(item => {
    const title = (item.title || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240)
    const date = Date.parse(item.isoDate || item.pubDate || '')
    const url = manufacturingLink(item.link || '', source)
    if (!title || !url || !Number.isFinite(date) || date > now || date < now - 90 * 86400000) return []
    if (/\b(coupon|black friday|back-to-school|spooky offer|sweet treat)\b/i.test(title)) return []
    // Broad AM sources also cover industrial sectors outside this desk's scope.
    if (source.id === '3dpi' && /\b(combat|UGV|medicine|pediatric|aerospace|powder production|aluminum curtain)\b/i.test(title)) return []
    const process: ManufacturingProcess = /\b(laser|engraver|engraving|CO₂|CO2)\b/i.test(`${title} ${(item.contentSnippet || '').slice(0, 1500)}`) ? 'Laser & fabrication' : source.process
    return [{
      id: url, title, url, sourceId: source.id, sourceName: source.name, sourceKind: source.kind,
      publishedAt: new Date(date).toISOString(), topic: manufacturingTopic(title), process,
      slug: manufacturingStorySlug(title, url), imageUrl: manufacturingStoryImage(item), excerpt: manufacturingExcerpt(item),
    }]
  })
}
export function dedupeManufacturingStories(stories: ManufacturingStory[]): ManufacturingStory[] {
  const urls = new Set<string>(), titles = new Set<string>()
  return [...stories].sort((a,b) => Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).filter(story => {
    const title = story.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (urls.has(story.url) || titles.has(title)) return false
    urls.add(story.url); titles.add(title); return true
  })
}
export function filterManufacturingStories(stories: ManufacturingStory[], filters: { query: string; topic: string; process: string; days: number }, now: number) {
  const query = filters.query.trim().toLowerCase()
  return stories.filter(story => Date.parse(story.publishedAt) >= now - filters.days * 86400000
    && (!filters.topic || story.topic === filters.topic) && (!filters.process || story.process === filters.process)
    && (!query || `${story.title} ${story.sourceName} ${story.topic} ${story.process}`.toLowerCase().includes(query)))
}
export const MANUFACTURING_EVENTS = [
  { name: 'Formnext 2026', start: '2026-11-17', end: '2026-11-20', location: 'Frankfurt, Germany', dates: 'November 17–20, 2026', scope: 'Additive manufacturing trade show', note: 'A broader industry event for equipment, materials, and production workflows. Review the exhibitor list for your specific process.', url: 'https://formnext.mesago.com/frankfurt/en.html', verifiedAt: '2026-10-10' },
  { name: 'RAPID + TCT 2027', start: '2027-04-12', end: '2027-04-15', location: 'Detroit, Michigan', dates: 'April 12–15, 2027', scope: 'Additive manufacturing conference & exhibits', note: 'Conference April 12–15; exhibits April 13–15. Broader industrial coverage alongside production technologies and suppliers.', url: 'https://www.rapid3devent.com/event/event-overview/', verifiedAt: '2026-10-10' },
] as const
export function upcomingManufacturingEvents(now: number) {
  return MANUFACTURING_EVENTS.filter(event => Date.parse(`${event.end}T23:59:59Z`) >= now)
}
