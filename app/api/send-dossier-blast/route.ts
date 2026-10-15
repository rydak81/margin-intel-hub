import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBatchEmails } from '@/lib/email'
import { generateDossierEmail } from '@/lib/email-templates'

export const maxDuration = 60

const BLAST_PURPOSE = 'dossier-2026-10'

/**
 * One-off announcement blast for the Intelligence Dossier (Edition 1).
 * Mirrors send-welcome-blast: guarded, with a dry-run mode. Two accepted
 * credentials: CRON_SECRET (Bearer header or `key` query param), or a
 * single-use token pre-inserted into blast_tokens (service-role only table) —
 * the token is consumed on a successful real send, so the blast cannot fire twice.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const keyParam = searchParams.get('key')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const secretOk = !!cronSecret && (authHeader === `Bearer ${cronSecret}` || keyParam === cronSecret)
    let tokenOk = false
    if (!secretOk && keyParam && keyParam.length >= 32) {
      const { data: tokenRow } = await supabase
        .from('blast_tokens')
        .select('token')
        .eq('token', keyParam)
        .eq('purpose', BLAST_PURPOSE)
        .is('used_at', null)
        .maybeSingle()
      tokenOk = !!tokenRow
    }
    if (!secretOk && !tokenOk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dryRun = searchParams.get('dry') === 'true'

    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, first_name')

    if (subError) {
      return NextResponse.json({ error: `Failed to fetch subscribers: ${subError.message}` }, { status: 500 })
    }
    if (!subscribers?.length) {
      return NextResponse.json({ success: true, message: 'No subscribers found', count: 0 })
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Would send the dossier announcement to ${subscribers.length} subscribers`,
        subscribers: subscribers.map((s) => ({ email: s.email, name: s.first_name })),
      })
    }

    const emailResult = await sendBatchEmails(
      subscribers,
      'The 2026 Margin Squeeze — our first Intelligence Dossier is out',
      (subscriber) => generateDossierEmail(subscriber.first_name, subscriber.email),
    )

    // Consume the single-use token so the blast cannot be triggered again with it.
    if (tokenOk && keyParam) {
      await supabase.from('blast_tokens').update({ used_at: new Date().toISOString() }).eq('token', keyParam)
    }

    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      emailsSent: emailResult.sent,
      emailsFailed: emailResult.failed,
      errors: emailResult.errors.length > 0 ? emailResult.errors : undefined,
    })
  } catch (error) {
    console.error('Dossier blast error:', error)
    return NextResponse.json({ error: 'Failed to send dossier emails', details: String(error) }, { status: 500 })
  }
}
