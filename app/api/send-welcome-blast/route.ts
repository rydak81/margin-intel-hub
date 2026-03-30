import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBatchEmails } from '@/lib/email'
import { generateWelcomeEmail } from '@/lib/email-templates'

export const maxDuration = 60

export async function GET(request: Request) {
  try {
    // Require CRON_SECRET for authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for dry run mode
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dry') === 'true'

    // Connect to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, first_name')

    if (subError) {
      return NextResponse.json({ error: `Failed to fetch subscribers: ${subError.message}` }, { status: 500 })
    }

    if (!subscribers?.length) {
      return NextResponse.json({ success: true, message: 'No subscribers found', count: 0 })
    }

    // Dry run mode — just show who would receive the email
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Would send welcome email to ${subscribers.length} subscribers`,
        subscribers: subscribers.map(s => ({ email: s.email, name: s.first_name })),
      })
    }

    // Send welcome emails to all existing subscribers
    const emailResult = await sendBatchEmails(
      subscribers,
      'Welcome to MarketplaceBeta — Your Daily Brief starts tomorrow',
      (subscriber) => generateWelcomeEmail(subscriber.first_name)
    )

    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      emailsSent: emailResult.sent,
      emailsFailed: emailResult.failed,
      errors: emailResult.errors.length > 0 ? emailResult.errors : undefined,
    })
  } catch (error) {
    console.error('Welcome blast error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome emails', details: String(error) },
      { status: 500 }
    )
  }
}
