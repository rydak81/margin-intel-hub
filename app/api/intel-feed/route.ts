import { NextResponse } from 'next/server'

/** Retired partner feed. Do not accept keys, load sources, or query private data. */
export async function GET() {
  return NextResponse.json(
    { error: 'Feed retired', message: 'The partner intelligence feed is no longer available.' },
    { status: 410, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
  )
}
