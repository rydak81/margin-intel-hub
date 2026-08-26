// Live product lookup for the sourcing calculator. Accepts an ASIN, a UPC/EAN
// barcode, or a title search term; returns current market data (Buy Box price,
// lowest offer, offer count, monthly sold) from the Keepa product API.
// KEEPA_API_KEY stays server-side; responses cached 30 minutes (sourcing wants
// fresher data than the history page). Without a key returns
// { configured: false } and the client offers manual price entry.

import { NextRequest, NextResponse } from "next/server"
import { classifyQuery } from "@/lib/repricer/sourcing"

const CACHE_TTL_MS = 30 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

interface KeepaStatsProduct {
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
    p.stats?.buyBoxPrice !== undefined && p.stats.buyBoxPrice > 0
      ? Math.round(p.stats.buyBoxPrice + (p.stats.buyBoxShipping ?? 0)) / 100
      : null
  return {
    asin: p.asin,
    title: p.title ?? p.asin,
    buyBoxPrice: buyBoxFromStats ?? cents(cur[IDX.BUY_BOX_SHIPPING]),
    lowestOffer: cents(cur[IDX.NEW]),
    offerCount: cur[IDX.COUNT_NEW] >= 0 ? cur[IDX.COUNT_NEW] : null,
    monthlySold: p.monthlySold ?? null,
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 })

  const key = process.env.KEEPA_API_KEY
  if (!key) return NextResponse.json({ configured: false })

  const cached = cache.get(q)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.body)
  }

  const kind = classifyQuery(q)
  let url: string
  if (kind === "asin") {
    url = `https://api.keepa.com/product?key=${key}&domain=1&asin=${q.toUpperCase()}&stats=1&history=0`
  } else if (kind === "code") {
    url = `https://api.keepa.com/product?key=${key}&domain=1&code=${q.replace(/[\s-]/g, "")}&stats=1&history=0`
  } else {
    url = `https://api.keepa.com/search?key=${key}&domain=1&type=product&term=${encodeURIComponent(q)}&stats=1`
  }

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    return NextResponse.json({ error: `Keepa request failed (${res.status})` }, { status: 502 })
  }
  const data = (await res.json()) as { products?: KeepaStatsProduct[] }
  const products = (data.products ?? []).slice(0, 5)
  if (products.length === 0) {
    return NextResponse.json({ error: "No products found" }, { status: 404 })
  }

  const body = { configured: true, results: products.map(toResult) }
  cache.set(q, { at: Date.now(), body })
  return NextResponse.json(body)
}
