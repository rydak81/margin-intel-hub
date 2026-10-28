import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ANALYSIS_ARTICLES, type AnalysisArticle } from '@/lib/analysis'
import { analysisFaq, analysisFaqJsonLd, parseFaqSection } from '@/lib/analysis-faq'
import { MARKETPLACES } from '@/lib/marketplace-fees'

const base = ANALYSIS_ARTICLES[0]
const withFaq: AnalysisArticle = {
  ...base,
  slug: 'faq-fixture',
  sections: [
    ...base.sections.filter(s => s.id !== 'faq'),
    {
      id: 'faq',
      title: 'Questions sellers ask',
      paragraphs: ['Answers read on a fixed date.'],
      bullets: [
        'Can I opt out? Only below $10,000 in the past 365 days. See [Etsy policy](https://www.etsy.com/legal/fees/) for the rule.',
        'What is the cap? $100 per order; no fee beyond that. Check the [fee log](/fees/changelog).',
      ],
    },
  ],
}

vi.mock('@/lib/analysis', async (orig) => {
  const mod = await orig<typeof import('@/lib/analysis')>()
  return { ...mod, getAnalysis: (slug: string) => (slug === 'faq-fixture' ? withFaq : mod.getAnalysis(slug)) }
})
vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))

const ldBlocks = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => {
  const v = JSON.parse(m[1].replace(/\\u003c/g, '<'))
  return Array.isArray(v) ? v : [v]
})

describe('analysis FAQ parsing', () => {
  it('splits "Question? Answer" bullets and strips inline links to their label', () => {
    const items = analysisFaq(withFaq)
    expect(items).toHaveLength(2)
    expect(items[0].question).toBe('Can I opt out?')
    expect(items[0].answer).toBe('Only below $10,000 in the past 365 days. See Etsy policy for the rule.')
    expect(items[0].answerMarkup).toContain('[Etsy policy](https://www.etsy.com/legal/fees/)')
    expect(items[1].answer).toBe('$100 per order; no fee beyond that. Check the fee log.')
  })
  it('returns nothing without a faq section or when a bullet is not a question and answer', () => {
    expect(analysisFaq({ sections: base.sections.filter(s => s.id !== 'faq') })).toEqual([])
    expect(analysisFaqJsonLd({ sections: base.sections.filter(s => s.id !== 'faq') })).toBeNull()
    expect(parseFaqSection({ id: 'faq', title: 'x', paragraphs: [], bullets: ['A statement with no question.'] })).toEqual([])
    expect(parseFaqSection({ id: 'other', title: 'x', paragraphs: [], bullets: ['Q? A.'] })).toEqual([])
  })
  it('builds FAQPage JSON-LD from the same items', () => {
    const ld = analysisFaqJsonLd(withFaq)!
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity.map(q => [q.name, q.acceptedAnswer.text])).toEqual(analysisFaq(withFaq).map(i => [i.question, i.answer]))
  })
})

describe('analysis article page', () => {
  async function render(slug: string) {
    const { default: Page } = await import('@/app/intelligence/analysis/[slug]/page')
    const el = await Page({ params: Promise.resolve({ slug }) })
    return renderToStaticMarkup(createElement(() => el))
  }
  it('emits FAQPage JSON-LD whose text is exactly the visible FAQ text', async () => {
    const html = await render('faq-fixture')
    const faq = ldBlocks(html).filter(b => b['@type'] === 'FAQPage')
    expect(faq).toHaveLength(1)
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '\u0000').split('\u0000').map(t => t.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')).join('')
    for (const q of faq[0].mainEntity) {
      // question and answer are each rendered as one element, so they appear as contiguous text
      const dt = new RegExp(`<dt[^>]*>${q.name.replace(/[$.?]/g, '\\$&')}</dt>`)
      expect(html).toMatch(dt)
      expect(visible).toContain(q.acceptedAnswer.text)
    }
    // other schema is kept
    expect(ldBlocks(html).map(b => b['@type'])).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList']))
  })
  it('emits no FAQPage JSON-LD for an article without FAQ data', async () => {
    const plain = ANALYSIS_ARTICLES.find(a => !a.sections.some(s => s.id === 'faq'))
    if (!plain) return
    const html = await render(plain.slug)
    expect(ldBlocks(html).filter(b => b['@type'] === 'FAQPage')).toEqual([])
  })
})

describe('Etsy Offsite Ads wording', () => {
  const etsy = MARKETPLACES.find(m => m.slug === 'etsy')!
  it('does not call Offsite Ads simply optional', () => {
    expect(etsy.summary).not.toMatch(/optional Offsite Ads/i)
    expect(etsy.summary).toContain('optional only for shops that earned less than $10,000 in the past 365 days')
    expect(etsy.summary).toContain('15% fee, or 12% once past $10,000, capped at $100 per order')
  })
  it('has no unqualified "optional ... Offsite" wording anywhere in app, lib or components', () => {
    const files = ['lib/marketplace-fees.ts', 'lib/fee-short-answer.ts', 'lib/fee-changelog.ts', 'lib/llms-txt.ts']
    for (const f of files) expect(readFileSync(join(process.cwd(), f), 'utf8')).not.toMatch(/optional\s+Offsite/i)
  })
})
