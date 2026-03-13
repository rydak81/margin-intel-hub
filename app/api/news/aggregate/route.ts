import { runAggregation, initializeSources } from '@/lib/news-aggregation'
import { NextResponse } from 'next/server'

// This endpoint triggers the news aggregation
// It can be called by a cron job or manually
export async function POST(request: Request) {
  try {
    // Verify authorization (optional - add your own auth)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // Allow if CRON_SECRET matches or if no secret is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize sources if needed
    await initializeSources()

    // Run aggregation
    const result = await runAggregation()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Aggregation error:', error)
    return NextResponse.json(
      { error: 'Aggregation failed', details: String(error) },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'news-aggregation',
    timestamp: new Date().toISOString()
  })
}
