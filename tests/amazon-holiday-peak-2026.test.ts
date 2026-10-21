import assert from 'node:assert/strict'
import test from 'node:test'
import { newsletterSource } from '@/lib/newsletter-source'
import {
  AMAZON_PEAK_SOURCE_KEY, EXAMPLES, FORMULA_ROWS, SOURCES, STANDARD_ROWS, exampleMath, faqs, priceBand, storagePerUnit, withSurcharge,
} from '@/lib/amazon-holiday-peak-2026'

const row = (tier: string, weight: string) => STANDARD_ROWS.find(r => r.tier === tier && r.weight === weight)!

test('rate card spot checks against Amazon\'s published table', () => {
  assert.deepEqual(row('Small standard', '2 oz or less').peak, [2.62, 3.51, 3.77])
  assert.deepEqual(row('Small standard', '2+ to 4 oz').nonPeak, [2.49, 3.42, 3.68])
  assert.deepEqual(row('Large standard', '2.75+ to 3 lb').peak, [6.26, 7.08, 7.34])
  assert.deepEqual(FORMULA_ROWS.find(r => r.tier === 'Small bulky')!.peakBase, [7.82, 8.59, 8.59])
  assert.equal(STANDARD_ROWS.length, 20)
})

test('peak is always above non-peak, and the increase stays within the published pattern', () => {
  const r2 = (n: number) => Math.round(n * 100) / 100
  for (const r of STANDARD_ROWS) for (let i = 0; i < 3; i++) {
    const d = r2(r.peak[i] - r.nonPeak[i])
    assert.ok(d > 0 && d <= 0.41, `${r.tier} ${r.weight} band ${i}: ${d}`)
  }
  for (const r of FORMULA_ROWS) for (let i = 0; i < 3; i++) assert.ok(r.peakBase[i] > r.nonPeakBase[i])
})

test('surcharge, price bands and storage math', () => {
  assert.equal(withSurcharge(3.74), 3.87)
  assert.equal(withSurcharge(2.68), 2.77)
  assert.equal(withSurcharge(12.01), 12.43)
  assert.deepEqual([priceBand(9.99), priceBand(10), priceBand(50), priceBand(50.01)], ['under10', 'from10to50', 'from10to50', 'over50'])
  assert.deepEqual(storagePerUnit(0.1), { janSep: 0.08, octDec: 0.24 })
})

test('worked examples', () => {
  const m = Object.fromEntries(EXAMPLES.map(e => [e.id, exampleMath(e)]))
  assert.deepEqual([m.kitchen.referral, m.kitchen.nonPeakWithSurcharge, m.kitchen.peakWithSurcharge, m.kitchen.totalPeak, m.kitchen.extraPerUnit], [3, 3.66, 3.87, 6.87, 0.21])
  assert.deepEqual([m.accessory.referral, m.accessory.peakWithSurcharge, m.accessory.totalPeak], [1.35, 2.77, 4.12])
  assert.deepEqual([m.toy.referral, m.toy.peakWithSurcharge, m.toy.totalPeak], [5.1, 5.53, 10.63])
  assert.deepEqual([m.bulky.example.nonPeakFee, m.bulky.example.peakFee, m.bulky.referral, m.bulky.totalPeak], [10.97, 12.01, 8.85, 21.28])
})

test('CTA source key is allowlisted', () => {
  assert.equal(newsletterSource(`?source=${AMAZON_PEAK_SOURCE_KEY}`), `newsletter_${AMAZON_PEAK_SOURCE_KEY}`)
})

test('official sources are Amazon-hosted and copy is clean', () => {
  for (const s of SOURCES) if (s.official) assert.match(new URL(s.url).hostname, /(^|\.)amazon\.com$/)
  assert.doesNotMatch(JSON.stringify({ SOURCES, faqs: faqs() }), /keepa|everbee|supabase|\bCPI\b|probabilit/i)
})
