// lib/email.ts
// Email client using Resend for transactional and newsletter emails
// Docs: https://resend.com/docs/send-with-nextjs

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
const DEFAULT_FROM = process.env.EMAIL_FROM || 'MarketplaceBeta <brief@marketplacebeta.com>'
const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO || 'ryan@marketplacebeta.com'

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo || DEFAULT_REPLY_TO,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`[Email] Resend API error ${response.status}:`, errorData)
      return { success: false, error: `Resend API ${response.status}: ${errorData}` }
    }

    const data = await response.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error('[Email] Send failed:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send emails in batches to avoid rate limits.
 * Resend free tier: 100 emails/day, 3,000/month.
 * Resend paid tier: much higher limits.
 *
 * This function sends emails one at a time with a small delay.
 * For larger lists (500+), consider Resend's batch API or Audiences feature.
 */
export async function sendBatchEmails(
  subscribers: { email: string; first_name?: string | null }[],
  subject: string,
  generateHtml: (subscriber: { email: string; first_name?: string | null }) => string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const subscriber of subscribers) {
    const html = generateHtml(subscriber)
    const result = await sendEmail({
      to: subscriber.email,
      subject,
      html,
    })

    if (result.success) {
      sent++
    } else {
      failed++
      errors.push(`${subscriber.email}: ${result.error}`)
    }

    // Delay between sends to respect Resend rate limits (5 req/sec on free tier)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`[Email] Batch complete: ${sent} sent, ${failed} failed`)
  return { sent, failed, errors }
}
