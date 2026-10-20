import { describe, expect, it } from 'vitest'
import { sanitizeAnalystOutput } from '@/lib/analyst'

const OPEN_IDS = [1, 2, 3]

describe('analyst output sanitizer', () => {
  it('rejects output without an assessment', () => {
    expect(sanitizeAnalystOutput(null, OPEN_IDS)).toBeNull()
    expect(sanitizeAnalystOutput({ watchlist: [] }, OPEN_IDS)).toBeNull()
    expect(sanitizeAnalystOutput({ assessment: '   ' }, OPEN_IDS)).toBeNull()
  })

  it('drops forecast checks for ids that are not open forecasts', () => {
    const out = sanitizeAnalystOutput({
      assessment: 'Quiet day.',
      forecast_checks: [
        { id: 1, signal: 'confirming', note: 'Carrier surcharges announced' },
        { id: 99, signal: 'confirming', note: 'Unknown forecast' },
        { id: 'x', signal: 'mixed', note: 'Bad id' },
      ],
    }, OPEN_IDS)
    expect(out?.forecast_checks).toEqual([{ id: 1, signal: 'confirming', note: 'Carrier surcharges announced' }])
  })

  it('falls back to safe enum values and bounds list sizes', () => {
    const out = sanitizeAnalystOutput({
      assessment: 'Busy day.',
      watchlist: Array.from({ length: 9 }, (_, i) => ({ item: `item ${i}`, why: 'because' })),
      forecast_checks: [{ id: 2, signal: 'definitely-happening', note: 'n' }],
      memory: Array.from({ length: 7 }, (_, i) => ({ kind: 'vibes', title: `t${i}`, body: 'b', confidence: 'certain' })),
    }, OPEN_IDS)
    expect(out?.watchlist).toHaveLength(5)
    expect(out?.forecast_checks[0].signal).toBe('none')
    expect(out?.memory).toHaveLength(4)
    expect(out?.memory[0]).toMatchObject({ kind: 'observation', confidence: 'low' })
  })

  it('downgrades a directional signal with no evidence note to none', () => {
    const out = sanitizeAnalystOutput({
      assessment: 'Signals without evidence.',
      forecast_checks: [
        { id: 1, signal: 'confirming', note: '' },
        { id: 2, signal: 'invalidating', note: 'Rates fell for a third week' },
      ],
    }, OPEN_IDS)
    expect(out?.forecast_checks).toEqual([
      { id: 1, signal: 'none', note: '' },
      { id: 2, signal: 'invalidating', note: 'Rates fell for a third week' },
    ])
  })

  it('lets post-mortems reference resolved forecasts while checks stay open-only', () => {
    const out = sanitizeAnalystOutput({
      assessment: 'F4 resolved; writing the post-mortem.',
      forecast_checks: [{ id: 4, signal: 'confirming', note: 'Resolved forecasts are not checked' }],
      memory: [{ kind: 'post_mortem', title: 'F4 post-mortem', body: 'The GMV call under-weighted divestiture risk.', confidence: 'high', related_forecasts: [4] }],
    }, OPEN_IDS, [...OPEN_IDS, 4])
    expect(out?.forecast_checks).toEqual([])
    expect(out?.memory[0].related_forecasts).toEqual([4])
  })

  it('keeps valid memory entries with whitelisted forecast links and supersedes titles', () => {
    const out = sanitizeAnalystOutput({
      assessment: 'A real shift.',
      memory: [{
        kind: 'correction',
        title: 'Freight pressure easing',
        body: 'Container rates fell for a third week; my earlier read of sustained pressure no longer holds.',
        confidence: 'medium',
        related_forecasts: [2, 99],
        source_titles: ['Rates fall again', ''],
        supersedes_title: 'Freight pressure building into Q4',
      }],
    }, OPEN_IDS)
    expect(out?.memory[0]).toMatchObject({
      kind: 'correction',
      related_forecasts: [2],
      source_titles: ['Rates fall again'],
      supersedes_title: 'Freight pressure building into Q4',
    })
  })
})
