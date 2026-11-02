import { describe, expect, it, vi } from 'vitest'
import * as indexnowScript from '../scripts/indexnow-submit.mjs'
import { validIndexNowKey } from '@/lib/indexnow'

// Plain .mjs script (runs with bare node), so treat its exports as untyped here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const indexnow = indexnowScript as any

const KEY = 'abcdef0123456789abcdef0123456789'
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?><urlset>
<url><loc>https://marketplacebeta.com/fees/amazon</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url>
<url><loc>https://marketplacebeta.com/fees/changelog</loc><lastmod>2026-10-20T00:00:00.000Z</lastmod></url>
<url><loc>https://marketplacebeta.com/news/art_abc123</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url>
<url><loc>https://marketplacebeta.com/intelligence/analysis</loc></url>
<url><loc>https://example.com/elsewhere</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url>
<url><loc>https://marketplacebeta.com/fees/amazon</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url>
</urlset>`

const response = (status: number, body = '') => ({ ok: status >= 200 && status < 300, status, text: async () => body })

describe('IndexNow submit script', () => {
  it('uses the same key rule as the key-file route', () => {
    for (const k of [KEY, 'short', 'has space key 123', 'a'.repeat(129), 'abc-DEF-123']) {
      expect(indexnow.validIndexNowKey(k)).toBe(validIndexNowKey(k))
    }
  })

  it('selects same-host URLs, drops /news/*, other hosts and duplicates; --since filters by lastmod', () => {
    const entries = indexnow.parseSitemap(SITEMAP)
    expect(indexnow.selectUrls(entries)).toEqual([
      'https://marketplacebeta.com/fees/amazon',
      'https://marketplacebeta.com/fees/changelog',
      'https://marketplacebeta.com/intelligence/analysis',
    ])
    expect(indexnow.selectUrls(entries, { since: '2026-10-31' })).toEqual(['https://marketplacebeta.com/fees/amazon'])
  })

  it('builds payloads with keyLocation and splits at 10,000 URLs', () => {
    const urls = Array.from({ length: 10_001 }, (_, i) => `https://marketplacebeta.com/p${i}`)
    const payloads = indexnow.buildPayloads(urls, KEY)
    expect(payloads).toHaveLength(2)
    expect(payloads[0]).toMatchObject({ host: 'marketplacebeta.com', key: KEY, keyLocation: 'https://marketplacebeta.com/indexnow-key.txt' })
    expect(payloads[0].urlList).toHaveLength(10_000)
    expect(payloads[1].urlList).toHaveLength(1)
  })

  it('dry run (default) never contacts IndexNow and never prints the key', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: unknown) => response(200, SITEMAP))
    const lines: string[] = []
    const result = await indexnow.run([], { env: { INDEXNOW_KEY: KEY }, fetchImpl, log: (l: string) => lines.push(l) })
    expect(result.submitted).toBe(0)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://marketplacebeta.com/sitemap.xml')
    expect(lines.join('\n')).not.toContain(KEY)
    expect(lines.join('\n')).toContain('NOT sent')
  })

  it('--submit checks the served key file first and refuses on mismatch', async () => {
    const fetchImpl = vi.fn(async (url: string, _init?: unknown) => (url.endsWith('sitemap.xml') ? response(200, SITEMAP) : response(404, 'Not found')))
    await expect(indexnow.run(['--submit'], { env: { INDEXNOW_KEY: KEY }, fetchImpl, log: () => {} })).rejects.toThrow(/does not serve INDEXNOW_KEY/)
    expect(fetchImpl.mock.calls.some(c => c[0] === indexnow.INDEXNOW_ENDPOINT)).toBe(false)
  })

  it('--submit posts the payload once the key file matches', async () => {
    const fetchImpl = vi.fn(async (url: string, _init?: unknown) => {
      if (url.endsWith('sitemap.xml')) return response(200, SITEMAP)
      if (url.endsWith('indexnow-key.txt')) return response(200, `${KEY}\n`)
      return response(202)
    })
    const result = await indexnow.run(['--submit', '--since', '2026-10-31'], { env: { INDEXNOW_KEY: KEY }, fetchImpl, log: () => {} })
    expect(result.submitted).toBe(1)
    const post = fetchImpl.mock.calls.find(c => c[0] === indexnow.INDEXNOW_ENDPOINT)!
    expect(JSON.parse((post[1] as { body: string }).body)).toEqual({
      host: 'marketplacebeta.com', key: KEY, keyLocation: 'https://marketplacebeta.com/indexnow-key.txt',
      urlList: ['https://marketplacebeta.com/fees/amazon'],
    })
  })

  it('requires a valid INDEXNOW_KEY', async () => {
    await expect(indexnow.run([], { env: {}, fetchImpl: vi.fn(), log: () => {} })).rejects.toThrow(/INDEXNOW_KEY/)
  })
})
