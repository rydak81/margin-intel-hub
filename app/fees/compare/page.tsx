import type { Metadata } from 'next'
import Link from 'next/link'
import { EditorialIntro } from '@/components/editorial-intro'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { EXAMPLE_PRICE, getAllPairs, matchedCategories, money, rateRange } from '@/lib/fee-compare'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

export const revalidate = 86400

const title = `Compare Marketplace Seller Fees ${new Date().getFullYear()}: Amazon vs Walmart, Etsy, eBay & TikTok Shop`
const description =
  'Side-by-side seller fee comparisons across Amazon, Walmart, TikTok Shop, eBay and Etsy. Commission ranges, account fees, and verified category mappings from the same dataset as our fee tables.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/fees/compare` },
  openGraph: { title, description, url: `${SITE_URL}/fees/compare`, type: 'website' },
}

/** Highest-search Amazon pair slugs, shown first for discovery. */
const FEATURED_SLUGS = [
  'amazon-vs-walmart',
  'amazon-vs-etsy',
  'amazon-vs-ebay',
  'amazon-vs-tiktok-shop',
] as const

function rangeLabel(min: number, max: number) {
  return min === max ? `${min}%` : `${min}%–${max}%`
}

export default function FeesCompareHubPage() {
  const pairs = getAllPairs()
  const featured = FEATURED_SLUGS.map((slug) => pairs.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  )
  const rest = pairs.filter((p) => !FEATURED_SLUGS.includes(p.slug as (typeof FEATURED_SLUGS)[number]))

  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="fees" backHref="/fees" backLabel="Fees" />

      <main className="mx-auto site-width px-4 py-10 sm:px-6 lg:px-8">
        <EditorialIntro
          eyebrow="Fee comparisons"
          title="Pick a marketplace pair."
          description={`Every side-by-side seller fee comparison we publish — ${pairs.length} pairs across Amazon, Walmart, TikTok Shop, eBay and Etsy. Rates and modeled totals come from the same verified fee tables as our calculators.`}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Prefer a single marketplace? Browse the{' '}
          <Link href="/fees" className="font-medium text-primary underline underline-offset-4">
            fee tables hub
          </Link>{' '}
          or the{' '}
          <Link href="/fees/changelog" className="font-medium text-primary underline underline-offset-4">
            dated fee change log
          </Link>
          .
        </p>

        <section className="mt-10" aria-labelledby="featured-comparisons-title">
          <h2 id="featured-comparisons-title" className="text-2xl font-bold text-slate-900 dark:text-white">
            Popular Amazon comparisons
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Highest-interest pairs for operators deciding where to list first.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {featured.map((pair) => {
              const ra = rateRange(pair.a)
              const rb = rateRange(pair.b)
              const matched = matchedCategories(pair.a, pair.b).length
              return (
                <Link
                  key={pair.slug}
                  href={`/fees/compare/${pair.slug}`}
                  className="editorial-elevated editorial-lift bg-card block rounded-2xl border border-slate-200 p-6 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/5"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {pair.a.shortName} vs {pair.b.shortName}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {pair.a.shortName} {pair.a.feeName}: {rangeLabel(ra.min, ra.max)}. {pair.b.shortName}{' '}
                    {pair.b.feeName}: {rangeLabel(rb.min, rb.max)}.
                  </p>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {matched > 0
                      ? `${matched} verified category rows · modeled fees on a ${money(EXAMPLE_PRICE)} sale`
                      : 'Schedule overview · no verified same-product category mapping'}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="all-comparisons-title">
          <h2 id="all-comparisons-title" className="text-2xl font-bold text-slate-900 dark:text-white">
            All marketplace fee comparisons
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {pairs.map((pair) => (
              <Link
                key={pair.slug}
                href={`/fees/compare/${pair.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-sky-400"
              >
                {pair.a.shortName} vs {pair.b.shortName}
              </Link>
            ))}
          </div>
          {rest.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Including non-Amazon pairs such as{' '}
              {rest.slice(0, 3).map((p, i) => (
                <span key={p.slug}>
                  {i > 0 ? ', ' : ''}
                  <Link href={`/fees/compare/${p.slug}`} className="font-medium text-primary underline underline-offset-4">
                    {p.a.shortName} vs {p.b.shortName}
                  </Link>
                </span>
              ))}
              {rest.length > 3 ? ', and more.' : '.'}
            </p>
          )}
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
