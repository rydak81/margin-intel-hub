/** Public news signals only. No private account data or inferred sales metrics. */
export interface IntelligenceArticle {
  id: string
  title: string
  summary: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  category: string
  platforms: string[]
  audience: string[]
  impactLevel: string
  actionItem: string
}
export interface IntelligenceSnapshot {
  status: 'ready' | 'unavailable'
  checkedAt: string
  sampledCount: number
  capped: boolean
  articles: IntelligenceArticle[]
}
export const INTELLIGENCE_PLATFORMS = [
  ['amazon', 'Amazon'], ['walmart', 'Walmart'], ['ebay', 'eBay'], ['etsy', 'Etsy'],
  ['tiktok', 'TikTok Shop'], ['shopify', 'Shopify'], ['shein', 'SHEIN'], ['temu', 'Temu'],
  ['alibaba', 'Alibaba'], ['aliexpress', 'AliExpress'], ['target', 'Target+'], ['multi_platform', 'Cross-platform'],
] as const
export const INTELLIGENCE_CATEGORIES = [
  ['platform_updates', 'Platform changes'], ['profitability', 'Fees & margin'], ['advertising', 'Advertising'],
  ['logistics', 'Logistics'], ['tools_technology', 'Technology'], ['market_metrics', 'Market indicators'],
  ['mergers_acquisitions', 'M&A'], ['tactics', 'Operating tactics'], ['breaking', 'Breaking news'], ['events', 'Events'],
] as const
export const INTELLIGENCE_AUDIENCES = [
  ['sellers', 'Sellers & brands'], ['agencies', 'Agencies'], ['saas', 'Technology companies'],
  ['logistics', 'Logistics operators'], ['service_providers', 'Service providers'], ['investors', 'Investors'],
] as const
export function signalLabel(value: string, options: readonly (readonly [string, string])[]) {
  return options.find(([key]) => key === value)?.[1] || value.replaceAll('_', ' ')
}
export function filterIntelligence(articles: IntelligenceArticle[], filters: { days: number; platform: string; audience: string; category: string; query: string }, now: number) {
  const cutoff = now - filters.days * 86400000
  const query = filters.query.trim().toLowerCase()
  return articles.filter(article => {
    const date = Date.parse(article.publishedAt)
    return Number.isFinite(date) && date >= cutoff && date <= now &&
      (filters.platform === 'all' || article.platforms.includes(filters.platform)) &&
      (filters.audience === 'all' || (filters.audience === 'logistics' ? article.category === 'logistics' : article.audience.includes(filters.audience))) &&
      (filters.category === 'all' || article.category === filters.category) &&
      (!query || `${article.title} ${article.summary} ${article.sourceName}`.toLowerCase().includes(query))
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
export function safeSourceUrl(value: string): string | null {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null } catch { return null }
}
export const DECISION_PROMPTS: Record<string, string> = {
  profitability: 'Recalculate contribution margin for affected SKUs before changing prices.',
  advertising: 'Check which campaigns are affected, then compare any test with your break-even ad budget.',
  logistics: 'Confirm affected lanes, delivery promises, and inventory exposure with your provider.',
  platform_updates: 'Check the official announcement for eligibility, region, and effective dates.',
  tools_technology: 'Validate integration requirements and pilot the workflow before committing spend.',
  market_metrics: 'Compare the reported population and period with your own category before extrapolating.',
  mergers_acquisitions: 'Check whether contracts, integrations, pricing, or service continuity could change.',
  tactics: 'Define a small test and a measurable success criterion before rolling out the tactic.',
}
