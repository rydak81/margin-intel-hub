/** Public news signals only. No private account data or inferred sales metrics. */
export interface IntelligenceArticle {
  id: string
  title: string
  summary: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  category: string
  categoryBasis?: 'stored' | 'headline_rule' | 'general'
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
  ['compliance_policy', 'Policy & compliance'], ['commerce_context', 'Commerce context'],
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
      (filters.audience === 'all' || (filters.audience === 'logistics' ? article.category === 'logistics' : filters.audience === 'saas' ? article.category === 'tools_technology' || article.audience.includes('saas') : article.audience.includes(filters.audience))) &&
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

/** Legacy broad labels are routed by explicit headline rules, never rewritten in storage. */
export function normalizeIntelligenceTags(input: { title: string; category: string; platforms: string[]; audience: string[] }) {
  const known = INTELLIGENCE_CATEGORIES.some(([key]) => key === input.category)
  const rules: [string, RegExp][] = [
    ['compliance_policy', /\b(tariffs?|regulat(?:ion|ory)|compliance|lawsuit|ban(?:s|ned)?|import duties)\b/i],
    ['mergers_acquisitions', /\b(acquir(?:es|ed|ing)|acquisition|merger|buys)\b/i],
    ['profitability', /\b(fees?|margins?|profitability|cost pressure|reimbursements?)\b/i],
    ['advertising', /\b(ads?|advertising|retail media|sponsored|ppc|cpc)\b/i],
    ['logistics', /\b(fulfil(?:l)?ment|shipping|delivery|warehouse|logistics|returns?|inventory)\b/i],
    ['market_metrics', /\b(spending|earnings|sales|gmv|market share|growth|revenue)\b/i],
    ['tools_technology', /\b(ai|software|api|integration|automation|technology)\b/i],
    ['platform_updates', /\b(seller central|listings?|policy|policies|marketplace update)\b/i],
  ]
  const routed = known ? undefined : rules.find(([, pattern]) => pattern.test(input.title))?.[0]
  const category = known ? input.category : routed || 'commerce_context'
  const categoryBasis = known ? 'stored' as const : routed ? 'headline_rule' as const : 'general' as const
  const audience = [...new Set(input.audience.map(value => ['brands', 'brand_sellers'].includes(value) ? 'sellers' : value))]
  const platforms = [...new Set(input.platforms.map(value => value === 'general' ? 'multi_platform' : value))]
  return { category, categoryBasis, audience, platforms }
}
