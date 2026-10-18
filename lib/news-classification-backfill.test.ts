import { expect, it, vi } from 'vitest'
vi.mock('@/lib/ai-client', () => ({ callAIForJSON: vi.fn(async () => ({ data: { aiSummary: 'Not relevant.', relevanceScore: 0 }, provider: 'test', model: 'test' })) }))
import { classifyArticle, evaluateOperatorValue } from './news-classification'
it('preserves a zero relevance score instead of replacing it with 0.5', async () => {
  const result = await classifyArticle({ title: 'Unrelated news' })
  expect(result.relevanceScore).toBe(0)
  expect(evaluateOperatorValue({ title: 'Unrelated news' }, result).relevant).toBe(false)
})
