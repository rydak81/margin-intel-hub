import assert from 'node:assert/strict'
import test from 'node:test'
import { getMarketplace } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'
import {
  PUBLISHED_RATE_PCT, REPORTED_RATE_PCT, SOURCES, TIKTOK_FEE_CHANGE_SOURCE_KEY, faqs, impliedRatePct, monthlyRows,
  priceComparisonRows, profitSqueeze, referralFee, refundAdminFee, workedOrderFees,
} from '@/lib/tiktok-fee-change-2026'

test('published rate matches the fee dataset (no drift from /fees/tiktok-shop)', () => {
  const tts = getMarketplace('tiktok-shop')!
  assert.equal(PUBLISHED_RATE_PCT, 6)
  assert.equal(REPORTED_RATE_PCT, 8)
  for (const c of tts.categories) assert.equal(c.referralPct, PUBLISHED_RATE_PCT, c.slug)
})

test("TikTok's own worked example reproduces: 6% x ($102 + $5 - $2) = $6.30", () => {
  assert.equal(referralFee(6, { customerPayment: 102, platformDiscount: 5, tax: 2 }), 6.3)
  assert.equal(refundAdminFee(6.3), 1.26)
  assert.equal(refundAdminFee(30), 5) // $500 x 6% = $30 -> 20% = $6, capped at $5
  assert.equal(refundAdminFee(0.6), 0.12) // TikTok scenario A: $10 SKU
})

test('price table math', () => {
  const rows = priceComparisonRows()
  const r20 = rows.find(r => r.base === 20)!
  assert.deepEqual([r20.at6, r20.at8, r20.diff], [1.2, 1.6, 0.4])
  const r100 = rows.find(r => r.base === 100)!
  assert.deepEqual([r100.at6, r100.at8, r100.diff], [6, 8, 2])
  for (const r of rows) assert.equal(Math.round((r.at8 / r.at6) * 1000) / 1000, 1.333)
})

test('worked order, monthly and margin examples', () => {
  const w = workedOrderFees()
  assert.deepEqual([w.customerPayment, w.base, w.at6, w.at8, w.diff], [28, 29, 1.74, 2.32, 0.58])
  assert.equal(impliedRatePct({ referralFee: -1.74, customerPayment: 28, platformDiscount: 3, tax: 2 }), 6)
  assert.equal(impliedRatePct({ referralFee: -2.32, customerPayment: 28, platformDiscount: 3, tax: 2 }), 8)
  assert.deepEqual(monthlyRows().map(m => m.diff), [200, 1000, 5000])
  assert.deepEqual(profitSqueeze(), { price: 25, profitAt6: 3, extra: 0.5, profitAt8: 2.5, cutPct: 16.67 })
})

test('CTA source key is allowlisted', () => {
  assert.equal(newsletterSource(`?source=${TIKTOK_FEE_CHANGE_SOURCE_KEY}`), `newsletter_${TIKTOK_FEE_CHANGE_SOURCE_KEY}`)
})

test('every source is https, official ones are TikTok-hosted, and copy is clean', () => {
  for (const s of SOURCES) {
    assert.match(s.url, /^https:\/\//)
    if (s.official) assert.match(new URL(s.url).hostname, /(^|\.)tiktok\.com$/)
  }
  const text = JSON.stringify({ SOURCES, faqs: faqs() })
  assert.doesNotMatch(text, /keepa|everbee|supabase|\bCPI\b|probabilit/i)
})

test('the change log entry for the TikTok correction links to the explainer', async () => {
  const { FEE_CHANGELOG } = await import('@/lib/fee-changelog')
  const { TIKTOK_FEE_CHANGE_PATH } = await import('@/lib/tiktok-fee-change-2026')
  const linked = FEE_CHANGELOG.filter(e => e.explainer?.href === TIKTOK_FEE_CHANGE_PATH)
  assert.equal(linked.length, 1)
  assert.ok(linked[0].changes.some(c => c.marketplace === 'tiktok-shop'))
})
