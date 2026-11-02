// @vitest-environment jsdom
// "Seller questions" on /fees/[marketplace]: computed from the fee tables, mirrored
// exactly in a single FAQPage JSON-LD block, 3-5 items, no banned terms.
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { MARKETPLACES, computeFeeBreakdown, formatVerifiedDate } from '@/lib/marketplace-fees'
import { FEE_BY_PRICE_PATH, OFFSITE_ADS, money, referenceCategory } from '@/lib/fee-by-price'
import { FAQ_SALE_PRICE, feeFaq, feeFaqJsonLd } from '@/lib/fee-short-answer'

vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const BANNED = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probabilit|\\bodds\\b|likelihood|\\bchance\\b`, 'i')
const params = (p: object) => ({ params: Promise.resolve(p) }) as never


async function renderPage(slug: string) {
  const { default: Page } = await import('@/app/fees/[marketplace]/page')
  const markup = renderToStaticMarkup((await Page(params({ marketplace: slug }))) as ReactElement)
  const ld = [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => {
    const data = JSON.parse(m[1])
    return Array.isArray(data) ? data : [data]
  })
  const section = /<section id="faq"[\s\S]*?<\/section>/.exec(markup)?.[0] ?? ''
  // Read the visible text through a real DOM parser (textContent), as a browser would.
  const doc = new DOMParser().parseFromString(section, 'text/html')
  const visible = [...doc.querySelectorAll('dl > div')].map(div => ({
    question: div.querySelector('dt')?.textContent ?? '',
    answer: div.querySelector('dd')?.textContent ?? '',
  }))
  return { markup, ld, section, visible }
}

describe('Seller questions on every marketplace fee page', () => {
  it('has 3 to 5 questions per page', () => {
    for (const m of MARKETPLACES) {
      const n = feeFaq(m).length
      expect(n, m.slug).toBeGreaterThanOrEqual(3)
      expect(n, m.slug).toBeLessThanOrEqual(5)
    }
  })

  it('renders a visible "Seller questions" section whose text exactly matches the single FAQPage JSON-LD', async () => {
    for (const m of MARKETPLACES) {
      const { ld, section, visible } = await renderPage(m.slug)
      expect(section, m.slug).toContain('Seller questions')
      const faqBlocks = ld.filter(b => b['@type'] === 'FAQPage')
      expect(faqBlocks, m.slug).toHaveLength(1)
      const fromLd = faqBlocks[0].mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ question: q.name, answer: q.acceptedAnswer.text }))
      expect(visible, m.slug).toEqual(fromLd)
      expect(fromLd, m.slug).toEqual(feeFaq(m).map(f => ({ question: f.question, answer: f.answer })))
      expect(faqBlocks[0]).toEqual(feeFaqJsonLd(feeFaq(m)))
    }
  })

  it('links the comparison phrase to /fees/compare-by-item-price', async () => {
    for (const m of MARKETPLACES) {
      const { section } = await renderPage(m.slug)
      expect(section, m.slug).toContain(`href="${FEE_BY_PRICE_PATH}"`)
      for (const f of feeFaq(m)) if (f.link) expect(f.answer).toContain(f.link.text)
    }
  })

  it('the $25 answer is computed from the fee tables (not hardcoded) and states its assumptions and date', () => {
    for (const m of MARKETPLACES) {
      const { category } = referenceCategory(m)
      const b = computeFeeBreakdown({ salePrice: FAQ_SALE_PRICE, unitCost: 0, marketplace: m, category })
      const item = feeFaq(m).find(f => f.question === `What does ${m.name} take from a $${FAQ_SALE_PRICE} sale?`)!
      expect(item, m.slug).toBeTruthy()
      expect(item.answer.startsWith(`${money(b.totalFees)} in fees`), m.slug).toBe(true)
      expect(item.answer).toContain(`leaving ${money(b.netProceeds)}`)
      expect(item.answer).toContain(category.label)
      expect(item.answer).toContain(`${category.referralPct}% ${m.feeName}`)
      expect(item.answer).toContain(`as of ${formatVerifiedDate(m.lastVerified)}`)
      expect(item.answer).toContain('hypothetical')
    }
  })

  it('the ranking answer lists every marketplace at its computed $25 fee, cheapest first', () => {
    const totals = MARKETPLACES.map(m => ({ name: m.shortName, fees: computeFeeBreakdown({ salePrice: FAQ_SALE_PRICE, unitCost: 0, marketplace: m, category: referenceCategory(m).category }).totalFees }))
    const order = [...totals].sort((a, b) => a.fees - b.fees).map(t => `${t.name} ${money(t.fees)}`)
    const cheapest = [...totals].sort((a, b) => a.fees - b.fees)[0].name
    for (const m of MARKETPLACES) {
      const item = feeFaq(m).find(f => f.question.startsWith(`Is ${m.name} cheaper`))!
      let at = -1
      for (const part of order) { const i = item.answer.indexOf(part); expect(i, `${m.slug}: ${part}`).toBeGreaterThan(at); at = i }
      if (m.shortName === cheapest) expect(item.answer).toContain(`${m.shortName} is the cheapest`)
    }
  })

  it("Etsy's Offsite Ads answer uses the policy terms and the computed baseline", () => {
    const etsy = MARKETPLACES.find(m => m.slug === 'etsy')!
    const base = computeFeeBreakdown({ salePrice: FAQ_SALE_PRICE, unitCost: 0, marketplace: etsy, category: referenceCategory(etsy).category })
    const item = feeFaq(etsy).find(f => f.question.includes('Offsite Ad'))!
    expect(item.answer).toContain(money(base.totalFees))
    expect(item.answer).toContain(money(Math.min(FAQ_SALE_PRICE * OFFSITE_ADS.standardPct / 100, OFFSITE_ADS.capUsd)))
    expect(item.answer).toContain(money(Math.min(FAQ_SALE_PRICE * OFFSITE_ADS.discountedPct / 100, OFFSITE_ADS.capUsd)))
    for (const m of MARKETPLACES.filter(x => x.slug !== 'etsy')) expect(feeFaq(m).some(f => f.question.includes('Offsite'))).toBe(false)
  })

  it('contains no data-tool names, "CPI", odds or probabilities', () => {
    for (const m of MARKETPLACES) expect(JSON.stringify(feeFaq(m)), m.slug).not.toMatch(BANNED)
  })
})

