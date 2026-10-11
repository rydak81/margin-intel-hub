import { createClient } from '@/lib/supabase/server'

/** Paid data is opt-in and restricted to explicitly provisioned account IDs. */
export async function keepaAccess(): Promise<{ key: string } | { status: number; error: string }> {
  const key = process.env.KEEPA_API_KEY
  const allowed = (process.env.REPRICER_KEEPA_USER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (process.env.REPRICER_KEEPA_ENABLED !== 'true' || !key || !allowed.length) {
    return { status: 200, error: 'Market-data lookup is not enabled. Use manual pricing or sample charts.' }
  }
  try {
    const client = await createClient()
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) return { status: 401, error: 'Sign in with an authorized account to use market-data lookup.' }
    if (!allowed.includes(data.user.id) || data.user.is_anonymous) return { status: 403, error: 'This account does not have market-data access. Manual pricing remains available.' }
    const now = Date.now()
    const previous = requests.get(data.user.id)
    const current = previous && now - previous.start < 60_000 ? previous : { start: now, count: 0 }
    if (current.count >= 6) return { status: 429, error: 'Please wait a minute before another market-data lookup.' }
    current.count++
    if (requests.size >= 1000) requests.clear()
    requests.set(data.user.id, current)
    return { key }
  } catch {
    return { status: 503, error: 'Account verification is unavailable. Use manual pricing for now.' }
  }
}
// Best-effort per-instance throttling, not a global token budget. The server-side
// account allowlist is the access boundary; keep it limited to trusted operators.
const requests = new Map<string, { start: number; count: number }>()

const cache = new Map<string, { expires: number; body: unknown }>()
const pending = new Map<string, Promise<unknown>>()
export async function readKeepa<T>(url: URL, ttl: number): Promise<T> {
  const cacheKey = url.pathname + '?' + [...url.searchParams].filter(([k]) => k !== 'key').map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.body as T
  if (pending.has(cacheKey)) return pending.get(cacheKey) as Promise<T>
  const work = (async () => {
    const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000) })
    if (!response.ok) throw new Error('Market-data provider unavailable')
    const body = await response.json()
    if (body.error) throw new Error('Market-data provider rejected the request')
    if (cache.size >= 100) cache.delete(cache.keys().next().value!)
    cache.set(cacheKey, { expires: Date.now() + ttl, body })
    return body
  })()
  pending.set(cacheKey, work)
  try { return await work as T } finally { pending.delete(cacheKey) }
}
