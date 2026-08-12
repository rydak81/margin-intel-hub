import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { FeeCalculator } from "@/components/fee-calculator"
import {
  formatVerifiedDate,
  getAllFeeRoutes,
  getCategory,
  getComparableCategories,
  getMarketplace,
} from "@/lib/marketplace-fees"
import { ArrowUpRight, ExternalLink } from "lucide-react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

interface PageProps {
  params: Promise<{ marketplace: string; category: string }>
}

export function generateStaticParams() {
  return getAllFeeRoutes()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marketplace: marketplaceSlug, category: categorySlug } = await params
  const marketplace = getMarketplace(marketplaceSlug)
  const category = getCategory(marketplaceSlug, categorySlug)

  if (!marketplace || !category) {
    return { title: "Fee not found | MarketplaceBeta" }
  }

  const verified = formatVerifiedDate(marketplace.lastVerified)
  const feeLabel = marketplace.feeName.replace(/\b\w/g, (c) => c.toUpperCase())
  // The date in the title is a real CTR lever on data queries — searchers scan
  // for recency before they click.
  const title = `${marketplace.shortName} ${feeLabel} for ${category.label}: ${category.referralPct}% (${verified})`
  const description = `${marketplace.name} charges a ${category.referralPct}% ${marketplace.feeName} on ${category.label}. See the full fee breakdown, calculate your margin, and compare the same product across Amazon, Walmart, TikTok Shop, eBay, and Etsy.`
  const canonical = `${SITE_URL}/fees/${marketplace.slug}/${category.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function FeeCategoryPage({ params }: PageProps) {
  const { marketplace: marketplaceSlug, category: categorySlug } = await params
  const marketplace = getMarketplace(marketplaceSlug)
  const category = getCategory(marketplaceSlug, categorySlug)

  if (!marketplace || !category) {
    notFound()
  }

  const verified = formatVerifiedDate(marketplace.lastVerified)
  const comparable = getComparableCategories(marketplace.slug, category.label)
  const canonical = `${SITE_URL}/fees/${marketplace.slug}/${category.slug}`

  const faqs = [
    {
      question: `What is the ${marketplace.shortName} ${marketplace.feeName} for ${category.label}?`,
      answer: `${marketplace.name} charges a ${category.referralPct}% ${marketplace.feeName} on ${category.label} sales.${
        category.note ? ` ${category.note}` : ""
      } The fee is calculated on the total sale price.`,
    },
    {
      question: `How much do I keep on a $29.99 ${category.label} sale on ${marketplace.shortName}?`,
      answer: `At a ${category.referralPct}% ${marketplace.feeName}, a $29.99 sale incurs roughly $${(
        29.99 *
        (category.referralPct / 100)
      ).toFixed(2)} in ${marketplace.feeName}s, leaving about $${(
        29.99 -
        29.99 * (category.referralPct / 100)
      ).toFixed(2)} before your product cost and any fulfillment fees.`,
    },
    ...(marketplace.fulfillmentName
      ? [
          {
            question: `Does the ${marketplace.feeName} include ${marketplace.fulfillmentName} fees?`,
            answer: `No. The ${category.referralPct}% ${marketplace.feeName} is separate from ${marketplace.fulfillmentName} fulfillment and storage fees, which are charged based on the size and weight of your product.`,
          },
        ]
      : []),
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Fees", item: `${SITE_URL}/fees` },
          {
            "@type": "ListItem",
            position: 2,
            name: marketplace.name,
            item: `${SITE_URL}/fees/${marketplace.slug}`,
          },
          { "@type": "ListItem", position: 3, name: category.label, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PremiumSiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/fees" className="hover:text-sky-600 dark:hover:text-sky-400">
            Fees
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/fees/${marketplace.slug}`}
            className="hover:text-sky-600 dark:hover:text-sky-400"
          >
            {marketplace.shortName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">{category.label}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {marketplace.shortName} {marketplace.feeName} for {category.label}
        </h1>

        {/* The answer, above the fold, in the first sentence. This is the whole
            reason the page ranks — burying it costs the position. */}
        <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          {marketplace.name} charges a{" "}
          <strong className="text-slate-900 dark:text-white">
            {category.referralPct}% {marketplace.feeName}
          </strong>{" "}
          on {category.label} sales, calculated on the total sale price.
          {category.note ? ` ${category.note}` : ""}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Verified {verified}</span>
          <a
            href={marketplace.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400"
          >
            Official {marketplace.shortName} fee schedule
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
          {marketplace.summary}
        </p>

        <div className="mt-8">
          <FeeCalculator marketplace={marketplace} category={category} />
        </div>

        {comparable.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {category.label} fees on other marketplaces
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {comparable.map(({ marketplace: other, category: otherCategory }) => {
                const delta = otherCategory.referralPct - category.referralPct
                return (
                  <Link
                    key={other.slug}
                    href={`/fees/${other.slug}/${otherCategory.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/5"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{other.shortName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {otherCategory.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {otherCategory.referralPct}%
                      </p>
                      {delta !== 0 && (
                        <p
                          className={`text-xs ${
                            delta < 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {delta < 0 ? "" : "+"}
                          {delta.toFixed(2).replace(/\.?0+$/, "")} pts
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Common questions
          </h2>
          <dl className="mt-4 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-slate-900 dark:text-white">{faq.question}</dt>
                <dd className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            All {marketplace.shortName} categories
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {marketplace.categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/fees/${marketplace.slug}/${c.slug}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-300"
                >
                  {c.label}{" "}
                  <span className="text-slate-400 dark:text-slate-500">{c.referralPct}%</span>
                </Link>
              ))}
          </div>
          <Link
            href={`/fees/${marketplace.slug}`}
            className="mt-5 inline-flex items-center gap-1.5 font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Full {marketplace.shortName} fee table
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
