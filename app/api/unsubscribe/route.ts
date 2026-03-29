import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!email) {
      return new Response(unsubscribePage('Missing email address.', false), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('email', email)

    if (error) {
      console.error('[Unsubscribe] Error:', error.message)
      return new Response(unsubscribePage('Something went wrong. Please try again or contact us.', false), {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      })
    }

    console.log('[Unsubscribe] Removed:', email)

    return new Response(unsubscribePage(email, true), {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    })
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return new Response(unsubscribePage('An unexpected error occurred.', false), {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    })
  }
}

function unsubscribePage(message: string, success: boolean): string {
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
    <h1>${success ? "You've been unsubscribed" : 'Oops'}</h1>
    <p>${success ? `<strong>${message}</strong> has been removed from the Daily Marketplace Brief. We're sorry to see you go.` : message}</p>
    <p style="margin-top: 24px;"><a href="https://marketplacebeta.com">← Back to MarketplaceBeta</a></p>
  </div>
</body>
</html>`
}
