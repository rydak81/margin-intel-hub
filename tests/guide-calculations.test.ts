import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TS runner requires explicit extensions.
import { calculateGuideScenario as calc } from '../lib/guide-calculations.ts'
const near = (actual: number | null | undefined, expected: number) => assert.ok(typeof actual === 'number' && Math.abs(actual - expected) < 0.00001)
test('profitability distinguishes contribution from the monthly result after fixed costs', () => {
  const r = calc('product-profitability', { price:30, costs:23.7, orders:100, overhead:150 })!
  near(r.contribution,6.3); near(r.margin,21); near(r.monthly,480)
  near(calc('product-profitability',{price:27,costs:23.25,orders:100,overhead:150})!.contribution,3.75)
})
test('ad ceiling retains contribution and handles zero or negative budget', () => {
  const values = {price:30,costs:20.7,retain:4.5,conversion:10}
  const r=calc('break-even-advertising',values)!
  near(r.budget,4.8); near(r.acos,16); near(r.roas,6.25); near(r.cpc,.48)
  assert.equal(calc('break-even-advertising',{...values,costs:25.5})!.roas,null)
  assert.ok(calc('break-even-advertising',{...values,costs:29})!.budget! < 0)
})
test('channel expansion accounts for displaced orders and rounds up break-even volume', () => {
  const v={contribution:5.3,fixed:180,orders:100,displaced:0,existing:6.3}
  const r=calc('adding-a-marketplace',v)!
  assert.equal(r.breakEvenOrders,34); near(r.monthly,350)
  near(calc('adding-a-marketplace',{...v,displaced:100})!.monthly,-280)
  assert.equal(calc('adding-a-marketplace',{...v,contribution:0})!.breakEvenOrders,null)
  assert.equal(calc('adding-a-marketplace',{...v,displaced:101}),null)
})
test('invalid, absent and overflowing inputs cannot produce misleading outputs', () => {
  for (const price of [0,-1,NaN,Infinity]) assert.equal(calc('product-profitability',{price,costs:1,orders:1,overhead:1}),null)
  assert.equal(calc('product-profitability',{}),null)
  assert.equal(calc('product-profitability',{price:1e308,costs:1,orders:1e308,overhead:1}),null)
  assert.equal(calc('break-even-advertising',{price:30,costs:20,retain:4,conversion:101}),null)
})
