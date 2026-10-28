import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import robots from '@/app/robots'
import { GET as llmsGET } from '@/app/llms.txt/route'
import { GET as feedGET } from '@/app/feed.xml/route'
import { GET as indexNowGET } from '@/app/indexnow-key.txt/route'
import { buildLlmsTxt } from '@/lib/llms-txt'
import { buildRssFeed, feedItems } from '@/lib/rss-feed'
import { ORGANIZATION_ID, ORGANIZATION_REF, organizationJsonLd } from '@/lib/site-jsonld'
import { feeFaq, feeShortAnswer } from '@/lib/fee-short-answer'
import { MARKETPLACES, formatVerifiedDate } from '@/lib/marketplace-fees'
import { FEE_CHANGELOG, feeChangelogId } from '@/lib/fee-changelog'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { validIndexNowKey } from '@/lib/indexnow'

const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), 'utf8')
// Built from fragments so this file does not itself spell out the internal tool names.
const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|consumer price index`, 'i')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (/\.tsx?$/.test(name)) out.push(rel)
  }
  return out
}

describe('robots.txt', () => {
  const rules = (Array.isArray(robots().rules) ? robots().rules : [robots().rules]) as { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] }[]
  const agents = (r: { userAgent?: string | string[] }) => ([] as string[]).concat(r.userAgent ?? [])
  const ruleFor = (bot: string) => rules.find(r => agents(r).includes(bot))

  it.each(['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Claude-User', 'Googlebot', 'GPTBot', 'ClaudeBot', 'Google-Extended'])('explicitly allows %s', bot => {
    const r = ruleFor(bot)
    expect(r, bot).toBeDefined()
    expect(r!.allow).toBe('/')
  })
  it('keeps * allowed and every group disallows the same private paths', () => {
    const star = ruleFor('*')!
    expect(star.allow).toBe('/')
    expect(star.disallow).toEqual(['/api/', '/admin/', '/preview/'])
    for (const r of rules) expect(r.disallow).toEqual(star.disallow)
  })
  it('keeps the sitemap line', () => {
    expect(robots().sitemap).toBe('https://marketplacebeta.com/sitemap.xml')
  })
})

describe('llms.txt', () => {
  it('is served as cacheable plain text', async () => {
    const res = llmsGET()
    expect(res.headers.get('content-type')).toMatch(/^text\/plain/)
    expect(res.headers.get('cache-control')).toMatch(/max-age=\d+/)
    expect(await res.text()).toBe(buildLlmsTxt())
  })
  it('has a summary, the key pages and citation guidance', () => {
    const t = buildLlmsTxt()
    expect(t.startsWith('# MarketplaceBeta\n\n> ')).toBe(true)
    for (const path of ['/fees/amazon', '/fees/walmart', '/fees/tiktok-shop', '/fees/ebay', '/fees/etsy', '/fees/changelog', '/intelligence/analysis', '/intelligence/forecasts', '/intelligence/pressure-index', '/newsletter', '/feed.xml', '/editorial-policy']) {
      expect(t, path).toContain(`https://marketplacebeta.com${path}`)
    }
    for (const a of ANALYSIS_ARTICLES) expect(t).toContain(`/intelligence/analysis/${a.slug}`)
    expect(t).toContain('## How to cite')
    expect(t).toContain('Marketplace Pressure Index')
  })
  it('never names data tools, uses CPI or shows forecast probabilities', () => {
    const t = buildLlmsTxt()
    expect(t).not.toMatch(FORBIDDEN)
    expect(t).not.toMatch(/\d\s?% (probability|chance)|odds/i)
    expect(t).not.toContain('hello@marketplacebeta.com')
  })
})

describe('RSS feed', () => {
  const xml = buildRssFeed()
  it('is served as RSS with caching headers', async () => {
    const res = feedGET()
    expect(res.headers.get('content-type')).toMatch(/^application\/rss\+xml/)
    expect(res.headers.get('cache-control')).toMatch(/s-maxage=\d+/)
    expect(await res.text()).toBe(xml)
  })
  it('is well-formed RSS 2.0 with one item per piece of original work', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0"')
    expect((xml.match(/<item>/g) ?? []).length).toBe((xml.match(/<\/item>/g) ?? []).length)
    expect((xml.match(/<item>/g) ?? []).length).toBe(feedItems().length)
    expect(feedItems().length).toBeGreaterThanOrEqual(ANALYSIS_ARTICLES.length + FEE_CHANGELOG.length)
    // no raw ampersands or angle brackets leaking out of text nodes
    expect(xml.replace(/&(amp|lt|gt|quot|apos);/g, '')).not.toMatch(/&/)
    for (const m of xml.matchAll(/<title>([^<]*)<\/title>/g)) expect(m[1].length).toBeGreaterThan(0)
    for (const m of xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)) expect(Number.isNaN(Date.parse(m[1]))).toBe(false)
  })
  it('contains only our own pages, never syndicated news', () => {
    for (const i of feedItems()) {
      expect(i.link.startsWith('https://marketplacebeta.com/')).toBe(true)
      expect(i.link).not.toMatch(/\/news(\/|$)/)
    }
    expect(xml).not.toMatch(FORBIDDEN)
  })
  it('links change-log items to ids that exist on the page', () => {
    const page = read('app/fees/changelog/page.tsx')
    expect(page).toContain('id={feeChangelogId(entry)}')
    for (const e of FEE_CHANGELOG) expect(xml).toContain(`/fees/changelog#${feeChangelogId(e)}`)
  })
  it('is advertised with a <link rel=alternate> in the root layout head', () => {
    const layout = read('app/layout.tsx')
    expect(layout).toContain('<link rel="alternate" type="application/rss+xml"')
    expect(layout).toContain('href="/feed.xml"')
  })
})

describe('Organization entity', () => {
  it('has one stable @id and no sameAs', () => {
    const org = organizationJsonLd() as Record<string, unknown>
    expect(org['@type']).toBe('Organization')
    expect(org['@id']).toBe('https://marketplacebeta.com/#organization')
    expect(ORGANIZATION_REF).toEqual({ '@id': ORGANIZATION_ID })
    expect(org).not.toHaveProperty('sameAs')
    expect(JSON.stringify(org)).not.toMatch(FORBIDDEN)
  })
  it('is defined only in the root layout (via the helper); no page embeds its own Organization with a logo', () => {
    expect(read('app/layout.tsx')).toContain('organizationJsonLd()')
    for (const f of walk('app')) {
      const src = read(f)
      expect(src, f).not.toMatch(/['"]@type['"]:\s*['"]Organization['"][^\n]*logo:/)
    }
  })
  it('is the publisher of every Article and NewsArticle, with dateModified', () => {
    const files = walk('app').filter(f => /['"]@type['"]:\s*['"](News)?Article['"]/.test(read(f)))
    expect(files.length).toBeGreaterThanOrEqual(7)
    for (const f of files) {
      const src = read(f)
      expect(src, `${f} publisher`).toContain('publisher: ORGANIZATION_REF')
      expect(src, `${f} dateModified`).toContain('dateModified')
      expect(src, `${f} imports`).toContain('ORGANIZATION_REF } from')
      expect(src, `${f} no brand-icon publisher`).not.toContain('brand-icon.png')
    }
  })
  it('is the creator of every Dataset', () => {
    const files = walk('app').filter(f => /['"]@type['"]:\s*['"]Dataset['"]/.test(read(f)))
    expect(files.sort()).toEqual(['app/fees/[marketplace]/page.tsx', 'app/fees/changelog/page.tsx', 'app/intelligence/forecasts/page.tsx', 'app/intelligence/pressure-index/page.tsx'].sort())
    for (const f of files) expect(read(f), f).toContain('creator: ORGANIZATION_REF')
  })
})

describe('fee page short answers', () => {
  const ten = (slug: string) => MARKETPLACES.find(m => m.slug === slug)!
  it('open with the page\'s own checked-on date', () => {
    for (const m of MARKETPLACES) expect(feeShortAnswer(m).startsWith(`As of ${formatVerifiedDate(m.lastVerified)}, `), m.slug).toBe(true)
  })
  it('is a single sentence and is the first FAQ answer', () => {
    for (const m of MARKETPLACES) {
      const a = feeShortAnswer(m)
      expect(a.endsWith('.')).toBe(true)
      expect(a.slice(0, -1)).not.toMatch(/\.\s/)
      expect(feeFaq(m)[0].answer).toBe(a)
      expect(feeFaq(m)).toHaveLength(3)
    }
  })
  it('uses only figures present in the fee data', () => {
    expect(feeShortAnswer(ten('amazon'))).toBe('As of October 16, 2026, Amazon charges referral fees of 8% to 45% depending on category, plus a $39.99 per month fee for the Professional selling plan.')
    expect(feeShortAnswer(ten('walmart'))).toBe('As of October 16, 2026, Walmart Marketplace charges referral fees of 8% to 20% depending on category, with no monthly subscription or setup fee.')
    expect(feeShortAnswer(ten('ebay'))).toBe('As of October 16, 2026, eBay charges final value fees of 6.7% to 15.3% depending on category, plus a per-order fee of $0.30 through $10 and $0.40 above.')
    expect(feeShortAnswer(ten('etsy'))).toBe('As of October 16, 2026, Etsy charges a flat 6.5% transaction fee in every category, plus a $0.20 listing fee and 3% + $0.25 payment processing.')
    expect(feeShortAnswer(ten('tiktok-shop'))).toBe("As of October 21, 2026, TikTok Shop's published US commission is 6% for most categories (5% for five fine-jewelry sub-categories); trade reports of an 8% rate from Aug 4, 2026 are not confirmed by TikTok.")
  })
  it('never names data tools or probabilities', () => {
    for (const m of MARKETPLACES) expect(JSON.stringify(feeFaq(m))).not.toMatch(FORBIDDEN)
  })
  it('the fee page renders the short answer, a visible FAQ and FAQPage + Dataset JSON-LD from the same data', () => {
    const src = read('app/fees/[marketplace]/page.tsx')
    expect(src).toContain('{shortAnswer}')
    expect(src).toContain('const faq = feeFaq(marketplace)')
    expect(src).toContain('mainEntity: faq.map')
    expect(src).toContain('{f.answer}')
    expect(src).toContain('"@type": "Dataset"')
    expect(src).toContain('dateModified: marketplace.lastVerified')
    expect(src).toContain('isAccessibleForFree: true')
    expect(src).not.toMatch(/sameAs/)
  })
  it('the unconfirmed TikTok 8% appears on the TikTok page data', () => {
    const t = ten('tiktok-shop')
    expect(t.summary).toContain('8% on Aug 4, 2026')
    expect(t.categories.find(c => c.slug === 'jewelry-accessories')!.note).toContain('5%')
  })
})

describe('fee change log Dataset', () => {
  it('is present with dateModified from the newest entry', () => {
    const src = read('app/fees/changelog/page.tsx')
    expect(src).toContain("'@type': 'Dataset'")
    expect(src).toContain('dateModified: entries[0].date')
    expect(src).toContain('<JsonLd data={dataset} />')
  })
})

describe('IndexNow key route', () => {
  const original = process.env.INDEXNOW_KEY
  afterEach(() => { if (original === undefined) delete process.env.INDEXNOW_KEY; else process.env.INDEXNOW_KEY = original })
  it('validates key shape', () => {
    expect(validIndexNowKey('abcd1234')).toBe(true)
    expect(validIndexNowKey('short')).toBe(false)
    expect(validIndexNowKey('has space in it')).toBe(false)
    expect(validIndexNowKey(undefined)).toBe(false)
  })
  it('returns 404 until INDEXNOW_KEY is set, then serves exactly the key', async () => {
    delete process.env.INDEXNOW_KEY
    expect(indexNowGET().status).toBe(404)
    process.env.INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8'
    const res = indexNowGET()
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('a1b2c3d4e5f6a7b8')
  })
  it('stores no key in the repo', () => {
    expect(read('app/indexnow-key.txt/route.ts')).toContain('process.env.INDEXNOW_KEY')
  })
})
