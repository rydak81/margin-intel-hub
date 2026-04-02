import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const requestedNext = url.searchParams.get("next")
  const authError = url.searchParams.get("error")
  const authErrorDescription = url.searchParams.get("error_description")
  const next =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/account"

  if (authError) {
    const errorUrl = new URL("/auth/error", url.origin)
    errorUrl.searchParams.set("message", authErrorDescription || authError)
    errorUrl.searchParams.set("next", next)
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    const errorUrl = new URL("/auth/error", url.origin)
    errorUrl.searchParams.set("message", "The sign-in link was incomplete or expired. Please request a fresh MarketplaceBeta link.")
    errorUrl.searchParams.set("next", next)
    return NextResponse.redirect(errorUrl)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const errorUrl = new URL("/auth/error", url.origin)
      errorUrl.searchParams.set("message", error.message)
      errorUrl.searchParams.set("next", next)
      return NextResponse.redirect(errorUrl)
    }
  } catch (error) {
    const errorUrl = new URL("/auth/error", url.origin)
    errorUrl.searchParams.set(
      "message",
      error instanceof Error ? error.message : "We couldn't finish the MarketplaceBeta sign-in flow."
    )
    errorUrl.searchParams.set("next", next)
    return NextResponse.redirect(errorUrl)
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
