import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { MARKETPLACES } from "@/lib/marketplace-fees"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

const title = `Marketplace Seller Fees ${new Date().getFullYear()}: Amazon, Walmart, TikTok Shop, eBay & Etsy`
const description =
  "Compare seller fees across every major marketplace. Category-by-category referral rates, a free margin calculator, and side-by-side unit economics for the same product on all five platforms."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/fees` },
  openGraph: { title, description, url: `${SITE_URL}/fees`, type: "website" },
}

export default function FeesIndexPage() {
  const totalCategories = MARKETPLACES.reduce((sum, m) => sum + m.categories.length, 0)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PremiumSiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Marketplace seller fees
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          Referral rates for {totalCategories} categories across {MARKETPLACES.length} marketplaces,
          each with a margin calculator that shows what you actually keep — and what the same product
          would earn everywhere else.
        </p>

        <div className="mt-8 space-y-4">
          {MARKETPLACES.map((marketplace) => {
            const rates = marketplace.categories.map((c) => c.referralPct)
            return (
              <Link
                key={marketplace.slug}
                href={`/fees/${marketplace.slug}`}
                className="block rounded-2xl border border-slate-200 p-6 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {marketplace.name}
                  </h2>
                  <span className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                    {Math.min(...rates)}%–{Math.max(...rates)}%
                  </span>
                </div>
                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                  {marketplace.summary}
                </p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {marketplace.categories.length} categories
                  {marketplace.fulfillmentName ? ` · ${marketplace.fulfillmentName}` : ""}
                </p>
              </Link>
            )
          })}
        </div>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
