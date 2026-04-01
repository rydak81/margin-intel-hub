import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callAI } from '@/lib/ai-client'
import { sendBatchEmails } from '@/lib/email'
import { generateDailyBriefEmail } from '@/lib/email-templates'

export const maxDuration = 60

function getEasternCalendarDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})

  return {
    long: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
    short: `${parts.month} ${parts.day}`,
    iso: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

function getEasternSendWindow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})

  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    display: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ET`,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase credentials')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const forceSend = url.searchParams.get('force') === '1'

    // Verify cron authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const easternWindow = getEasternSendWindow()
    if (!forceSend && easternWindow.hour !== 7) {
      console.log(`[DailyBrief] Skipping send at ${easternWindow.display} — waiting for 7:00 AM ET window`)
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Outside 7:00 AM ET send window',
        sendWindow: easternWindow.display,
      })
    }

    // ── Step 1: Get top articles from the last 24 hours ──
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: topArticles, error: articlesError } = await getSupabase()
      .from('articles')
      .select('*')
      .gte('published_at', yesterday)
      .eq('relevant', true)
      .gte('relevance_score', 60)
      .order('relevance_score', { ascending: false })
      .limit(7)

    if (articlesError) {
      return NextResponse.json({ error: `DB query failed: ${articlesError.message}` }, { status: 500 })
    }

    if (!topArticles?.length) {
      console.log('[DailyBrief] No articles found for brief — skipping email send')
      return NextResponse.json({
        success: true,
        message: 'No articles for brief today — no emails sent',
        articles: 0,
        emailsSent: 0,
        date: new Date().toISOString()
      })
    }

    // ── Step 2: Generate AI brief ──
    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      return NextResponse.json({
        error: 'No AI API key configured',
        articles: topArticles.length,
      }, { status: 500 })
    }

    const briefPrompt = `You are a marketplace intelligence analyst writing a daily email brief for ecommerce professionals who sell on Amazon, Walmart, Shopify, and other marketplaces.

Write a concise daily news brief with these ${topArticles.length} stories. Format it for email readability:

For each story:
- **Bold one-line headline**
- 2-3 sentence summary focused on seller impact
- Action item if applicable (start with "Action:")

End with a "## Bottom Line" section (2-3 sentences) summarizing the day's key themes and what sellers should be paying attention to.

Keep the tone professional but accessible. Write as if you're briefing a colleague over coffee.

Stories:
${topArticles.map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source_name})\nSummary: ${a.ai_summary || a.summary}`).join('\n\n')}`

    const response = await callAI({
      prompt: briefPrompt,
      maxTokens: 2000
    })
    console.log(`[DailyBrief] Generated via ${response.provider} (${response.model})`)

    // ── Step 3: Fetch all subscribers ──
    const { data: subscribers, error: subError } = await getSupabase()
      .from('subscribers')
      .select('email, first_name')

    if (subError) {
      console.error('[DailyBrief] Failed to fetch subscribers:', subError.message)
      return NextResponse.json({
        error: `Failed to fetch subscribers: ${subError.message}`,
        brief: response.text, // Still return the brief even if email fails
      }, { status: 500 })
    }

    if (!subscribers?.length) {
      console.log('[DailyBrief] No subscribers found — brief generated but no emails sent')
      return NextResponse.json({
        success: true,
        articles: topArticles.length,
        brief: response.text,
        emailsSent: 0,
        message: 'No subscribers to send to',
        date: new Date().toISOString()
      })
    }

    // ── Step 4: Send emails to all subscribers ──
    const hasResendKey = !!process.env.RESEND_API_KEY
    if (!hasResendKey) {
      console.warn('[DailyBrief] RESEND_API_KEY not set — brief generated but emails not sent')
      return NextResponse.json({
        success: true,
        articles: topArticles.length,
        subscribers: subscribers.length,
        brief: response.text,
        emailsSent: 0,
        message: 'RESEND_API_KEY not configured — emails skipped',
        provider: response.provider,
        date: new Date().toISOString()
      })
    }

    const today = getEasternCalendarDate()

    const emailResult = await sendBatchEmails(
      subscribers,
      `Daily Marketplace Brief — ${today.short}`,
      (subscriber) => generateDailyBriefEmail({
        briefContent: response.text,
        date: today.long,
        articleCount: topArticles.length,
        subscriberName: subscriber.first_name,
      })
    )

    console.log(`[DailyBrief] Emails sent: ${emailResult.sent}/${subscribers.length}`)

    return NextResponse.json({
      success: true,
      articles: topArticles.length,
      brief: response.text,
      provider: response.provider,
      emailsSent: emailResult.sent,
      emailsFailed: emailResult.failed,
      totalSubscribers: subscribers.length,
      date: new Date().toISOString()
    })
  } catch (error) {
    console.error('Daily brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily brief', details: String(error) },
      { status: 500 }
    )
  }
}
