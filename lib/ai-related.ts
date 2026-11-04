/**
 * Internal links for /ai and every /ai/<workflow> page, built the same way as the
 * fee-page "Related" block (lib/related-links.ts): a general rule, computed at build
 * time, rendered as plain server-side links.
 *
 * Each workflow category has a short list of topics. An analysis article relates to a
 * workflow when one of those topics appears as a whole word (case-insensitive) in the
 * article's tags, SEO title or headline. Up to RELATED_ANALYSIS_LIMIT articles are
 * shown, newest first.
 *
 * Fee pages: every marketplace the playbook names, plus every marketplace the related
 * analysis covers (analysisMarketplaces from lib/related-links.ts), in fee-table order.
 * Every page also links /fees/compare-by-item-price.
 *
 * Back links: a small, explicit map from 1-3 analysis articles to the workflow they
 * fit. A test checks each pair is also produced by the topic rule above.
 */
import { latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { getAiPlaybook, type AiPlaybook } from '@/lib/ai-playbooks'
import { MARKETPLACES, type Marketplace } from '@/lib/marketplace-fees'
import { RELATED_ANALYSIS_LIMIT, RELATED_FEE_COMPARE, analysisMarketplaces, countMentions } from '@/lib/related-links'
import { briefSignupHref } from '@/lib/brief-cta'

/** Newsletter attribution key for the /ai hub. */
export const AI_HUB_SOURCE = 'campaign_ai_hub' as const

/** Newsletter attribution key for one /ai/<workflow> page, e.g. campaign_ai_customer_support_drafts. */
export function aiWorkflowSource(slug: string): `campaign_${string}` {
  const part = slug.toLowerCase().replace(/^ai-/, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return `campaign_ai_${part}`.slice(0, 64).replace(/_+$/, '') as `campaign_${string}`
}

export const aiHubBriefHref = () => briefSignupHref(AI_HUB_SOURCE)
export const aiWorkflowBriefHref = (slug: string) => briefSignupHref(aiWorkflowSource(slug))

/** Topics per workflow category. Matched against analysis tags, SEO titles and headlines. */
export const AI_WORKFLOW_TOPICS: Record<string, readonly string[]> = {
  Listings: ['listing', 'listings', 'referral fee', 'referral fees'],
  Reporting: ['settlement report', 'referral fee', 'referral fees', 'fees'],
  Support: ['returns', 'return policy', 'returns processing fee'],
  Advertising: ['advertising', 'Offsite Ads', 'ads'],
  Inventory: ['inventory', 'peak season', 'fulfillment'],
  'Product feeds': ['checkout', 'product feed', 'catalog'],
  'Building tools': ['landed cost', 'tariffs', 'pricing'],
  'Agentic workflows': ['AI agents', 'checkout'],
}

/** Topics for the /ai hub: the AI-focused analysis. */
export const AI_HUB_TOPICS: readonly string[] = ['AI agents']

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function topicPattern(topics: readonly string[]): RegExp | null {
  if (topics.length === 0) return null
  const sorted = [...new Set(topics)].sort((a, b) => b.length - a.length)
  return new RegExp(`(?<![A-Za-z0-9])(?:${sorted.map(escape).join('|')})(?![A-Za-z0-9])`, 'i')
}

type ArticleFraming = Pick<AnalysisArticle, 'tags' | 'seoTitle' | 'headline'>

/** True when any topic appears as a whole word in the article's tags, SEO title or headline. */
export function articleMatchesTopics(a: ArticleFraming, topics: readonly string[]): boolean {
  const re = topicPattern(topics)
  if (!re) return false
  return [...a.tags, a.seoTitle, a.headline].some(text => re.test(text))
}

export function topicsForPlaybook(p: Pick<AiPlaybook, 'category'>): readonly string[] {
  return AI_WORKFLOW_TOPICS[p.category] ?? []
}

/** Up to `limit` newest analysis articles for a workflow. */
export function relatedAnalysisForPlaybook(p: Pick<AiPlaybook, 'category'>, limit = RELATED_ANALYSIS_LIMIT, articles: AnalysisArticle[] = latestAnalysis()): AnalysisArticle[] {
  const topics = topicsForPlaybook(p)
  return articles.filter(a => articleMatchesTopics(a, topics)).slice(0, limit)
}

export function relatedAnalysisForHub(limit = RELATED_ANALYSIS_LIMIT, articles: AnalysisArticle[] = latestAnalysis()): AnalysisArticle[] {
  return articles.filter(a => articleMatchesTopics(a, AI_HUB_TOPICS)).slice(0, limit)
}

function playbookText(p: AiPlaybook): string {
  return [p.title, p.summary, p.outcome, ...p.inputs, ...p.steps.flatMap(s => [s.title, s.body]), p.prompt, ...p.review, ...p.metrics, ...p.pitfalls].join('\n')
}

/** Marketplaces a playbook names or its related analysis covers, in fee-table order. */
export function feeMarketplacesForPlaybook(p: AiPlaybook, articles: AnalysisArticle[] = relatedAnalysisForPlaybook(p)): Marketplace[] {
  const text = playbookText(p)
  const covered = new Set(articles.flatMap(a => analysisMarketplaces(a).map(m => m.slug)))
  return MARKETPLACES.filter(m => countMentions(text, m) > 0 || covered.has(m.slug))
}

export type AiRelatedLink = { href: string; label: string; note: string; kind: 'compare' | 'fees' | 'analysis'; date?: string }

export const FEE_HUB_LINK = { href: '/fees', label: 'Marketplace fee tables' }

const compareLink = (note: string): AiRelatedLink => ({ kind: 'compare', href: RELATED_FEE_COMPARE.href, label: RELATED_FEE_COMPARE.label, note })
const feeLink = (m: Marketplace): AiRelatedLink => ({ kind: 'fees', href: `/fees/${m.slug}`, label: `${m.name} fees by category`, note: 'Fee table' })
const analysisLink = (a: AnalysisArticle): AiRelatedLink => ({ kind: 'analysis', href: `/intelligence/analysis/${a.slug}`, label: a.headline, note: 'Analysis', date: a.publishedOn })

/**
 * Related links for one workflow page: the fee comparison, each relevant marketplace
 * fee table (or the fee hub when the workflow covers no single marketplace), then
 * related analysis, newest first.
 */
export function aiWorkflowRelatedLinks(p: AiPlaybook, articles: AnalysisArticle[] = latestAnalysis()): AiRelatedLink[] {
  const analysis = relatedAnalysisForPlaybook(p, RELATED_ANALYSIS_LIMIT, articles)
  const markets = feeMarketplacesForPlaybook(p, analysis)
  return [
    compareLink('Check what each marketplace keeps at the same item price before you act on a workflow result.'),
    ...(markets.length > 0 ? markets.map(feeLink) : [{ kind: 'fees' as const, ...FEE_HUB_LINK, note: 'Fee tables for every marketplace we track' }]),
    ...analysis.map(analysisLink),
  ]
}

/** Related links for the /ai hub: fee comparison, the fee hub, every marketplace fee table and the AI-focused analysis. */
export function aiHubRelatedLinks(articles: AnalysisArticle[] = latestAnalysis()): AiRelatedLink[] {
  return [
    compareLink('Check what each marketplace keeps at the same item price.'),
    { kind: 'fees', ...FEE_HUB_LINK, note: 'Fee tables for every marketplace we track' },
    ...MARKETPLACES.map(feeLink),
    ...relatedAnalysisForHub(RELATED_ANALYSIS_LIMIT, articles).map(analysisLink),
  ]
}

/**
 * Analysis articles that link back to one workflow ("Try the workflow").
 * Keep this to 1-3 entries; lib/ai-related.test.ts checks each pair against the topic rule.
 */
export const ANALYSIS_WORKFLOW_BACKLINKS: Readonly<Record<string, string>> = {
  'holiday-returns-2026-amazon-walmart-etsy-ebay': 'ai-customer-support-drafts',
  'etsy-offsite-ads-fees-2026': 'ai-ad-search-term-review',
  'shopify-ai-channel-fees-chatgpt-checkout-2026': 'design-agentic-ecommerce-workflow',
}

export function workflowForAnalysis(articleSlug: string): AiPlaybook | undefined {
  const slug = ANALYSIS_WORKFLOW_BACKLINKS[articleSlug]
  return slug ? getAiPlaybook(slug) : undefined
}


/** Brief signup copy for /ai pages (passed to the shared BriefCta). */
export const AI_BRIEF_HEADING = 'Keep the inputs to your workflows current'
export const AI_BRIEF_BODY = 'The free Daily Marketplace Brief flags marketplace fee and policy changes with the source document, so the facts your AI workflows rely on stay up to date.'
