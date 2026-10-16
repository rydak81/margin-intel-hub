import assert from 'node:assert/strict'
import test from 'node:test'
import { getMarketplace, getComparableCategories, computeFeeBreakdown, referralFee, compareAcrossMarketplaces, orderFee } from '@/lib/marketplace-fees'
import { matchedCategories, overviewRows } from '@/lib/fee-compare'
const ebay = getMarketplace('ebay')!
const amazon = getMarketplace('amazon')!
const walmart = getMarketplace('walmart')!
const category = (slug: string) => ebay.categories.find(c => c.slug === slug)!
const calc = (slug: string, salePrice: number, buyerShipping = 0, unitCost = 0) => computeFeeBreakdown({ marketplace: ebay, category: category(slug), salePrice, buyerShipping, unitCost })

test('eBay instrument scope and representative low-value fees', () => {
  assert.equal(calc('musical-instruments', 100).totalFees, 14)
  assert.equal(calc('guitars-basses', 100).totalFees, 7.1)
  assert.match(category('musical-instruments').label, /excluding guitars/)
  assert.match(category('clothing-shoes-accessories').label, /excluding handbags and athletic shoes/)
  assert.match(category('coins-paper-money').label, /excluding bullion/)
})
test('eBay marginal rates at and around $7,500, on all applicable categories', () => {
  for (const [slug, rate] of [['most-categories', 13.6], ['musical-instruments', 13.6], ['guitars-basses', 6.7], ['books-movies-music', 15.3], ['coins-paper-money', 13.25], ['trading-cards', 13.25]] as const) {
    for (const price of [7499.99, 7500, 7500.01, 10000]) {
      const expected = Math.round((Math.min(price, 7500) * rate / 100 + Math.max(0, price - 7500) * .0235) * 100) / 100
      assert.equal(referralFee(price, category(slug)).amount, expected, `${slug} at ${price}`)
    }
  }
  assert.equal(calc('most-categories', 10000).totalFees, 1079.15)
  assert.equal(calc('guitars-basses', 10000).totalFees, 561.65)
})
test('small-order boundaries include buyer shipping and agree with break-even', () => {
  for (const [price, expected] of [[9.99, .3], [10, .3], [10.01, .4]]) assert.equal(orderFee(ebay, price), expected)
  assert.equal(calc('most-categories', 9, 1).totalFees, 1.66)
  assert.equal(calc('most-categories', 9, 1.01).totalFees, 1.76)
  const result = calc('most-categories', 10, 0, 8.3)
  assert.ok(calc('most-categories', result.breakEvenPrice, 0, 8.3).profit >= 0)
  for (const price of [10.01, 10.02, result.breakEvenPrice + .01]) {
    if (price >= result.breakEvenPrice) assert.ok(calc('most-categories', price, 0, 8.3).profit >= 0)
  }
  assert.match(overviewRows(ebay, amazon).find(r => r.label === 'Per-order fee')!.a, /0.30.*10.*0.40/)
})
test('jewelry whole-price tiers and watch marginal tiers are distinct', () => {
  assert.equal(referralFee(5000, category('jewelry-watches')).amount, 750)
  assert.equal(referralFee(5000.01, category('jewelry-watches')).amount, 450)
  assert.equal(referralFee(1000, category('watches')).amount, 150)
  assert.equal(referralFee(7500, category('watches')).amount, 572.5)
  assert.equal(referralFee(10000, category('watches')).amount, 647.5)
})
test('ambiguous device categories never become electronics comparisons', () => {
  assert.deepEqual(getComparableCategories('amazon', 'Amazon Device Accessories'), [])
  assert.deepEqual(getComparableCategories('amazon', 'Computers'), [])
  assert.deepEqual(matchedCategories(amazon, ebay), [])
  const rows = matchedCategories(amazon, walmart)
  assert.equal(rows.length, 7)
  assert.ok(!rows.some(r => r.aCategory.slug === 'amazon-device-accessories'))
  assert.equal(rows.find(r => r.aCategory.slug === 'consumer-electronics')!.bCategory.slug, 'consumer-electronics')
  assert.equal(rows.find(r => r.aCategory.slug === 'consumer-electronics')!.aFees, 2.4)
  assert.equal(rows.find(r => r.aCategory.slug === 'electronics-accessories')!.aFees, 4.5)
  assert.equal(rows.filter(r => r.bCategory.slug === 'beauty').length, 2)
  assert.equal(rows.filter(r => r.aFees < r.bFees).length, 0)
  assert.equal(rows.filter(r => r.bFees < r.aFees).length, 0)
  const comparisons = compareAcrossMarketplaces(29.99, 8, 'Consumer Electronics', 'amazon')
  assert.deepEqual(new Set(comparisons.map(r => r.marketplace.slug)), new Set(['amazon', 'walmart']))
  assert.equal(compareAcrossMarketplaces(29.99, 8, 'Amazon Device Accessories', 'amazon').length, 1)
})
test('verified Amazon minimum and shared accessory threshold regression', () => {
  const c = amazon.categories.find(c => c.slug === 'consumer-electronics')!
  assert.equal(computeFeeBreakdown({ marketplace: amazon, category: c, salePrice: 1, unitCost: 0 }).totalFees, .3)
  for (const m of [amazon, walmart]) {
    const accessory = m.categories.find(c => c.slug === 'electronics-accessories')!
    for (const [price, expected] of [[99.99, 15], [100, 15], [100.01, 15], [200, 23]]) assert.equal(referralFee(price, accessory).amount, expected)
  }
})
