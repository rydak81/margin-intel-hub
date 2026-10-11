import { NextRequest, NextResponse } from 'next/server'
import { keepaProductToHistory, type KeepaProduct } from '@/lib/repricer/history'
import { keepaAccess, readKeepa } from '@/lib/repricer/keepa-access'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store' }
export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get('asin')?.toUpperCase()
  const months = Number(req.nextUrl.searchParams.get('months') ?? 18)
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin) || !Number.isInteger(months) || months < 6 || months > 36) {
    return NextResponse.json({ error: 'Enter a valid ASIN and a 6–36 month window.' }, { status: 400, headers })
  }
  const access = await keepaAccess()
  if ('error' in access) return NextResponse.json({ configured: false, error: access.error }, { status: access.status, headers })
  try {
    const url = new URL('https://api.keepa.com/product')
    url.search = new URLSearchParams({ key: access.key, domain: '1', asin, history: '1', buybox: '1' }).toString()
    const data = await readKeepa<{ products?: KeepaProduct[] }>(url, 12 * 60 * 60 * 1000)
    const product = data.products?.find(p => p.asin === asin)
    if (!product) return NextResponse.json({ error: 'No market history found.' }, { status: 404, headers })
    return NextResponse.json({ configured: true, asin, source: 'keepa', points: keepaProductToHistory(product, months) }, { headers })
  } catch {
    // Never return provider URLs, credentials, or raw error payloads.
    return NextResponse.json({ error: 'Market history is temporarily unavailable.' }, { status: 502, headers })
  }
}
