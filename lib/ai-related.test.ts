import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, getAnalysis, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { AI_PLAYBOOKS, getAiPlaybook } from '@/lib/ai-playbooks'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { RELATED_ANALYSIS_LIMIT, RELATED_FEE_COMPARE } from '@/lib/related-links'
import { newsletterSource } from '@/lib/newsletter-source'
import { AiRelatedLinks, AnalysisWorkflowLink } from '@/components/related-links'
import {
  AI_BRIEF_BODY, AI_BRIEF_HEADING, AI_HUB_SOURCE, AI_WORKFLOW_TOPICS, ANALYSIS_WORKFLOW_BACKLINKS, FEE_HUB_LINK,
  aiHubBriefHref, aiHubRelatedLinks, aiWorkflowBriefHref, aiWorkflowRelatedLinks, aiWorkflowSource,
  articleMatchesTopics, feeMarketplacesForPlaybook, relatedAnalysisForHub, relatedAnalysisForPlaybook, workflowForAnalysis,
} from '@/lib/ai-related'

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probabilit|\\bodds\\b`, 'i')
const pb = (slug: string) => getAiPlaybook(slug)!

function article(overrides: Partial<AnalysisArticle> = {}): AnalysisArticle {
  return {
    slug: 'test', seoTitle: 'Parcel rates', metaDescription: 'm', headline: 'Parcel rates', dek: 'd',
    publishedOn: '2026-10-01', updatedOn: '2026-10-01', author: 'x', readTime: '1 min', tags: ['logistics'],
    takeaway: 't', forecastIds: [], newsletterSource: 'campaign_test',
    sections: [{ id: 's', title: 'Body', paragraphs: [] }], sources: [], ...overrides,
  }
}

describe('/ai newsletter source keys', () => {
  it('gives the hub and every workflow its own allowlisted campaign_ key', () => {
    const keys = [AI_HUB_SOURCE, ...AI_PLAYBOOKS.map(p => aiWorkflowSource(p.slug))]
    expect(new Set(keys).size).toBe(keys.length)
    for (const k of keys) {
      expect(k).toMatch(/^campaign_ai_[a-z0-9_]+$/)
      expect(k.length).toBeLessThanOrEqual(64)
      expect(newsletterSource(`?source=${k}`)).toBe(`newsletter_${k}`)
    }
  })
  it('drops the redundant ai- prefix and follows the /newsletter?source=<key>#subscribe convention', () => {
    expect(aiWorkflowSource('ai-customer-support-drafts')).toBe('campaign_ai_customer_support_drafts')
    expect(aiWorkflowSource('design-agentic-ecommerce-workflow')).toBe('campaign_ai_design_agentic_ecommerce_workflow')
    expect(aiHubBriefHref()).toBe('/newsletter?source=campaign_ai_hub#subscribe')
    expect(aiWorkflowBriefHref('ai-weekly-operating-brief')).toBe('/newsletter?source=campaign_ai_weekly_operating_brief#subscribe')
  })
  it('clips very long slugs to the 64-char limit without a trailing separator', () => {
    const k = aiWorkflowSource(`ai-${'x'.repeat(50)}-${'y'.repeat(30)}`)
    expect(k.length).toBeLessThanOrEqual(64)
    expect(k).not.toMatch(/_$/)
  })
})

describe('topic matching', () => {
  it('has topics for every workflow category in the library', () => {
    for (const p of AI_PLAYBOOKS) expect(AI_WORKFLOW_TOPICS[p.category]?.length ?? 0).toBeGreaterThan(0)
  })
  it('matches whole words in tags, SEO title or headline, case-insensitive', () => {
    expect(articleMatchesTopics(article({ tags: ['Return policy'] }), ['return policy'])).toBe(true)
    expect(articleMatchesTopics(article({ headline: 'Holiday returns open to January' }), ['returns'])).toBe(true)
    expect(articleMatchesTopics(article({ seoTitle: 'Etsy Offsite Ads fees' }), ['offsite ads'])).toBe(true)
  })
  it('ignores topics embedded in longer words, the body and the dek', () => {
    expect(articleMatchesTopics(article({ headline: 'Overreturns and preturns' }), ['returns'])).toBe(false)
    expect(articleMatchesTopics(article({ dek: 'returns' }), ['returns'])).toBe(false)
    expect(articleMatchesTopics(article({ sections: [{ id: 's', title: 'returns', paragraphs: ['returns returns'] }] }), ['returns'])).toBe(false)
    expect(articleMatchesTopics(article(), [])).toBe(false)
  })
  it('returns at most the limit, newest first, from the real archive', () => {
    for (const p of AI_PLAYBOOKS) {
      const got = relatedAnalysisForPlaybook(p)
      expect(got.length).toBeLessThanOrEqual(RELATED_ANALYSIS_LIMIT)
      const order = latestAnalysis().map(a => a.slug)
      expect(got.map(a => order.indexOf(a.slug))).toEqual([...got.map(a => order.indexOf(a.slug))].sort((a, b) => a - b))
    }
  })
  it('maps workflows to relevant analysis', () => {
    const rel = (slug: string) => relatedAnalysisForPlaybook(pb(slug)).map(a => a.slug)
    if (getAnalysis('holiday-returns-2026-amazon-walmart-etsy-ebay')) expect(rel('ai-customer-support-drafts')).toContain('holiday-returns-2026-amazon-walmart-etsy-ebay')
    if (getAnalysis('etsy-offsite-ads-fees-2026')) expect(rel('ai-ad-search-term-review')).toContain('etsy-offsite-ads-fees-2026')
    for (const a of relatedAnalysisForHub()) expect(a.tags).toContain('AI agents')
  })
})

describe('fee links', () => {
  it('includes marketplaces the playbook names plus those its related analysis covers, in fee-table order', () => {
    const listing = pb('ai-product-listing-workflow')
    const slugs = feeMarketplacesForPlaybook(listing, []).map(m => m.slug)
    expect(slugs).toContain('amazon')
    const order = MARKETPLACES.map(m => m.slug)
    const all = feeMarketplacesForPlaybook(listing).map(m => m.slug)
    expect(all).toEqual([...all].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
    const etsyArticle = article({ tags: ['Etsy'] })
    expect(feeMarketplacesForPlaybook(pb('design-agentic-ecommerce-workflow'), [etsyArticle]).map(m => m.slug)).toEqual(['etsy'])
  })
  it('every workflow links the fee comparison and at least one fee page', () => {
    for (const p of AI_PLAYBOOKS) {
      const links = aiWorkflowRelatedLinks(p)
      expect(links[0]).toMatchObject({ kind: 'compare', href: RELATED_FEE_COMPARE.href })
      expect(links.some(l => l.kind === 'fees' && (l.href === FEE_HUB_LINK.href || /^\/fees\/[a-z-]+$/.test(l.href)))).toBe(true)
      expect(new Set(links.map(l => l.href)).size).toBe(links.length)
    }
  })
  it('falls back to the fee hub when a workflow covers no single marketplace', () => {
    const links = aiWorkflowRelatedLinks(pb('design-agentic-ecommerce-workflow'), [])
    expect(links.filter(l => l.kind === 'fees')).toEqual([expect.objectContaining({ href: '/fees' })])
  })
  it('hub links the comparison, fee hub, every marketplace and only AI-focused analysis', () => {
    const links = aiHubRelatedLinks()
    expect(links.map(l => l.href)).toEqual(expect.arrayContaining([RELATED_FEE_COMPARE.href, '/fees', ...MARKETPLACES.map(m => `/fees/${m.slug}`)]))
    expect(links.filter(l => l.kind === 'analysis').length).toBeLessThanOrEqual(RELATED_ANALYSIS_LIMIT)
  })
  it('only links pages that exist', () => {
    const analysis = new Set(ANALYSIS_ARTICLES.map(a => `/intelligence/analysis/${a.slug}`))
    const fees = new Set(['/fees', RELATED_FEE_COMPARE.href, ...MARKETPLACES.map(m => `/fees/${m.slug}`)])
    for (const l of [...aiHubRelatedLinks(), ...AI_PLAYBOOKS.flatMap(p => aiWorkflowRelatedLinks(p))]) {
      expect(l.kind === 'analysis' ? analysis.has(l.href) : fees.has(l.href)).toBe(true)
    }
  })
})

describe('analysis back links', () => {
  it('maps 1-3 real articles to real workflows that the topic rule also relates', () => {
    const pairs = Object.entries(ANALYSIS_WORKFLOW_BACKLINKS)
    expect(pairs.length).toBeGreaterThanOrEqual(1)
    expect(pairs.length).toBeLessThanOrEqual(3)
    for (const [articleSlug, workflowSlug] of pairs) {
      const a = getAnalysis(articleSlug)
      const p = getAiPlaybook(workflowSlug)
      expect(a, articleSlug).toBeDefined()
      expect(p, workflowSlug).toBeDefined()
      expect(articleMatchesTopics(a!, AI_WORKFLOW_TOPICS[p!.category])).toBe(true)
      expect(workflowForAnalysis(articleSlug)).toBe(p)
    }
    expect(workflowForAnalysis('not-mapped')).toBeUndefined()
  })
  it('renders a Try the workflow link only for mapped articles', () => {
    const [articleSlug, workflowSlug] = Object.entries(ANALYSIS_WORKFLOW_BACKLINKS)[0]
    const html = renderToStaticMarkup(createElement(AnalysisWorkflowLink, { article: { slug: articleSlug } }))
    expect(html).toContain('Try the workflow')
    expect(html).toContain(`href="/ai/${workflowSlug}"`)
    expect(renderToStaticMarkup(createElement(AnalysisWorkflowLink, { article: { slug: 'not-mapped' } }))).toBe('')
  })
})

describe('rendered Related block and copy', () => {
  it('renders every link as a plain server-side anchor', () => {
    for (const p of AI_PLAYBOOKS) {
      const links = aiWorkflowRelatedLinks(p)
      const html = renderToStaticMarkup(createElement(AiRelatedLinks, { links }))
      expect(html).toContain('id="related"')
      for (const l of links) expect(html).toContain(`href="${l.href}"`)
      expect(html).not.toMatch(FORBIDDEN)
    }
    expect(renderToStaticMarkup(createElement(AiRelatedLinks, { links: [] }))).toBe('')
  })
  it('keeps new copy free of tool names, forecast odds and vendor names', () => {
    const copy = [AI_BRIEF_HEADING, AI_BRIEF_BODY].join(' ')
    expect(copy).not.toMatch(FORBIDDEN)
    expect(copy).not.toMatch(/shopify|google|openai|chatgpt|anthropic|claude|n8n/i)
  })
})
