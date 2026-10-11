import { notFound } from "next/navigation"
import { SEED_CATALOG } from "@/lib/repricer/catalog"
import type { Metadata } from "next"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { MetricDetail, type Metric } from "@/components/repricer/metric-detail"

export const metadata: Metadata = {
  title: "Chart Analysis | ProfitTygr",
  robots: { index: false, follow: true },
  description:
    "Deep-dive analysis of one metric: interactive history, strategy overlays, data table, and transparent data-quality labels.",
}

export default async function RepricerMetricDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ asin: string }>
  searchParams: Promise<{ metric?: string }>
}) {
  const { asin } = await params
  if (!SEED_CATALOG.some(item => item.asin === asin)) notFound()
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
      <main className="mx-auto site-width px-4 py-6">
        <MetricDetail asin={asin} metric={metric} basePath="/tools/repricer/history" />
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
