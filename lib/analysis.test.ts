import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, parseInlineLinks } from '@/lib/analysis'
import { FORECASTS } from '@/lib/forecasts'
import { newsletterSource } from '@/lib/newsletter-source'

const allText = (a: (typeof ANALYSIS_ARTICLES)[number]) => [
  a.seoTitle, a.metaDescription, a.headline, a.dek, a.takeaway,
  ...a.sections.flatMap(s => [s.title, ...s.paragraphs, ...(s.bullets ?? []), ...(s.table ? [s.table.caption, ...s.table.headings, ...s.table.rows.flat()] : [])]),
].join('\n')

const INTERNAL_PREFIXES = ['/intelligence', '/intelligence/forecasts', '/intelligence/dossier', '/intelligence/pressure-index', '/fees', '/newsletter', '/guides', '/tools']

describe('analysis articles', () => {
  it('have unique slugs and valid ISO dates', () => {
    expect(new Set(ANALYSIS_ARTICLES.map(a => a.slug)).size).toBe(ANALYSIS_ARTICLES.length)
    for (const a of ANALYSIS_ARTICLES) {
      expect(a.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(a.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.updatedOn >= a.publishedOn).toBe(true)
    }
  })

  it('keep SEO fields within length limits', () => {
    for (const a of ANALYSIS_ARTICLES) {
      expect(a.seoTitle.length).toBeLessThan(60)
      expect(a.metaDescription.length).toBeLessThan(155)
    }
  })

  it('use an allowlisted newsletter source', () => {
    for (const a of ANALYSIS_ARTICLES) expect(newsletterSource(`?source=${a.newsletterSource}`)).toBe(`newsletter_${a.newsletterSource}`)
  })

  it('reference only real forecasts and never show odds', () => {
    const ids = new Set(FORECASTS.map(f => f.id))
    for (const a of ANALYSIS_ARTICLES) {
      for (const id of a.forecastIds) expect(ids.has(id)).toBe(true)
      expect(allText(a)).not.toMatch(/probabilit|\bodds\b|\blikelihood of F\d/i)
    }
  })

  it('do not name internal data vendors or the old index abbreviation', () => {
    for (const a of ANALYSIS_ARTICLES) expect(allText(a)).not.toMatch(/keepa|everbee|supabase|\bCPI\b/i)
  })

  it('link internally only to known sections and cite at least one source', () => {
    for (const a of ANALYSIS_ARTICLES) {
      expect(a.sources.length).toBeGreaterThan(0)
      const links = a.sections.flatMap(s => [...s.paragraphs, ...(s.bullets ?? [])]).flatMap(parseInlineLinks).filter(p => p.href)
      for (const l of links) {
        if (l.href!.startsWith('/')) expect(INTERNAL_PREFIXES.some(p => l.href === p || l.href!.startsWith(`${p}/`))).toBe(true)
        else expect(l.href).toMatch(/^https:\/\//)
      }
    }
  })
})

describe('parseInlineLinks', () => {
  it('splits markdown-style links and keeps plain text', () => {
    expect(parseInlineLinks('See [the scorecard](/intelligence/forecasts) now.')).toEqual([
      { text: 'See ' }, { text: 'the scorecard', href: '/intelligence/forecasts' }, { text: ' now.' },
    ])
    expect(parseInlineLinks('No links here')).toEqual([{ text: 'No links here' }])
  })
})
