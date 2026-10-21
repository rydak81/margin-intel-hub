import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { RepricerDashboard } from "@/components/repricer/repricer-dashboard"
import { TygrLogo } from "@/components/repricer/tygr-logo"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { RecommendedTools } from "@/components/recommended-tools"
import { SponsoredToolListing } from "@/components/sponsored-tool-listing"
import { sponsoredListingFor } from "@/lib/sponsored-listing"
import { getRecommendedOffers } from "@/lib/affiliates"

export const metadata: Metadata = {
  alternates: { canonical: "https://marketplacebeta.com/tools/repricer" },
  title: "ProfitTygr | Seller Tools",
  description:
    "Repricing and pricing analysis for optimum margin: compute the lowest price that still hits your target margin per platform and landed cost, then compete only within that band.",
}

export default function RepricerPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="tools" deskLabel="ProfitTygr" backHref="/tools" backLabel="Tools" />

      <section className="relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_18%),linear-gradient(180deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="relative mx-auto site-width px-4 py-10 md:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-white/82 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-sky-300/15 dark:bg-slate-950/60">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span className="text-slate-600 dark:text-slate-200">
              Answer first: <span className="font-semibold text-slate-950 dark:text-white">what's the lowest price that still makes target margin?</span>
            </span>
          </div>
          <h1 className="mt-5 flex items-center gap-3 text-4xl font-black tracking-tight md:text-5xl">
            <TygrLogo className="h-10 w-10" />
            <span>
              Profit
              <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                Tygr
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
              Sample catalog · 77 refurbished-Apple SKUs · anonymized real-market snapshot · importable with your own
            </Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
              Dry-run only — never submits price changes
            </Badge>
          </div>
        </div>
      </section>

      <main className="mx-auto site-width px-4 py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm">
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
        <p className="mb-5 rounded-xl border bg-card p-4 text-sm text-muted-foreground">Historical example data, not live inventory. Fee rates are editable assumptions: verify your actual marketplace charges before making a pricing decision. Costs and settings are saved only in this browser.</p>
        <RepricerDashboard />
        <SponsoredToolListing listing={sponsoredListingFor("repricer")} placement="tools-repricer" className="mt-10" />
        <RecommendedTools offers={getRecommendedOffers({ ids: ["repricer", "helium10", "a2x"] })} placement="tools-repricer" title="Tools that pair with repricing" className="mt-10" />
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
