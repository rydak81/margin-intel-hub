import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { clientIp, createRateLimiter, inquiryRecipient, sponsorInquiryEmail, validateSponsorInquiry } from '@/lib/sponsor-inquiry'

const limiter = createRateLimiter()

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
  }

  const result = validateSponsorInquiry(body)
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: 400 })

  // Honeypot: pretend it worked, store nothing, send nothing.
  if (result.honeypot) return NextResponse.json({ success: true })

  if (!limiter.check(clientIp(request.headers))) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const inquiry = result.value
  let stored = false
  let emailed = false

  // Storage and email are independent: one failing never blocks the other.
  try {
    const { error } = await createAdminClient().from('sponsor_inquiries').insert({
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      offer: inquiry.offer,
      message: inquiry.message,
      source_page: inquiry.sourcePage,
    })
    if (error) console.error('[SponsorInquiry] Store failed:', error.message, error.code)
    else stored = true
  } catch (error) {
    console.error('[SponsorInquiry] Store error:', error)
  }

  const to = inquiryRecipient()
  if (!to) {
    console.error('[SponsorInquiry] No recipient configured (set SPONSOR_INQUIRY_TO or EMAIL_REPLY_TO); skipping email')
  } else {
    try {
      const { subject, html, text } = sponsorInquiryEmail(inquiry)
      const sent = await sendEmail({ to, subject, html, text, replyTo: inquiry.email })
      if (sent.success) emailed = true
      else console.error('[SponsorInquiry] Email failed:', sent.error)
    } catch (error) {
      console.error('[SponsorInquiry] Email error:', error)
    }
  }

  if (!stored && !emailed) {
    console.error('[SponsorInquiry] Inquiry neither stored nor emailed')
  }
  // Success even if one (or, logged above, both) channels failed: the visitor
  // did nothing wrong and the failure is already logged for follow-up.
  return NextResponse.json({ success: true })
}
