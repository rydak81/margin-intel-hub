// URL scrubbing for Vercel Web Analytics (components/site-analytics.tsx).
//
// Archive searches, auth callbacks and emailed links can put private values in
// the query string, so analytics never records arbitrary query params. It does
// keep campaign attribution: standard utm_* params (which Vercel's UTM
// Parameters panel reads from the page URL, and which AI assistants such as
// ChatGPT append as utm_source=chatgpt.com) and our own ?source=<key> when it
// passes the newsletter allowlist. Anything that looks like an email address or
// is unusually long is dropped.
import { isAllowedBriefSource } from './brief-cta'

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const MAX_UTM_LENGTH = 100

function safeUtmValue(value: string): boolean {
  return value.length > 0 && value.length <= MAX_UTM_LENGTH && !value.includes('@')
}

/** Analytics-safe version of a page URL: no hash, only attribution params. Null if unparseable. */
export function scrubAnalyticsUrl(raw: string): string | null {
  let url: URL
  try { url = new URL(raw) } catch { return null }
  const kept = new URLSearchParams()
  for (const key of UTM_PARAMS) {
    const values = url.searchParams.getAll(key)
    if (values.length === 1 && safeUtmValue(values[0])) kept.set(key, values[0])
  }
  const sources = url.searchParams.getAll('source')
  if (sources.length === 1 && isAllowedBriefSource(sources[0])) kept.set('source', sources[0])
  const query = kept.toString()
  url.search = query ? `?${query}` : ''
  url.hash = ''
  return url.toString()
}
