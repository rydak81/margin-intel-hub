import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callAI } from '@/lib/ai-client'
import { sendBatchEmails } from '@/lib/email'
import { generateDailyBriefEmail, generateDailyBriefText } from '@/lib/email-templates'
import { claimTodaysBrief, getEasternCalendarDate, getEasternSendWindow, isBriefSendWindow } from '@/lib/brief-schedule'

export const maxDuration = 60

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
  // Set once this run has claimed today's daily_briefs row. Released on failures
  // that happen before the brief is written, so a later run can try again.
  let releaseClaim: (() => Promise<void>) | null = null
  let heldClaimContent = ''
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
    if (!forceSend && !isBriefSendWindow()) {
      console.log(`[DailyBrief] Skipping send at ${easternWindow.display} — waiting for 7:00 AM ET window`)
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Outside 7:00 AM ET send window',
        sendWindow: easternWindow.display,
      })
    }

    // ── Step 0: Recipients, then claim today's brief (idempotency) ──
    // Subscribers are fetched before the claim so a failure here leaves nothing
    // claimed and a retry can still send. The claim is only taken when a send
    // will actually be attempted (Resend configured and at least one subscriber);
    // archive-only runs stay unclaimed, exactly as before.
    const { data: subscribers, error: subError } = await getSupabase()
      .from('subscribers')
      .select('email, first_name')

    if (subError) {
      console.error('[DailyBrief] Failed to fetch subscribers:', subError.message)
      return NextResponse.json({ error: `Failed to fetch subscribers: ${subError.message}` }, { status: 500 })
    }

    // vercel.json runs this route at 11:00 and 12:00 UTC so the 7 AM ET send
    // survives DST; the hour check above lets only one of them through. The claim
    // also stops a duplicated or retried cron delivery from mailing subscribers
    // twice: daily_briefs.id is the Eastern date, so a second insert conflicts.
    // A claim left behind by a run that died mid-flight expires after
    // BRIEF_CLAIM_LEASE_MS and is taken over atomically. ?force=1 (manual
    // re-send) skips the claim on purpose. Any other claim error fails open,
    // matching the existing "persistence never blocks the send" rule.
    const claimDay = getEasternCalendarDate()
    const willDeliver = !!process.env.RESEND_API_KEY && !!subscribers?.length
    if (!forceSend && willDeliver) {
      const claim = await claimTodaysBrief(getSupabase(), claimDay.iso)
      if (claim.status === 'taken') {
        console.log(`[DailyBrief] Brief for ${claimDay.iso} already sent or in progress — skipping duplicate run`)
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: 'Brief already sent or in progress today',
          date: claimDay.iso,
        })
      }
      if (claim.status === 'error') {
        console.error('[DailyBrief] Could not claim today\'s brief, continuing without the guard:', claim.message)
      } else {
        const heldContent = claim.content
        heldClaimContent = heldContent
        releaseClaim = async () => {
          const { error } = await getSupabase().from('daily_briefs').delete().eq('id', claimDay.iso).eq('content', heldContent)
          if (error) console.error('[DailyBrief] Failed to release claim:', error.message)
        }
      }
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
      await releaseClaim?.()
      return NextResponse.json({ error: `DB query failed: ${articlesError.message}` }, { status: 500 })
    }

    if (!topArticles?.length) {
      console.log('[DailyBrief] No articles found for brief — skipping email send')
      // Heartbeat: a quiet day still leaves a row, so monitoring can tell
      // "nothing qualified" apart from "the cron never ran". ignoreDuplicates
      // keeps this from ever clobbering a real brief already saved today.
      const skipDay = getEasternCalendarDate()
      const { error: skipSaveError } = await getSupabase().from('daily_briefs').upsert({
        id: skipDay.iso,
        brief_date: skipDay.iso,
        content: 'No qualifying articles today — no brief generated or sent.',
        article_count: 0,
        article_ids: [],
      // With our claim held, the only row today is the claim, so replace it;
      // a forced run keeps ignoreDuplicates so it never clobbers a real brief.
      }, { onConflict: 'id', ignoreDuplicates: !releaseClaim })
      if (skipSaveError) console.error('[DailyBrief] Failed to persist skip heartbeat:', skipSaveError.message)
      return NextResponse.json({
        success: true,
        message: 'No articles for brief today — no emails sent',
        articles: 0,
        emailsSent: 0,
        briefPersisted: !skipSaveError,
        ...(skipSaveError ? { briefPersistError: skipSaveError.message } : {}),
        date: new Date().toISOString()
      })
    }

    // ── Step 2: Generate AI brief ──
    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      await releaseClaim?.()
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

    // Persist the brief: an auditable archive and a heartbeat for the pipeline,
    // written whether or not the email send below succeeds. One retry on failure;
    // the outcome is exposed as briefPersisted/briefPersistError on every response
    // so a silent archive gap can't hide behind a successful email run.
    const today = getEasternCalendarDate()
    const briefRow = {
      id: today.iso,
      brief_date: today.iso,
      content: response.text,
      article_count: topArticles.length,
      article_ids: topArticles.map((a: any) => a.id),
      provider: response.provider,
      model: response.model,
    }
    let { error: briefSaveError } = await getSupabase().from('daily_briefs').upsert(briefRow, { onConflict: 'id' })
    if (briefSaveError) {
      console.error('[DailyBrief] Failed to persist brief, retrying once:', briefSaveError.message)
      ;({ error: briefSaveError } = await getSupabase().from('daily_briefs').upsert(briefRow, { onConflict: 'id' }))
      if (briefSaveError) console.error('[DailyBrief] Brief persistence failed after retry:', briefSaveError.message)
    }
    // While we hold a claim, the row must stop looking like a claim before we
    // mail anyone; otherwise, once the lease expires, a retry would take it over
    // and send a second time. If the brief couldn't be saved, try a small
    // non-claim marker instead; if even that fails, don't send: release the
    // claim and return 500 so a retry (or ?force=1) can do the whole run.
    // Unguarded runs (forced, or claim error) keep "persistence never blocks
    // the send".
    if (releaseClaim && briefSaveError) {
      const { data: marked, error: markError } = await getSupabase()
        .from('daily_briefs')
        .update({ content: `Brief delivery started at ${new Date().toISOString()} (brief text not archived: ${briefSaveError.message})` })
        .eq('id', today.iso)
        .eq('content', heldClaimContent)
        .select('id')
      if (markError || !marked?.length) {
        console.error('[DailyBrief] Could not record that delivery is starting; not sending, to avoid a duplicate on retry:', markError?.message ?? 'claim no longer held')
        await releaseClaim()
        return NextResponse.json({
          error: 'Brief could not be recorded as sent, so no emails were sent; retry, or re-send with ?force=1',
          briefPersisted: false,
          briefPersistError: briefSaveError.message,
        }, { status: 500 })
      }
    }
    // The day is now recorded and delivery follows immediately. From here a
    // retry is skipped even if sending fails part-way, because some subscribers
    // may already have it; use ?force=1 to re-send deliberately.
    releaseClaim = null
    const persistence = {
      briefPersisted: !briefSaveError,
      ...(briefSaveError ? { briefPersistError: briefSaveError.message } : {}),
    }

    // ── Step 3: Subscribers were fetched before the claim (Step 0) ──
    if (!subscribers?.length) {
      console.log('[DailyBrief] No subscribers found — brief generated but no emails sent')
      return NextResponse.json({
        success: true,
        articles: topArticles.length,
        brief: response.text,
        emailsSent: 0,
        message: 'No subscribers to send to',
        ...persistence,
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
        ...persistence,
        date: new Date().toISOString()
      })
    }

    // (today computed above, when the brief was persisted)

    const emailResult = await sendBatchEmails(
      subscribers,
      `Daily Marketplace Brief — ${today.short}`,
      (subscriber) => generateDailyBriefEmail({
        briefContent: response.text,
        date: today.long,
        articleCount: topArticles.length,
        subscriberName: subscriber.first_name,
        subscriberEmail: subscriber.email,
      }),
      (subscriber) => generateDailyBriefText({
        briefContent: response.text,
        date: today.long,
        articleCount: topArticles.length,
        subscriberEmail: subscriber.email,
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
      ...persistence,
      date: new Date().toISOString()
    })
  } catch (error) {
    await releaseClaim?.()
    console.error('Daily brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily brief', details: String(error) },
      { status: 500 }
    )
  }
}
