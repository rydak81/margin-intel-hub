import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, Mail } from "lucide-react"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Authentication Help | MarketplaceBeta",
  description: "Troubleshoot MarketplaceBeta sign-in and verification links.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>
}) {
  const params = await searchParams
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account"
  const message = params.message || "The MarketplaceBeta sign-in link could not be completed."

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="community" deskLabel="Sign-In Help" backHref="/" backLabel="Home" />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
          <CardContent className="p-6 md:p-8">
            <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300">
              Authentication Support
            </Badge>
            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">We couldn&apos;t finish that MarketplaceBeta sign-in</h1>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{message}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/70 bg-white/76 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Quick fixes
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                <li>Request a fresh sign-in link from MarketplaceBeta and open the newest email only.</li>
                <li>Use the same browser/device where you started the sign-in flow when possible.</li>
                <li>If the sender looks unfamiliar, that can happen for now because MarketplaceBeta uses Supabase Auth for secure email login.</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:flex-1">
                <Link href={next}>Try again</Link>
              </Button>
              <Button asChild variant="outline" className="sm:flex-1">
                <Link href="/community">
                  <Mail className="mr-2 h-4 w-4" />
                  Return to community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
