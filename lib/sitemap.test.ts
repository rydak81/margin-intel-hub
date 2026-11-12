import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'

describe('sitemap', () => {
  it('lists the revenue pages', async () => {
    const urls = (await sitemap()).map(e => e.url)
    expect(urls).toContain('https://marketplacebeta.com/pricing')
    expect(urls).toContain('https://marketplacebeta.com/sponsor')
  })
  it('lists each URL once and no redirecting paths', async () => {
    const urls = (await sitemap()).map(e => e.url)
    expect(new Set(urls).size).toBe(urls.length)
    for (const path of ['/partners', '/solutions', '/community']) expect(urls).not.toContain(`https://marketplacebeta.com${path}`)
  })
  it('lists every original analysis article', async () => {
    const urls = (await sitemap()).map(e => e.url)
    expect(ANALYSIS_ARTICLES.length).toBeGreaterThan(0)
    for (const article of ANALYSIS_ARTICLES) {
      expect(urls).toContain(`https://marketplacebeta.com/intelligence/analysis/${article.slug}`)
    }
  })
})
