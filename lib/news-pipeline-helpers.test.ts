import { describe, expect, it } from 'vitest'
import { budgetExhausted, orderSourcesForFetch, runWithConcurrency, selectNewArticles } from './news-aggregation/pipeline-helpers'

describe('orderSourcesForFetch', () => {
  it('puts never-fetched and stalest sources first, then higher priority', () => {
    const sources = [
      { name: 'fresh-high', priority_score: 99, last_fetched_at: '2026-10-17T05:00:00Z' },
      { name: 'starved-low', priority_score: 74, last_fetched_at: '2026-10-12T05:01:00Z' },
      { name: 'never', priority_score: 50, last_fetched_at: null },
      { name: 'fresh-low', priority_score: 60, last_fetched_at: '2026-10-17T05:00:00Z' },
    ]
    expect(orderSourcesForFetch(sources).map(s => s.name)).toEqual(['never', 'starved-low', 'fresh-high', 'fresh-low'])
  })
})

describe('selectNewArticles', () => {
  it('drops stored and duplicate URLs so classifier fields are never overwritten', () => {
    const articles = [{ source_url: 'a' }, { source_url: 'b' }, { source_url: 'b' }, { source_url: 'c' }]
    expect(selectNewArticles(articles, ['a']).map(a => a.source_url)).toEqual(['b', 'c'])
  })
})

describe('runWithConcurrency', () => {
  it('processes everything with bounded parallelism', async () => {
    let inFlight = 0
    let peak = 0
    const done: number[] = []
    await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async n => {
      inFlight++
      peak = Math.max(peak, inFlight)
      await new Promise(r => setTimeout(r, 5))
      done.push(n)
      inFlight--
    })
    expect(done.sort()).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(peak).toBe(3)
  })

  it('stops starting work once the budget is exhausted', async () => {
    let count = 0
    const started = await runWithConcurrency([1, 2, 3, 4, 5], 1, async () => { count++ }, () => count >= 2)
    expect(started).toBe(2)
  })
})

describe('budgetExhausted', () => {
  it('compares elapsed time to the budget', () => {
    expect(budgetExhausted(0, 1000, 999)).toBe(false)
    expect(budgetExhausted(0, 1000, 1001)).toBe(true)
  })
})
