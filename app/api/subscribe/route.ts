import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Stateless proof that a caller completed step one of the gated signup for
 * this email. Issued only in the fresh-signup response and required for the
 * step-two enrichment update — possession of someone's email address is not
 * authorization to rewrite their lead data.
 */
function enrichmentToken(email: string): string | null {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET
  if (!secret) return null
  return createHmac('sha256', secret).update(`enrich:${email}`).digest('hex')
}

function isValidEnrichmentToken(email: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length === 0) return false
  const expected = enrichmentToken(email)
  if (!expected) return false
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valid roles
const VALID_ROLES = ['brand_seller', 'agency', 'saas_tech', 'investor', 'service_provider', 'other']

/** Keys we accept into the enrichment payload, to avoid storing arbitrary client JSON. */
const CONTEXT_KEYS = ['source', 'marketplace', 'category', 'salePrice', 'unitCost', 'marginPct'] as const

function sanitizeContext(raw: unknown): Record<string, string | number> | null {
  if (!raw || typeof raw !== 'object') return null

  const input = raw as Record<string, unknown>
  const clean: Record<string, string | number> = {}

  for (const key of CONTEXT_KEYS) {
    const value = input[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      clean[key] = value
    } else if (typeof value === 'string' && value.trim()) {
      clean[key] = value.trim().slice(0, 200)
    }
  }

  return Object.keys(clean).length > 0 ? clean : null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, company, role, source = 'website', update = false } = body
    const context = sanitizeContext(body.context)

    console.log('[Subscribe] API called with:', { email, firstName, company, role, source })

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate role if provided
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id, email')
      .eq('email', trimmedEmail)
      .single()

    if (existingSubscriber) {
      // Step two of the gated-tool flow: the subscriber already exists from the
      // email step, and we're now enriching them with role/context. Requires
      // the token issued when this signup was created — without it, anyone who
      // knows a subscriber's email could corrupt their lead-routing data.
      if (update && (role || context)) {
        if (!isValidEnrichmentToken(trimmedEmail, body.token)) {
          return NextResponse.json(
            { success: false, error: 'Not authorized to update this subscriber.' },
            { status: 403 }
          )
        }
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (role) patch.role = role
        if (context) {
          patch.context = context
          // Mirror the marketplace into its own column — it's the routing key the
          // rest of the system reads, so it shouldn't live only inside the blob.
          if (context.marketplace) patch.primary_marketplace = context.marketplace
        }

        const { error: updateError } = await supabase
          .from('subscribers')
          .update(patch)
          .eq('id', existingSubscriber.id)

        if (updateError) {
          console.warn('[Subscribe] Enrichment update failed:', updateError.message)
        }

        return NextResponse.json({
          success: true,
          message: 'Preferences saved.',
          subscriber: { id: existingSubscriber.id, email: existingSubscriber.email },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: 'already_subscribed',
          message: "You're already subscribed! Check your inbox for our latest updates."
        },
        { status: 409 }
      )
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: trimmedEmail,
        first_name: firstName?.trim() || null,
        company: company?.trim() || null,
        role: role || null,
        source: source,
        context: context,
        primary_marketplace: context?.marketplace ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Subscribe] Supabase insert error:', error.message, error.code, error.details)

      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'already_subscribed',
            message: "You're already subscribed! Check your inbox for our latest updates."
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Subscribe] Successfully subscribed:', data.email)

    // ── Send welcome email (non-blocking — don't fail the subscription if email fails) ──
    try {
      const welcomeResult = await sendEmail({
        to: trimmedEmail,
        subject: 'Welcome to MarketplaceBeta — Your Daily Brief starts tomorrow',
        html: generateWelcomeEmail(firstName?.trim()),
      })

      if (welcomeResult.success) {
        console.log('[Subscribe] Welcome email sent to:', trimmedEmail)
      } else {
        console.warn('[Subscribe] Welcome email failed:', welcomeResult.error)
      }
    } catch (emailError) {
      // Don't fail the subscription if the welcome email fails
      console.error('[Subscribe] Welcome email error (non-fatal):', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
      subscriber: {
        id: data.id,
        email: data.email,
      },
      // Authorizes the optional step-two enrichment update for this signup.
      enrichToken: enrichmentToken(trimmedEmail),
    })

  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
