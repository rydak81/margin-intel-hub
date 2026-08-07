import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { RepricerDashboard } from "@/components/repricer/repricer-dashboard"
import { Badge } from "@/components/ui/badge"
import { Scale, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Margin-Aware Repricer | Seller Tools",
  description:
    "Repricing and pricing analysis for optimum margin: compute the lowest price that still hits your target margin per platform and landed cost, then compete only within that band.",
}

export default function RepricerPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="tools" deskLabel="Margin-Aware Repricer" backHref="/tools" backLabel="Tools" />

      <section className="relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_18%),linear-gradient(180deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-white/82 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-sky-300/15 dark:bg-slate-950/60">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span className="text-slate-600 dark:text-slate-200">
              Answer first: <span className="font-semibold text-slate-950 dark:text-white">what's the lowest price that still makes target margin?</span>
            </span>
          </div>
          <h1 className="mt-5 flex items-center gap-3 text-4xl font-black tracking-tight md:text-5xl">
            <Scale className="h-9 w-9 text-sky-600" />
            <span>
              Margin-Aware{" "}
              <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                Repricer
              </span>
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700 dark:text-slate-300">
            Solve price from margin — floor, target, and ceiling per SKU from landed cost and each
            platform's fee schedule — then compete on price only within the band the math allows.
            When the market drops below your floor, the engine says hold, not chase.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="border-sky-400/30 text-sky-700 dark:text-sky-300">
              Seeded: Powered by Tek · 77 Amazon Renewed SKUs · 2026-08-05 audit
            </Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
              Dry-run only — never submits price changes
            </Badge>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-sm">
          <Link
            href="/tools/repricer"
            className="rounded-full bg-sky-500/10 px-3 py-1.5 font-medium text-sky-700 dark:text-sky-300"
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
            className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Sourcing
          </Link>
        </nav>
        <RepricerDashboard />
      </main>

      <footer className="mt-12 border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))] py-8 text-center text-sm text-white/52">
        Fee rates are placeholders and must be verified against current marketplace schedules.
        All prices computed here are estimates for analysis, not live repricing instructions.
      </footer>
    </div>
  )
}
