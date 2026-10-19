import type { Metadata } from "next"
import Link from "next/link"
import { EditorialIntro } from "@/components/editorial-intro"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { MARKETPLACES } from "@/lib/marketplace-fees"
import { getAllPairs, rateRange } from "@/lib/fee-compare"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

// The year in the title is a CTR asset on data queries, but a purely static
// build would freeze it at deploy time — regenerate daily so it rolls over.
export const revalidate = 86400

const title = `Marketplace Seller Fees ${new Date().getFullYear()}: Amazon, Walmart, TikTok Shop, eBay & Etsy`
const description =
  "Compare seller fees across every major marketplace. Category-by-category referral rates, a free margin calculator, and supported category comparisons with explicit assumptions."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/fees` },
  openGraph: { title, description, url: `${SITE_URL}/fees`, type: "website" },
}

const FEATURED_COMPARE_SLUGS = [
  "amazon-vs-walmart",
  "amazon-vs-etsy",
  "amazon-vs-ebay",
  "amazon-vs-tiktok-shop",
] as const

const POPULAR_CATEGORIES = [
  { href: "/fees/amazon/clothing-accessories", label: "Amazon Clothing & Accessories" },
  { href: "/fees/amazon/beauty", label: "Amazon Beauty" },
  { href: "/fees/amazon/home-garden", label: "Amazon Home & Garden" },
  { href: "/fees/etsy/handmade", label: "Etsy Handmade" },
] as const

export default function FeesIndexPage() {
  const totalCategories = MARKETPLACES.reduce((sum, m) => sum + m.categories.length, 0)
  const pairs = getAllPairs()
  const featuredPairs = FEATURED_COMPARE_SLUGS.map((slug) => pairs.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  )

  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="fees" />

      <main className="mx-auto site-width px-4 py-10 sm:px-6 lg:px-8">
        <EditorialIntro eyebrow="Fee intelligence" title="Know what you keep." description={`Compare referral rates across ${totalCategories} categories and ${MARKETPLACES.length} marketplaces. Model unit economics, inspect the source dates, and test your assumptions before choosing a channel.`} />
        <p className="mt-4 text-sm text-muted-foreground">Rates change. See the <Link href="/fees/changelog" className="font-medium text-primary underline underline-offset-4">dated fee change log</Link> for every update, with old and new figures. Or jump to <Link href="/fees/compare" className="font-medium text-primary underline underline-offset-4">side-by-side marketplace comparisons</Link>.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {MARKETPLACES.map((marketplace) => {
            const rates = marketplace.categories.map((c) => c.referralPct)
            return (
              <Link
                key={marketplace.slug}
                href={`/fees/${marketplace.slug}`}
                className="editorial-elevated editorial-lift bg-card block rounded-2xl border border-slate-200 p-6 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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

        <section className="mt-12" aria-labelledby="compare-fees-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="compare-fees-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                Compare marketplace fees
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Side-by-side schedules for the pairs operators search most.
              </p>
            </div>
            <Link href="/fees/compare" className="text-sm font-semibold text-primary">
              All {pairs.length} comparisons →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {featuredPairs.map((pair) => {
              const ra = rateRange(pair.a)
              const rb = rateRange(pair.b)
              const fmt = (r: { min: number; max: number }) =>
                r.min === r.max ? `${r.min}%` : `${r.min}%–${r.max}%`
              return (
                <Link
                  key={pair.slug}
                  href={`/fees/compare/${pair.slug}`}
                  className="rounded-xl border border-border bg-card p-4 transition hover:border-sky-400"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {pair.a.shortName} vs {pair.b.shortName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fmt(ra)} vs {fmt(rb)} commission range
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="popular-categories-title">
          <h2 id="popular-categories-title" className="text-2xl font-bold text-slate-900 dark:text-white">
            Popular category fee pages
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-sky-400"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
