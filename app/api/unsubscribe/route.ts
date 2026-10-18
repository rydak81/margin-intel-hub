import { createAdminClient } from "@/lib/supabase/admin"
// Keep the same accepted-address contract as /api/subscribe.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const headers = { 'Content-Type': 'text/html', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }

function linkEmail(values: FormDataEntryValue[] | string[]): string | null {
  if (values.length !== 1 || typeof values[0] !== 'string') return null
  const email = values[0].trim().toLowerCase()
  return EMAIL_REGEX.test(email) ? email : null
}

function invalidLink() {
  return new Response(unsubscribePage('This unsubscribe link is invalid. Please use the link in your latest email or contact us.', false), { headers, status: 400 })
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Link scanners may GET this URL. Only an explicit form POST changes a subscription. */
export async function GET(request: Request) {
  const email = linkEmail(new URL(request.url).searchParams.getAll('email'))
  if (!email) return invalidLink()
  return new Response(unsubscribePage('Confirm that you want to stop receiving the Daily Marketplace Brief.', false, email), { headers })
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const email = linkEmail(form.getAll('email'))
    if (!email) return invalidLink()

    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('subscribers')
      .delete({ count: 'exact' })
      .eq('email', email)

    if (error) {
      console.error('[Unsubscribe] Error:', error.message)
      return new Response(unsubscribePage('Something went wrong. Please try again or contact us.', false), {
        headers,
        status: 500,
      })
    }

    if (count === null || !Number.isSafeInteger(count) || count < 0) {
      return new Response(unsubscribePage('We could not confirm the result. Please try again or contact us.', false), {
        headers, status: 500,
      })
    }
    if (count === 0) {
      return new Response(unsubscribePage('No active subscription was found for this link. It may already have been removed. No subscription was changed.', false), {
        headers, status: 200,
      })
    }

    return new Response(unsubscribePage('Your subscription has been removed from the Daily Marketplace Brief.', true), {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return new Response(unsubscribePage('An unexpected error occurred.', false), {
      headers,
      status: 500,
    })
  }
}

function unsubscribePage(message: string, success: boolean, confirmationEmail?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - MarketplaceBeta</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .card { background: white; border-radius: 12px; padding: 48px; max-width: 440px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; }
    a { color: #14b8a6; text-decoration: none; font-weight: 600; }
    .icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '👋' : '⚠️'}</div>
    <h1>${confirmationEmail ? "Confirm unsubscribe" : success ? "You've been unsubscribed" : "Subscription status"}</h1>
    <p>${message}</p>
    ${confirmationEmail ? `<form method="post" action="/api/unsubscribe"><input type="hidden" name="email" value="${escapeHtml(confirmationEmail)}"><button type="submit">Confirm unsubscribe</button></form>` : ''}
    <p style="margin-top: 24px;"><a href="https://marketplacebeta.com">← Back to MarketplaceBeta</a></p>
  </div>
</body>
</html>`
}
