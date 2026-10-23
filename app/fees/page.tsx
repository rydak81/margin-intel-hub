import type { Metadata } from "next"
import Link from "next/link"
import { EditorialIntro } from "@/components/editorial-intro"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { MARKETPLACES } from "@/lib/marketplace-fees"
import { TIKTOK_FEE_CHANGE_PATH } from "@/lib/tiktok-fee-change-2026"

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

export default function FeesIndexPage() {
  const totalCategories = MARKETPLACES.reduce((sum, m) => sum + m.categories.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="fees" />

      <main className="mx-auto site-width px-4 py-10 sm:px-6 lg:px-8">
        <EditorialIntro eyebrow="Fee intelligence" title="Know what you keep." description={`Compare referral rates across ${totalCategories} categories and ${MARKETPLACES.length} marketplaces. Model unit economics, inspect the source dates, and test your assumptions before choosing a channel.`} />
        <p className="mt-4 text-sm text-muted-foreground">Rates change. See the <Link href="/fees/changelog" className="font-medium text-primary underline underline-offset-4">dated fee change log</Link> for every update, with old and new figures.</p>
        <p className="mt-2 text-sm text-muted-foreground">Heard TikTok Shop went to 8%? <Link href={TIKTOK_FEE_CHANGE_PATH} className="font-medium text-primary underline underline-offset-4">What&apos;s confirmed about the 2026 TikTok Shop fee change, and how to check your settlement statement</Link>.</p>

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
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
