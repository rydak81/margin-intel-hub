// Price-history proxy. With KEEPA_API_KEY set, fetches the Keepa product API
// server-side (the key never reaches the browser) and returns monthly points;
// responses are cached in memory for 12 hours to conserve Keepa tokens.
// Without a key it returns { configured: false } and the client renders a
// clearly-labeled sample series instead.

import { NextRequest, NextResponse } from "next/server"
import { keepaProductToHistory, type KeepaProduct } from "@/lib/repricer/history"

const CACHE_TTL_MS = 12 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin")
  if (!asin || !/^B0[A-Z0-9]{8}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400 })
  }

  const key = process.env.KEEPA_API_KEY
  if (!key) {
    return NextResponse.json({ configured: false })
  }

  const cached = cache.get(asin)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.body)
  }

  const url = `https://api.keepa.com/product?key=${key}&domain=1&asin=${asin}&history=1&buybox=1`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    return NextResponse.json(
      { error: `Keepa request failed (${res.status})` },
      { status: 502 },
    )
  }
  const data = (await res.json()) as { products?: KeepaProduct[] }
  const product = data.products?.[0]
  if (!product) {
    return NextResponse.json({ error: "ASIN not found in Keepa" }, { status: 404 })
  }

  const body = {
    configured: true,
    asin,
    source: "keepa" as const,
    points: keepaProductToHistory(product),
  }
  cache.set(asin, { at: Date.now(), body })
  return NextResponse.json(body)
}
