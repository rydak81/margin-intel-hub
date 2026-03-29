import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"
import { NextResponse } from "next/server"

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valid roles
const VALID_ROLES = ['brand_seller', 'agency', 'saas_tech', 'investor', 'service_provider', 'other']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, company, role, source = 'website' } = body

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
      }
    })

  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
