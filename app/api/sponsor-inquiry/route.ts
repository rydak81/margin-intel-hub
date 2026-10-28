import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient, hasAdminConfig } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { clientIp, createRateLimiter, inquiryRecipient, sponsorInquiryEmail, validateSponsorInquiry } from '@/lib/sponsor-inquiry'

export const maxDuration = 60
const limiter = createRateLimiter()
const timeout = () => AbortSignal.timeout(8000)
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
  }

  const result = validateSponsorInquiry(body)
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: 400 })
  // Intentional bot sink; legitimate inquiries must be durably saved below.
  if (result.honeypot) return NextResponse.json({ success: true })

  const suppliedId = (body as Record<string, unknown>).inquiryId
  if (suppliedId !== undefined && (typeof suppliedId !== 'string' || !uuid.test(suppliedId))) {
    return NextResponse.json({ success: false, error: 'Invalid inquiry reference. Please reload and try again.' }, { status: 400 })
  }
  const inquiryId = typeof suppliedId === 'string' ? suppliedId.toLowerCase() : randomUUID()
  if (!limiter.check(clientIp(request.headers))) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Your details are still here. Please try again in an hour.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const inquiry = result.value
  const row = { id: inquiryId, name: inquiry.name, email: inquiry.email, company: inquiry.company,
    offer: inquiry.offer, message: inquiry.message, source_page: inquiry.sourcePage }
  let stored = false
  let notificationAccepted = false
  let db: ReturnType<typeof createAdminClient> | null = null

  try {
    if (!hasAdminConfig()) throw new Error('Storage configuration missing')
    db = createAdminClient()
    const { data, error } = await db.from('sponsor_inquiries').insert(row).select('id').abortSignal(timeout()).single()
    if (error?.code === '23505') {
      // A retry must refer to the same payload. Never overwrite another inquiry.
      const existing = await db.from('sponsor_inquiries')
        .select('id,name,email,company,offer,message,source_page,notification_email_id')
        .eq('id', inquiryId).abortSignal(timeout()).single()
      if (existing.error || !existing.data) throw new Error('Cannot confirm previous save')
      if (!(Object.keys(row) as Array<keyof typeof row>).every(key => existing.data[key] === row[key])) {
        return NextResponse.json({ success: false, error: 'This reference was already used. Please reload and try again.' }, { status: 409 })
      }
      stored = true
      notificationAccepted = Boolean(existing.data.notification_email_id)
    } else if (error || data?.id !== inquiryId) {
      throw new Error('Storage did not confirm the inquiry')
    } else {
      stored = true
    }
  } catch {
    // Correlatable, without visitor details, credentials or raw provider errors.
    console.error('[SponsorInquiry] storage_failed', { inquiryId })
  }

  // Still attempt a notification during a storage outage, but email acceptance
  // alone must never clear the visitor's form: it is not proof of delivery.
  const to = inquiryRecipient()
  if (!notificationAccepted && to) {
    try {
      const { subject, html, text } = sponsorInquiryEmail(inquiry)
      const sent = await sendEmail({ to, subject, html, text, replyTo: inquiry.email,
        idempotencyKey: `sponsor-inquiry/${inquiryId}`, signal: timeout() })
      notificationAccepted = sent.success && Boolean(sent.id)
      if (notificationAccepted && stored && db) {
        const receipt = await db.from('sponsor_inquiries').update({
          notification_email_id: sent.id,
          notification_accepted_at: new Date().toISOString(),
        }).eq('id', inquiryId).select('id').abortSignal(timeout()).single()
        if (receipt.error || receipt.data?.id !== inquiryId) {
          console.error('[SponsorInquiry] notification_receipt_failed', { inquiryId, emailId: sent.id })
        }
      }
    } catch {
      console.error('[SponsorInquiry] notification_error', { inquiryId })
    }
  }
  if (!notificationAccepted) console.error('[SponsorInquiry] notification_pending', { inquiryId, stored, recipientConfigured: Boolean(to) })

  if (!stored || !notificationAccepted) {
    return NextResponse.json({ success: false, stored, inquiryId,
      error: stored
        ? 'Your inquiry was saved, but we could not notify our team. Your details are still here; please retry shortly.'
        : 'We could not confirm your inquiry was saved. Your details are still here; please try again shortly.',
    }, { status: 503, headers: { 'Retry-After': '60' } })
  }
  return NextResponse.json({ success: true, stored: true, inquiryId })
}
