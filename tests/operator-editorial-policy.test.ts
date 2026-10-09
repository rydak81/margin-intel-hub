import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node's native TypeScript runner needs the explicit extension.
import { editorialExclusionReason, isOperatorRelevant } from '../lib/operator-editorial-policy.ts'

test('rejects known off-topic and promotional stories even when labeled ecommerce', () => {
  for (const title of [
    'Love Me Love Me 3, coming to Prime Video',
    'FastMoss Coupon Code 2026: Save 80%',
    'From zero to 1,000: Amazon satellite production lines',
    'Introducing all-new Amazon Alexa Tablets',
    'Amazon in the community: Seattle investment',
    'How AWS is helping companies build physical AI machines that think',
  ]) assert.ok(editorialExclusionReason({ title, category: 'ecommerce' }), title)
})
test('retains operational news and does not reject general discount or video marketing coverage', () => {
  for (const title of [
    'Amazon increases fulfillment fees', 'TikTok Shop adds box-free returns',
    'Prime Big Deal Days drives retail spending', 'How video ads affect acquisition costs',
    'Discount strategy for marketplace sellers', 'Retail inventory management with AI',
  ]) assert.ok(isOperatorRelevant({title}), title)
})
test('respects explicit relevance decisions and classifier rejection in summaries', () => {
  assert.equal(isOperatorRelevant({title:'Amazon news',relevant:false}),false)
  assert.equal(isOperatorRelevant({title:'Amazon news',summary:'This has zero direct operational impact on sellers.'}),false)
  assert.equal(isOperatorRelevant({title:'Amazon fees',summary:'This may affect seller margins.'}),true)
})
