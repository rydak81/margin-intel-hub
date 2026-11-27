import assert from 'node:assert/strict'
import test from 'node:test'
import { getMarketplace, getAllFeeRoutes, getComparableCategories, computeFeeBreakdown, referralFee, compareAcrossMarketplaces, orderFee } from '@/lib/marketplace-fees'
import { RATE_RANGE_CAP_NOTE, comparisonDescription, getAllPairs, matchedCategories, overviewRows, rateRange } from '@/lib/fee-compare'
import { defaultCategorySlug } from '@/lib/profit-calculator-fees'
import { referenceCategory } from '@/lib/fee-by-price'
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

test('reverse mappings retain category identity through calculator updates', () => {
  const mappings = getComparableCategories('walmart', 'Beauty')
  assert.deepEqual(mappings.map(r => r.category.slug), ['beauty', 'health-personal-care'])
  for (const price of [9.99, 10, 10.01, 29.99]) {
    const rows = compareAcrossMarketplaces(price, 8, 'Beauty', 'walmart')
    assert.equal(rows.length, 3)
    assert.equal(new Set(rows.map(r => `${r.marketplace.slug}:${r.category.slug}`)).size, 3)
    assert.deepEqual(new Set(rows.filter(r => r.marketplace.slug === 'amazon').map(r => r.category.slug)), new Set(['beauty', 'health-personal-care']))
  }
})
test('search descriptions promise modeled sale totals only for mapped pairs', () => {
  for (const { a, b } of getAllPairs()) {
    const description = comparisonDescription(a, b)
    if (matchedCategories(a, b).length) {
      assert.match(description, /total fees on a \$29.99 sale/)
      assert.ok(description.length <= 160, description)
    }
    else {
      assert.doesNotMatch(description, /total fees|\$29.99/)
      assert.match(description, /no verified same-product category comparison/i)
      assert.ok(description.length <= 160, description)
    }
  }
})

test('Amazon referral minimums follow the public table, including the $4.99 clothing case', () => {
  const cat = (slug: string) => amazon.categories.find(c => c.slug === slug)!
  const clothing = cat('clothing-accessories')
  assert.equal(clothing.minFee, 0.30)
  // 5% of $4.99 rounds to $0.25; Amazon charges the $0.30 minimum instead.
  assert.equal(referralFee(4.99, clothing).amount, 0.25)
  assert.equal(computeFeeBreakdown({ marketplace: amazon, category: clothing, salePrice: 4.99, unitCost: 0 }).totalFees, 0.30)

  const grocery = cat('grocery')
  assert.equal(grocery.minFee, undefined)
  assert.equal(computeFeeBreakdown({ marketplace: amazon, category: grocery, salePrice: 1, unitCost: 0 }).totalFees, 0.08)

  const videoGames = cat('video-games')
  assert.equal(videoGames.minFee, undefined)
  assert.equal(computeFeeBreakdown({ marketplace: amazon, category: videoGames, salePrice: 1, unitCost: 0 }).totalFees, 0.15)

  assert.equal(amazon.categories.find(c => c.slug === 'fine-art'), undefined)
})

test('Walmart official tables: no Cell Phones row; Compact Appliances, Musical Instruments, Personal Computers and Baby match the live schedule', () => {
  assert.equal(walmart.categories.find(c => c.slug === 'cell-phones'), undefined)
  assert.equal(walmart.categories.some(c => /cell phones/i.test(c.label)), false)

  const compact = walmart.categories.find(c => c.slug === 'appliances-compact')!
  assert.equal(compact.label, 'Appliances - Compact')
  assert.equal(compact.referralPct, 12)
  assert.equal(compact.tierMode, 'marginal')
  assert.deepEqual(compact.tiers, [{ upTo: 300, pct: 12 }, { upTo: null, pct: 8 }])
  assert.equal(referralFee(300, compact).amount, 36)
  // 8% of the $0.01 excess rounds to $0.00 at cent precision; $301 shows the second tier.
  assert.equal(referralFee(300.01, compact).amount, 36)
  assert.equal(referralFee(301, compact).amount, 36.08)
  assert.equal(referralFee(400, compact).amount, 44)

  const instruments = walmart.categories.find(c => c.slug === 'musical-instruments')!
  assert.equal(instruments.label, 'Musical Instruments')
  assert.equal(instruments.referralPct, 12)
  assert.equal(instruments.tiers, undefined)
  assert.equal(referralFee(50, instruments).amount, 6)

  const pcs = walmart.categories.find(c => c.slug === 'personal-computers')!
  assert.equal(pcs.label, 'Personal Computers')
  assert.equal(pcs.referralPct, 6)
  assert.equal(referralFee(50, pcs).amount, 3)

  const baby = walmart.categories.find(c => c.slug === 'baby')!
  assert.equal(baby.tierMode, 'whole')
  assert.deepEqual(baby.tiers, [{ upTo: 10, pct: 8 }, { upTo: null, pct: 15 }])
  assert.equal(referralFee(10, baby).amount, 0.8)
  assert.equal(referralFee(10.01, baby).amount, 1.5)
})

test('Walmart contract categories added 2026-11-20 match the official tables, including table-only 15% rows', () => {
  assert.equal(walmart.categories.length, 38)
  assert.equal(walmart.lastVerified, '2026-11-20')

  const flat = (slug: string, label: string, pct: number) => {
    const row = walmart.categories.find(c => c.slug === slug)!
    assert.equal(row.label, label)
    assert.equal(row.referralPct, pct)
    assert.equal(row.tierMode, undefined)
    assert.equal(row.tiers, undefined)
    assert.equal(referralFee(100, row).amount, pct)
  }
  flat('appliances-major', 'Appliances - Major', 8)
  flat('base-power-tools', 'Base Power Tools', 12)
  flat('plumbing-heating-cooling-ventilation', 'Plumbing, Heating, Cooling & Ventilation', 10)
  flat('tires-wheels', 'Tires & Wheels', 10)
  flat('video-game-consoles', 'Video Game Consoles', 8)

  const tableOnly = ['luggage-travel-accessories', 'music', 'video-dvd', 'everything-else']
  for (const slug of tableOnly) {
    const row = walmart.categories.find(c => c.slug === slug)!
    assert.equal(row.referralPct, 15)
    assert.equal(row.tableOnly, true)
    assert.equal(referralFee(40, row).amount, 6)
  }
  assert.deepEqual(tableOnly.map(slug => walmart.categories.find(c => c.slug === slug)!.label), [
    'Luggage & Travel Accessories', 'Music', 'Video & DVD', 'Everything Else',
  ])
  const routes = new Set(getAllFeeRoutes().filter(r => r.marketplace === 'walmart').map(r => r.category))
  for (const slug of tableOnly) assert.equal(routes.has(slug), false)
  for (const slug of ['appliances-major', 'base-power-tools', 'collectibles', 'indoor-outdoor-furniture', 'outdoor-power-tools', 'plumbing-heating-cooling-ventilation', 'tires-wheels', 'video-game-consoles']) {
    assert.equal(routes.has(slug), true, slug)
  }

  const furniture = walmart.categories.find(c => c.slug === 'indoor-outdoor-furniture')!
  assert.equal(furniture.tierMode, 'marginal')
  assert.deepEqual(furniture.tiers, [{ upTo: 200, pct: 15 }, { upTo: null, pct: 10 }])
  assert.equal(referralFee(200, furniture).amount, 30)
  assert.equal(referralFee(300, furniture).amount, 40)

  const outdoor = walmart.categories.find(c => c.slug === 'outdoor-power-tools')!
  assert.equal(outdoor.tierMode, 'whole')
  assert.deepEqual(outdoor.tiers, [{ upTo: 500, pct: 15 }, { upTo: null, pct: 8 }])
  assert.equal(referralFee(500, outdoor).amount, 75)
  assert.equal(referralFee(500.01, outdoor).amount, 40)
  assert.ok(referralFee(500.01, outdoor).amount < referralFee(500, outdoor).amount)

  const collectibles = walmart.categories.find(c => c.slug === 'collectibles')!
  assert.equal(collectibles.label, 'Collectibles (for approved sellers)')
  assert.equal(collectibles.referralPct, 8)
  assert.equal(collectibles.tierMode, 'marginal')
  assert.deepEqual(collectibles.tiers, [{ upTo: 2500, pct: 8 }, { upTo: null, pct: 2.35 }])
  assert.equal(referralFee(2500, collectibles).amount, 200)
  assert.equal(referralFee(3500, collectibles).amount, 223.5)
  assert.match(collectibles.note!, /all other collectible categories/)
  assert.match(collectibles.note!, /portion the portion/)
  assert.match(collectibles.note!, /8% only/)

  const office = walmart.categories.find(c => c.slug === 'office-products')!
  assert.equal(office.referralPct, 15)
  assert.match(office.note!, /12%/)
  assert.match(office.note!, /Printer Cartridges/)
  for (const slug of ['outdoors', 'sporting-goods']) {
    const row = walmart.categories.find(c => c.slug === slug)!
    assert.equal(row.referralPct, 15)
    assert.match(row.note!, /Hunting Trail Monitors, Binoculars, Telescopes, Spotting Scopes, and Night Vision Goggles/)
    assert.match(row.note!, /8%/)
  }
  assert.equal(walmart.categories.find(c => c.slug === 'shoes')!.label, 'Shoes, Handbags, Backpacks & Sunglasses')
  assert.equal(walmart.categories.find(c => c.slug === 'video-games')!.label, 'Software & Computer Video Games')
  assert.equal(referenceCategory(walmart).category.slug, 'everything-else')
  assert.equal(defaultCategorySlug('walmart'), 'everything-else')
  assert.deepEqual(rateRange(walmart), { min: 6, max: 20 })
  assert.equal(overviewRows(amazon, walmart).find(r => r.label === 'Commission rate range')!.b, '6% to 20%')
  assert.match(RATE_RANGE_CAP_NOTE, /Collectibles/)
  assert.equal(walmart.categories.find(c => c.slug === 'printer-cartridges'), undefined)
})

test('TikTok published schedule: Pre-Owned 5%, Collectibles 6%, 3% over $10,000, no 8% hedge', () => {
  const tiktok = getMarketplace('tiktok-shop')!
  assert.equal(tiktok.lastVerified, '2026-11-20')
  assert.equal(tiktok.categories.length, 14)
  assert.doesNotMatch(tiktok.summary, /moved to 8%|8% on Aug 4/)
  assert.match(tiktok.summary, /Pre-Owned/)
  assert.match(tiktok.summary, /10\/08\/2026/)

  const preOwned = tiktok.categories.find(c => c.slug === 'pre-owned')!
  assert.equal(preOwned.referralPct, 5)
  assert.equal(preOwned.tierMode, 'marginal')
  assert.deepEqual(preOwned.tiers, [{ upTo: 10000, pct: 5 }, { upTo: null, pct: 3 }])
  assert.equal(referralFee(10000, preOwned).amount, 500)
  assert.equal(referralFee(12000, preOwned).amount, 560)

  const collectibles = tiktok.categories.find(c => c.slug === 'collectibles')!
  assert.equal(collectibles.referralPct, 6)
  assert.equal(collectibles.tierMode, 'marginal')
  assert.deepEqual(collectibles.tiers, [{ upTo: 10000, pct: 6 }, { upTo: null, pct: 3 }])
  assert.equal(referralFee(10000, collectibles).amount, 600)
  assert.equal(referralFee(12000, collectibles).amount, 660)

  const tiered = tiktok.categories.filter(c => c.tiers?.some(t => t.upTo === 10000)).map(c => c.slug).sort()
  assert.deepEqual(tiered, ['collectibles', 'pre-owned'])
  for (const c of tiktok.categories) {
    assert.doesNotMatch(c.note ?? '', /moved to 8%/)
    if (c.slug !== 'pre-owned' && c.slug !== 'collectibles') assert.equal(c.tiers, undefined, c.slug)
  }
  const jewelry = tiktok.categories.find(c => c.slug === 'jewelry-accessories')!
  assert.match(jewelry.note!, /Diamond, Gold, Jade, Platinum\/Carat Gold/)
  assert.doesNotMatch(jewelry.note!, /8%/)
  assert.deepEqual(rateRange(tiktok), { min: 5, max: 6 })
})

test('eBay trading cards and comics: 13.25% with no Store or a Starter Store, 12.35% with a Basic Store or higher', () => {
  const cards = category('trading-cards')
  assert.equal(cards.referralPct, 13.25)
  assert.deepEqual(cards.tiers, [{ upTo: 7500, pct: 13.25 }, { upTo: null, pct: 2.35 }])
  assert.match(cards.note!, /Comic books pay the same 13\.25%/)
  assert.match(cards.note!, /no Store or a Starter Store/)
  assert.equal(referralFee(7500, cards).amount, 993.75)
  assert.equal(referralFee(8500, cards).amount, 1017.25)

  const store = category('trading-cards-store')
  assert.equal(store.label, 'Trading Cards & Comics (Basic Store or higher, excluding NFTs)')
  assert.equal(store.referralPct, 12.35)
  assert.equal(store.tierMode, 'marginal')
  assert.deepEqual(store.tiers, [{ upTo: 2500, pct: 12.35 }, { upTo: null, pct: 2.35 }])
  assert.match(store.note!, /Comic books pay this same rate/)
  assert.equal(referralFee(2500, store).amount, 308.75)
  assert.equal(referralFee(3500, store).amount, 332.25)
  assert.equal(ebay.lastVerified, '2026-11-20')
})
