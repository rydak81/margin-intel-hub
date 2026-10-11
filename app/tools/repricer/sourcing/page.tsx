import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { SourcingView } from "@/components/repricer/sourcing-view"
import { PackageSearch } from "lucide-react"

export const metadata: Metadata = {
  alternates: { canonical: "https://marketplacebeta.com/tools/repricer/sourcing" },
  title: "Sourcing Calculator | ProfitTygr",
  description:
    "Look up or scan a product, enter an observed selling price, and reverse-calculate the maximum you should pay to hit your target margin on each platform.",
}

export default function RepricerSourcingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader
        active="tools"
        deskLabel="ProfitTygr · Sourcing"
        backHref="/tools/repricer"
        backLabel="Repricer"
      />

      <section className="mx-auto site-width px-4 pt-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
          <Link
            href="/tools/repricer"
            className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Dashboard
          </Link>
          <Link
            href="/tools/repricer/history"
            className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Price History
          </Link>
          <Link
            href="/tools/repricer/sourcing"
            className="rounded-full bg-sky-500/10 px-3 py-1.5 font-medium text-sky-700 dark:text-sky-300"
          >
            Sourcing
          </Link>
        </nav>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight md:text-3xl">
          <PackageSearch className="h-7 w-7 text-sky-600" />
          Sourcing calculator
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Buying decision in reverse: look up a product by ASIN, barcode, or name (or scan it
          with your phone camera), or enter an observed selling price, and see the maximum you can
          pay per unit and still hit your target margin — on Amazon first, then every channel.
        </p>
      </section>

      <main className="mx-auto site-width px-4 py-6">
        <SourcingView />
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
