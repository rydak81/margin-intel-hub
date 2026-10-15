import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBatchEmails } from '@/lib/email'
import { generateDossierEmail } from '@/lib/email-templates'

export const maxDuration = 60

/**
 * One-off announcement blast for the Intelligence Dossier (Edition 1).
 * Mirrors send-welcome-blast: CRON_SECRET-guarded, with a dry-run mode.
 * The secret is accepted as a Bearer header or a `key` query parameter so the
 * route can be triggered from environments that cannot set headers.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const keyParam = searchParams.get('key')
    if (!cronSecret || (authHeader !== `Bearer ${cronSecret}` && keyParam !== cronSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dryRun = searchParams.get('dry') === 'true'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

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
