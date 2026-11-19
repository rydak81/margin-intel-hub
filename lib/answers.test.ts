import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import {
  AMAZON_2027_IMPLIED_PRICE,
  AMAZON_EXAMPLE_100,
  AMAZON_EXAMPLE_50,
  AMAZON_INDIVIDUAL_PER_ITEM,
  AMAZON_PROFESSIONAL_MONTHLY,
  AMAZON_REFERRAL_MIN,
  AMAZON_REFERRAL_PCT,
  ANSWER_PAGES,
  ANSWER_PATHS,
  EBAY_FVF_PCT,
  EBAY_ORDER_EXAMPLES,
  EBAY_ORDER_FEE_SMALL,
  EBAY_ORDER_FEE_STANDARD,
  EBAY_SHIPPING_EXAMPLE,
  ETSY_EXAMPLES,
  ETSY_LISTING_FEE,
  ETSY_PROCESSING_FLAT,
  ETSY_PROCESSING_PCT,
  ETSY_TRANSACTION_PCT,
  LIVE_ANALYSIS_SLUGS,
  analysisLinksFor,
  answerPath,
  answerTrackingSource,
  answersIn,
  relatedAnswers,
  wordCount,
} from '@/lib/answers'
import { newsletterSource } from '@/lib/newsletter-source'
import { getCategory, getMarketplace } from '@/lib/marketplace-fees'

// Vendor names are assembled so this file does not contain them as literals.
const VENDORS = [['kee', 'pa'], ['ever', 'bee'], ['jungle', ' scout'], ['helium', ' 10']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${VENDORS.join('|')}|\\bprobability\\b|\\bodds\\b|\\bsubscribers\\b|\\bpageviews\\b`, 'i')

const html = (el: unknown) => renderToStaticMarkup(el as ReactElement)
const params = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never

describe('answer pages', () => {
  it('publishes the hub and six question URLs', () => {
    expect(ANSWER_PAGES.map(p => p.slug)).toEqual([
      'etsy-offsite-ads-fee',
      'can-i-turn-off-etsy-offsite-ads',
      'amazon-fba-fees-2027',
      'how-much-does-amazon-take-from-a-sale',
      'ebay-fees-include-shipping-and-tax',
      'ebay-per-order-fee',
    ])
    expect(ANSWER_PATHS).toEqual(['/answers', ...ANSWER_PAGES.map(p => answerPath(p.slug))])
  })

  it('keeps each direct answer between 40 and 60 words and descriptions within 160 characters', () => {
    for (const page of ANSWER_PAGES) {
      const words = wordCount(page.directAnswer)
      expect(words, page.slug).toBeGreaterThanOrEqual(40)
      expect(words, page.slug).toBeLessThanOrEqual(60)
      expect(page.description.length, page.slug).toBeLessThanOrEqual(160)
      expect(page.question.length, page.slug).toBeLessThanOrEqual(60)
    }
  })

  it('agrees with the fee table and the worked examples', () => {
    expect(getCategory('amazon', 'kitchen')).toMatchObject({ referralPct: AMAZON_REFERRAL_PCT, minFee: AMAZON_REFERRAL_MIN })
    expect(getMarketplace('amazon')!.accountFee).toMatchObject({ amount: AMAZON_PROFESSIONAL_MONTHLY, period: 'month' })
    expect(AMAZON_INDIVIDUAL_PER_ITEM).toBe(0.99)
    expect(getCategory('ebay', 'most-categories')!.referralPct).toBe(EBAY_FVF_PCT)
    expect(getMarketplace('ebay')!.smallOrderFee).toEqual({ upTo: 10, amount: EBAY_ORDER_FEE_SMALL })
    expect(getMarketplace('ebay')!.perOrderFee).toBe(EBAY_ORDER_FEE_STANDARD)
    expect(getMarketplace('etsy')).toMatchObject({
      listingFee: ETSY_LISTING_FEE,
      paymentProcessingPct: ETSY_PROCESSING_PCT,
      paymentProcessingFlat: ETSY_PROCESSING_FLAT,
    })
    expect(ETSY_TRANSACTION_PCT).toBe(6.5)

    expect(ETSY_EXAMPLES.plain).toMatchObject({ total: 55, at15: { charged: 8.25 }, at12: { charged: 6.6 } })
    expect(ETSY_EXAMPLES.cap).toMatchObject({ total: 720, at15: { raw: 108, charged: 100, capped: true }, at12: { charged: 86.4, capped: false } })
    expect(ETSY_EXAMPLES.optOut).toMatchObject({ total: 44, at15: { charged: 6.6 }, at12: { charged: 5.28 } })

    expect(AMAZON_2027_IMPLIED_PRICE).toBe(23.75)
    expect(AMAZON_EXAMPLE_50).toMatchObject({ referral: 7.5, before: 3.74, fuel: 0.13, withFuel: 3.87, individual: 12.36, professionalOrder: 11.37, planPerHundred: 0.4, withPlanSpread: 11.77 })
    expect(AMAZON_EXAMPLE_100).toMatchObject({ referral: 15, before: 4, fuel: 0.14, withFuel: 4.14, individual: 20.13, professionalOrder: 19.14, planPerHundred: 0.4, withPlanSpread: 19.54 })

    expect(EBAY_SHIPPING_EXAMPLE.withExtras).toMatchObject({ tax: 2.76, total: 48.76, percentage: 6.63, perOrder: 0.4, fees: 7.03 })
    expect(EBAY_SHIPPING_EXAMPLE.itemOnly.fees).toBe(5.84)
    expect(EBAY_ORDER_EXAMPLES.at10).toMatchObject({ percentage: 1.36, perOrder: 0.3 })
    expect(EBAY_ORDER_EXAMPLES.justOver).toMatchObject({ percentage: 1.36, perOrder: 0.4 })
    expect(EBAY_ORDER_EXAMPLES.combined).toMatchObject({ percentage: 1.63, perOrder: 0.4 })
    expect(EBAY_ORDER_EXAMPLES.split).toMatchObject({ percentage: 0.82, perOrder: 0.3 })
    expect(EBAY_ORDER_EXAMPLES.athleticAt150).toBe(12)
  })

  it('groups by marketplace and by job, and links 3 to 5 other answers', () => {
    expect(answersIn({ marketplace: 'etsy' }).map(p => p.slug)).toEqual(['etsy-offsite-ads-fee', 'can-i-turn-off-etsy-offsite-ads'])
    expect(answersIn({ marketplace: 'amazon' }).map(p => p.slug)).toEqual(['amazon-fba-fees-2027', 'how-much-does-amazon-take-from-a-sale'])
    expect(answersIn({ marketplace: 'ebay' }).map(p => p.slug)).toEqual(['ebay-fees-include-shipping-and-tax', 'ebay-per-order-fee'])
    expect(answersIn({ job: 'ads' }).length).toBe(2)
    expect(answersIn({ job: 'storage' }).map(p => p.slug)).toEqual(['amazon-fba-fees-2027'])
    expect(answersIn({ job: 'fees' }).map(p => p.slug)).toEqual([
      'amazon-fba-fees-2027',
      'how-much-does-amazon-take-from-a-sale',
      'ebay-fees-include-shipping-and-tax',
      'ebay-per-order-fee',
    ])
    for (const page of ANSWER_PAGES) {
      const related = relatedAnswers(page.slug)
      expect(related.length, page.slug).toBeGreaterThanOrEqual(3)
      expect(related.length, page.slug).toBeLessThanOrEqual(5)
      expect(related.some(item => item.slug === page.slug)).toBe(false)
    }
  })

  it('links only analysis articles that exist in this build and were live on marketplacebeta.com', () => {
    const live = new Set<string>(LIVE_ANALYSIS_SLUGS)
    for (const page of ANSWER_PAGES) {
      const links = analysisLinksFor(page)
      expect(links.length, page.slug).toBeGreaterThan(0)
      for (const link of links) {
        const slug = link.href.replace('/intelligence/analysis/', '')
        expect(live.has(slug), slug).toBe(true)
        expect(ANALYSIS_ARTICLES.some(article => article.slug === slug), slug).toBe(true)
      }
    }
  })

  it('uses an allowlisted answers_<slug> key for the Daily Brief signup', () => {
    expect(newsletterSource('?source=answers_index')).toBe('newsletter_answers_index')
    for (const page of ANSWER_PAGES) {
      const key = answerTrackingSource(page.slug)
      expect(key).toBe(`answers_${page.slug}`)
      expect(newsletterSource(`?source=${key}`)).toBe(`newsletter_${key}`)
    }
    expect(newsletterSource('?source=answers_')).toBe('newsletter_page')
    expect(newsletterSource('?source=answers_bad-')).toBe('newsletter_page')
  })

  it('renders the question, the direct answer, a hypothetical example, and the signup key', async () => {
    const { default: Page } = await import('@/app/answers/[slug]/page')
    const { generateMetadata } = await import('@/app/answers/[slug]/page')
    for (const page of ANSWER_PAGES) {
      const out = html(await Page(params(page.slug)))
      expect(out, page.slug).toContain(`>${page.question}<`)
      expect(out, page.slug).toContain(page.directAnswer)
      expect(out, page.slug).toContain('Hypothetical worked example')
      expect(out, page.slug).toContain('What to check this week')
      expect(out, page.slug).toContain(`href="/newsletter?source=answers_${page.slug}#subscribe"`)
      expect(out, page.slug).toContain('"@type":"FAQPage"')
      expect(out, page.slug).toContain('"@type":"BreadcrumbList"')
      expect(out, page.slug).not.toMatch(FORBIDDEN)
      const meta = await generateMetadata(params(page.slug))
      expect(meta.title).toBe(page.question)
      expect(meta.description).toBe(page.description)
      expect(meta.alternates?.canonical).toBe(`https://marketplacebeta.com/answers/${page.slug}`)
      expect(meta.openGraph).toMatchObject({ title: page.question, description: page.description, url: `https://marketplacebeta.com/answers/${page.slug}` })
      const faq = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1].replace(/\\u003c/g, '<'))
      const blocks = Array.isArray(faq) ? faq : [faq]
      const faqPage = blocks.find((block: { '@type': string }) => block['@type'] === 'FAQPage')
      expect(faqPage.mainEntity[0].name).toBe(page.question)
      expect(faqPage.mainEntity[0].acceptedAnswer.text).toBe(page.directAnswer)
    }
  })

  it('renders the hub grouped both ways and lists every answer URL in the sitemap once', async () => {
    const { default: Hub } = await import('@/app/answers/page')
    const out = html(createElement(Hub))
    expect(out).toContain('By marketplace')
    expect(out).toContain('By job')
    expect(out).toContain('Storage &amp; inventory')
    expect(out).toContain('href="/newsletter?source=answers_index#subscribe"')
    for (const page of ANSWER_PAGES) expect(out).toContain(page.directAnswer)
    expect(out).not.toMatch(FORBIDDEN)

    const urls = (await sitemap()).map(entry => entry.url)
    for (const path of ANSWER_PATHS) {
      const url = `https://marketplacebeta.com${path}`
      expect(urls.filter(item => item === url)).toEqual([url])
    }
  })
})
