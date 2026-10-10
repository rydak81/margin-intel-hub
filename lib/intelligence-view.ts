import { INTELLIGENCE_AUDIENCES, INTELLIGENCE_CATEGORIES, INTELLIGENCE_PLATFORMS } from '@/lib/intelligence'
export const DEFAULT_INTELLIGENCE_VIEW = { days: 7, platform: 'all', audience: 'all', category: 'all', query: '' }
export type IntelligenceView = typeof DEFAULT_INTELLIGENCE_VIEW
export const INTELLIGENCE_VIEW_KEY = 'marketplacebeta:intelligence-view:v1'
export function validateIntelligenceView(input: unknown): IntelligenceView {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const option = (value: unknown, options: readonly (readonly [string, string])[]) => typeof value === 'string' && options.some(([key]) => key === value) ? value : 'all'
  return {
    days: [1, 7, 30, 90].includes(Number(data.days)) ? Number(data.days) : 7,
    platform: option(data.platform, INTELLIGENCE_PLATFORMS),
    audience: option(data.audience, INTELLIGENCE_AUDIENCES),
    category: option(data.category, INTELLIGENCE_CATEGORIES),
    query: typeof data.query === 'string' ? data.query.slice(0, 120) : '',
  }
}
export function viewFromSearch(search: string): IntelligenceView | null {
  const params = new URLSearchParams(search)
  if (!['days', 'platform', 'audience', 'category', 'q'].some(key => params.has(key))) return null
  return validateIntelligenceView({ days: params.get('days'), platform: params.get('platform'), audience: params.get('audience'), category: params.get('category'), query: params.get('q') })
}
export function viewSearch(view: IntelligenceView): string {
  const params = new URLSearchParams()
  if (view.days !== 7) params.set('days', String(view.days))
  for (const key of ['platform', 'audience', 'category'] as const) if (view[key] !== 'all') params.set(key, view[key])
  if (view.query.trim()) params.set('q', view.query.trim())
  return params.toString()
}
