import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { HistoryView } from "@/components/repricer/history-view"
import { LineChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Price History | ProfitTygr",
  description:
    "Historical pricing, Buy Box price, seller count, and monthly sales per SKU — with your profitability floor drawn on the chart.",
}

export default function RepricerHistoryPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader
        active="tools"
        deskLabel="ProfitTygr · Price History"
        backHref="/tools/repricer"
        backLabel="Repricer"
      />

      <section className="mx-auto max-w-7xl px-4 pt-8">
        <nav className="mb-4 flex items-center gap-1 text-sm">
          <Link
            href="/tools/repricer"
            className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Dashboard
          </Link>
          <Link
            href="/tools/repricer/history"
            className="rounded-full bg-sky-500/10 px-3 py-1.5 font-medium text-sky-700 dark:text-sky-300"
          >
            Price History
          </Link>
          <Link
            href="/tools/repricer/sourcing"
            className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Sourcing
          </Link>
        </nav>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight md:text-3xl">
          <LineChart className="h-7 w-7 text-sky-600" />
          Price history
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Monthly market history per SKU — pricing, Buy Box, seller count, and sales volume —
          with your computed profitability floor drawn on the chart so below-floor markets are
          visible at a glance.
        </p>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <HistoryView basePath="/tools/repricer/history" />
      </main>

      <footer className="mt-12 border-t border-slate-200/60 py-5 text-center dark:border-white/10">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ProfitTygr — built by BeaconPath Holdings, LLC © 2026 · DBA RD Consulting
        </p>
      </footer>
    </div>
  )
}
