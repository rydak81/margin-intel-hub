import type { Metadata } from "next"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { MetricDetail, type Metric } from "@/components/repricer/metric-detail"

export const metadata: Metadata = {
  title: "Chart Analysis | ProfitTygr",
  description:
    "Deep-dive analysis of one metric: interactive history, strategy overlays, data table, and ML sales forecasting with confidence bands.",
}

export default async function RepricerMetricDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ asin: string }>
  searchParams: Promise<{ metric?: string }>
}) {
  const { asin } = await params
  const sp = await searchParams
  const metric: Metric = sp.metric === "sellers" || sp.metric === "sales" ? sp.metric : "price"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader
        active="tools"
        deskLabel="ProfitTygr · Chart Analysis"
        backHref="/tools/repricer/history"
        backLabel="Price History"
      />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <MetricDetail asin={asin} metric={metric} basePath="/tools/repricer/history" />
      </main>
      <footer className="mt-12 border-t border-slate-200/60 py-5 text-center dark:border-white/10">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ProfitTygr — built by BeaconPath Holdings, LLC © 2026 · DBA RD Consulting
        </p>
      </footer>
    </div>
  )
}
