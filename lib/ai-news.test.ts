import { describe, expect, it } from 'vitest'
import { selectAiCommerceNews } from './ai-news'
import type { IntelligenceArticle } from './intelligence'

const now = Date.parse('2026-11-03T12:00:00Z')
function story(id: string, title: string, publishedAt = '2026-11-02T12:00:00Z', summary = ''): IntelligenceArticle {
  return { id, title, summary, publishedAt, sourceName: 'Example', sourceUrl: 'https://example.com', category: 'tools_technology', platforms: [], audience: [], impactLevel: 'medium', actionItem: '' }
}
describe('AI ecommerce news selection', () => {
  it('requires both AI and ecommerce context, not a broad technology tag', () => {
    const rows = [story('a', 'AI helps marketplace sellers review product listings'), story('b', 'Shopify Sidekick adds reporting features'), story('c', 'New ecommerce shipping labels'), story('d', 'AI helps astronomers study stars'), story('e', 'Retail sales reach record highs'), story('f', 'Amazon launches cloud infrastructure')]
    expect(selectAiCommerceNews(rows, now).map(x => x.id)).toEqual(['a', 'b'])
  })
  it('excludes old, invalid and future dates, and orders matching reports newest first', () => {
    const rows = [story('old', 'AI for ecommerce', '2026-09-01'), story('future', 'AI for ecommerce', '2026-11-04'), story('invalid', 'AI for ecommerce', 'bad'), story('earlier', 'AI for marketplace listings', '2026-11-01'), story('recent', 'AI for ecommerce', '2026-11-03T11:00:00Z')]
    expect(selectAiCommerceNews(rows, now).map(x => x.id)).toEqual(['recent', 'earlier'])
  })
  it('deduplicates headlines and caps the display without mutating source order', () => {
    const rows = [story('a', 'AI for Ecommerce!'), story('b', 'AI for ecommerce'), story('c', 'AI for customer support')]
    expect(selectAiCommerceNews(rows, now).map(x => x.id)).toEqual(['a', 'c'])
    expect(selectAiCommerceNews(rows, now, 1).map(x => x.id)).toEqual(['a'])
    expect(rows.map(x => x.id)).toEqual(['a', 'b', 'c'])
  })
})
