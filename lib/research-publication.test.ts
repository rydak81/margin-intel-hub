import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { RESEARCH_ARTICLES } from '@/lib/research-articles'
import { buildLlmsTxt } from '@/lib/llms-txt'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

describe('automated research publication', () => {
  it('keeps public table counts consistent with the dated evidence', () => {
    const data = JSON.parse(readFileSync('public/research/headline-coverage-2026-11-02.json','utf8'))
    const table = RESEARCH_ARTICLES[0].sections.find(s=>s.id==='results')!.table!
    expect(data.complete).toBe(true)
    expect(data.metrics).toHaveLength(table.rows.length)
    data.metrics.forEach((m: {baselineHits:number;baselineN:number;currentHits:number;currentN:number}, i: number) => {
      expect(table.rows[i][1]).toBe(`${m.baselineHits} / ${m.baselineN}`)
      expect(table.rows[i][2]).toBe(`${m.currentHits} / ${m.currentN}`)
    })
  })
  it('discloses automation instead of claiming individual human review', async () => {
    const {default:Page} = await import('@/app/intelligence/analysis/[slug]/page')
    const el = await Page({params:Promise.resolve({slug:RESEARCH_ARTICLES[0].slug})})
    const html = renderToStaticMarkup(createElement(()=>el))
    expect(html).toContain('Not individually human-reviewed.')
    expect(html).not.toContain('AI-assisted, human-reviewed analysis.')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('headline-coverage-2026-11-02.json')
  })
  it('appears in the machine-readable article directory', () => {
    expect(buildLlmsTxt()).toContain(`/intelligence/analysis/${RESEARCH_ARTICLES[0].slug}`)
  })
})
