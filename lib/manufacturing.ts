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
export function normalizeManufacturingItems(items: { title?: string; link?: string; isoDate?: string; pubDate?: string; contentSnippet?: string }[], source: ManufacturingSource, now = Date.now()): ManufacturingStory[] {
  return items.slice(0, 60).flatMap(item => {
    const title = (item.title || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240)
    const date = Date.parse(item.isoDate || item.pubDate || '')
    const url = manufacturingLink(item.link || '', source)
    if (!title || !url || !Number.isFinite(date) || date > now || date < now - 90 * 86400000) return []
    if (/\b(coupon|black friday|back-to-school|spooky offer|sweet treat)\b/i.test(title)) return []
    // Broad AM sources also cover industrial sectors outside this desk's scope.
    if (source.id === '3dpi' && /\b(combat|UGV|medicine|pediatric|aerospace|powder production|aluminum curtain)\b/i.test(title)) return []
    const process: ManufacturingProcess = /\b(laser|engraver|engraving|CO₂|CO2)\b/i.test(`${title} ${(item.contentSnippet || '').slice(0, 1500)}`) ? 'Laser & fabrication' : source.process
    return [{ id: url, title, url, sourceId: source.id, sourceName: source.name, sourceKind: source.kind, publishedAt: new Date(date).toISOString(), topic: manufacturingTopic(title), process }]
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
