// Live product lookup for the sourcing calculator. Accepts an ASIN, a UPC/EAN
// barcode, or a title search term; returns current market data (Buy Box price,
// lowest offer, offer count, monthly sold) from the Keepa product API.
// Paid data requires explicit server opt-in and an authenticated, allowlisted account.
// Provider responses cache for 30 minutes; public users can enter prices manually.

import { NextRequest, NextResponse } from "next/server"
import { classifyQuery } from "@/lib/repricer/sourcing"

import { keepaAccess, readKeepa } from '@/lib/repricer/keepa-access'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store' }

interface KeepaStatsProduct {
  productType?: number
  asin: string
  title?: string
  monthlySold?: number
  stats?: {
    current?: number[]
    buyBoxPrice?: number
    buyBoxShipping?: number
  }
}

/** Keepa stats.current indices (same layout as csv). */
const IDX = { NEW: 1, COUNT_NEW: 11, BUY_BOX_SHIPPING: 18 } as const

function toResult(p: KeepaStatsProduct) {
  const cur = p.stats?.current ?? []
  const cents = (v: number | undefined) =>
    v === undefined || v === null || v < 0 ? null : Math.round(v) / 100
  const buyBoxFromStats =
    p.stats?.buyBoxPrice !== undefined && p.stats.buyBoxPrice > 0 && (p.stats.buyBoxShipping ?? -1) >= 0
      ? Math.round(p.stats.buyBoxPrice + (p.stats.buyBoxShipping ?? 0)) / 100
      : null
  return {
    asin: p.asin,
    title: p.title ?? p.asin,
    buyBoxPrice: buyBoxFromStats ?? cents(cur[IDX.BUY_BOX_SHIPPING]),
    lowestOffer: cents(cur[IDX.NEW]),
    offerCount: cur[IDX.COUNT_NEW] >= 0 ? cur[IDX.COUNT_NEW] : null,
    monthlySold: typeof p.monthlySold === "number" && p.monthlySold >= 0 ? p.monthlySold : null,
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length > 160) return NextResponse.json({ error: "Enter a query of 1–160 characters." }, { status: 400, headers })
  const access = await keepaAccess()
  if ('error' in access) return NextResponse.json({ configured: false, error: access.error }, { status: access.status, headers })
  try {
    const kind = classifyQuery(q)
    const url = new URL(kind === 'term' ? 'https://api.keepa.com/search' : 'https://api.keepa.com/product')
    const params: Record<string, string> = { key: access.key, domain: '1', stats: '1', history: '0' }
    if (kind === 'asin') params.asin = q.toUpperCase()
    else if (kind === 'code') params.code = q.replace(/[\s-]/g, '')
    else { params.type = 'product'; params.term = q }
    url.search = new URLSearchParams(params).toString()
    const data = await readKeepa<{ products?: KeepaStatsProduct[] }>(url, 30 * 60 * 1000)
    const products = (data.products ?? []).filter(p => p.productType == null || p.productType === 0).slice(0, 5)
    if (!products.length) return NextResponse.json({ error: 'No products with usable market data found.' }, { status: 404, headers })
    return NextResponse.json({ configured: true, results: products.map(toResult) }, { headers })
  } catch {
    return NextResponse.json({ error: 'Market-data lookup is temporarily unavailable. Use manual pricing.' }, { status: 502, headers })
  }
}
