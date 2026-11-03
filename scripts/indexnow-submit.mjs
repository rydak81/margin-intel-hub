#!/usr/bin/env node
// Submit changed MarketplaceBeta URLs to IndexNow (Bing, Yandex, Seznam, Naver...).
//
// Dry run by default: prints what would be sent and sends nothing. Only
// `--submit` contacts https://api.indexnow.org/indexnow, and only after
// confirming https://<host>/indexnow-key.txt serves exactly INDEXNOW_KEY.
//
//   INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs                   # dry run, whole sitemap
//   INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs --since 2026-11-01  # only URLs with lastmod >= date
//   INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs --url https://marketplacebeta.com/fees/amazon
//   INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs --since 2026-11-01 --submit
//
// The key is never printed. /news/* (syndicated, noindex) is always excluded.
// See docs/indexnow.md.

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const DEFAULT_HOST = 'marketplacebeta.com'
export const MAX_URLS_PER_REQUEST = 10_000

/** Same rule as lib/indexnow.ts: 8-128 letters, digits and dashes. */
export function validIndexNowKey(key) {
  return typeof key === 'string' && /^[A-Za-z0-9-]{8,128}$/.test(key)
}

/** <url> entries of a sitemap.xml as { loc, lastmod }. */
export function parseSitemap(xml) {
  const entries = []
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>\s*([^<\s]+)\s*<\/loc>/.exec(m[1])?.[1]
    if (!loc) continue
    const lastmod = /<lastmod>\s*([^<\s]+)\s*<\/lastmod>/.exec(m[1])?.[1] ?? null
    entries.push({ loc: loc.replace(/&amp;/g, '&'), lastmod })
  }
  return entries
}

/** Keep https URLs on `host`, drop /news/*, optional lastmod >= since, dedupe. */
export function selectUrls(entries, { host = DEFAULT_HOST, since = null } = {}) {
  const sinceMs = since ? Date.parse(since) : NaN
  const seen = new Set()
  const out = []
  for (const { loc, lastmod } of entries) {
    let url
    try { url = new URL(loc) } catch { continue }
    if (url.protocol !== 'https:' || url.hostname !== host) continue
    if (url.pathname.startsWith('/news/')) continue
    if (Number.isFinite(sinceMs)) {
      const t = lastmod ? Date.parse(lastmod) : NaN
      if (!Number.isFinite(t) || t < sinceMs) continue
    }
    if (!seen.has(url.href)) { seen.add(url.href); out.push(url.href) }
  }
  return out
}

/** IndexNow JSON bodies, at most MAX_URLS_PER_REQUEST URLs each. */
export function buildPayloads(urls, key, host = DEFAULT_HOST) {
  const keyLocation = `https://${host}/indexnow-key.txt`
  const payloads = []
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    payloads.push({ host, key, keyLocation, urlList: urls.slice(i, i + MAX_URLS_PER_REQUEST) })
  }
  return payloads
}

export function parseArgs(argv) {
  const args = { submit: false, since: null, sitemap: null, host: DEFAULT_HOST, urls: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--submit') args.submit = true
    else if (a === '--since') args.since = argv[++i]
    else if (a === '--sitemap') args.sitemap = argv[++i]
    else if (a === '--host') args.host = argv[++i]
    else if (a === '--url') args.urls.push(argv[++i])
    else throw new Error(`Unknown argument: ${a}`)
  }
  if (args.since && !Number.isFinite(Date.parse(args.since))) throw new Error(`--since is not a date: ${args.since}`)
  args.sitemap ??= `https://${args.host}/sitemap.xml`
  return args
}

export async function run(argv, { env = process.env, fetchImpl = fetch, log = console.log } = {}) {
  const args = parseArgs(argv)
  const key = env.INDEXNOW_KEY?.trim()
  if (!validIndexNowKey(key)) throw new Error('Set INDEXNOW_KEY (8-128 letters, digits, dashes) to the same value as in Vercel.')

  let urls
  if (args.urls.length) {
    urls = selectUrls(args.urls.map(loc => ({ loc, lastmod: null })), { host: args.host })
  } else {
    const res = await fetchImpl(args.sitemap)
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status} ${args.sitemap}`)
    urls = selectUrls(parseSitemap(await res.text()), { host: args.host, since: args.since })
  }
  if (!urls.length) { log('No URLs selected; nothing to submit.'); return { submitted: 0, urls } }

  const payloads = buildPayloads(urls, key, args.host)
  log(`${urls.length} URL(s) selected${args.since ? ` (lastmod >= ${args.since})` : ''}:`)
  for (const u of urls) log(`  ${u}`)

  if (!args.submit) {
    log(`Dry run: ${payloads.length} request(s) to ${INDEXNOW_ENDPOINT} NOT sent. Add --submit to send.`)
    return { submitted: 0, urls, payloads }
  }

  const keyRes = await fetchImpl(payloads[0].keyLocation, { cache: 'no-store' })
  const served = keyRes.ok ? (await keyRes.text()).trim() : null
  if (served !== key) throw new Error(`${payloads[0].keyLocation} does not serve INDEXNOW_KEY (status ${keyRes.status}). Set it in Vercel and redeploy first.`)

  let submitted = 0
  for (const body of payloads) {
    const res = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })
    log(`IndexNow responded ${res.status} for ${body.urlList.length} URL(s) (200/202 = received; 400/403/422 = key or URL problem; 429 = slow down).`)
    if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow rejected the submission: ${res.status}`)
    submitted += body.urlList.length
  }
  return { submitted, urls }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  run(process.argv.slice(2)).catch(err => { console.error(err.message); process.exit(1) })
}
