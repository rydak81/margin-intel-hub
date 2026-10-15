import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadManufacturingSnapshot } from '@/lib/manufacturing-data'

export const maxDuration = 30

/**
 * Cross-site intelligence feed for partner properties (MeshNomics).
 * Key-guarded (intel_api_keys, service-role-only table). Returns:
 * - manufacturing: latest desktop-manufacturing desk stories (for the 3D-print side)
 * - signals: news-archive aggregates — category momentum, platform mentions,
 *   accelerating keywords, recent high-impact headlines (for forecasting inputs)
 * All of it is derived from MarketplaceBeta's own aggregation pipeline; consumers
 * should treat counts as coverage attention on a fixed source panel, not market size.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key || key.length < 32) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Feed not configured' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: keyRow } = await supabase
      .from('intel_api_keys')
      .select('key, label')
      .eq('key', key)
      .is('revoked_at', null)
      .maybeSingle()
    if (!keyRow) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [snapshot, signalsResult] = await Promise.all([
      loadManufacturingSnapshot(),
      supabase.rpc('intel_feed_signals'),
    ])

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        consumer: keyRow.label,
        manufacturing: {
          checkedAt: snapshot.checkedAt,
          stories: snapshot.stories.slice(0, 40).map((story) => ({
            title: story.title,
            url: story.url,
            source: story.sourceName,
            publishedAt: story.publishedAt,
            topic: story.topic,
            process: story.process,
            excerpt: story.excerpt,
          })),
        },
        signals: signalsResult.error ? null : signalsResult.data,
        notes:
          'Counts measure coverage attention on a fixed source panel, not market size. ' +
          'Keyword acceleration is rate-normalized (last 8 weeks vs the prior 20).',
      },
      { headers: { 'Cache-Control': 'private, max-age=900' } },
    )
  } catch (error) {
    console.error('Intel feed error:', error)
    return NextResponse.json({ error: 'Feed failed', details: String(error) }, { status: 500 })
  }
}
