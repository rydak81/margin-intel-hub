import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { BriefCta } from "@/components/brief-cta"
import { BRIEF_CTA_KEYS } from "@/lib/brief-cta"
import { MARKETPLACES, orderFeeLabel, formatVerifiedDate, getMarketplace } from "@/lib/marketplace-fees"
import { ExternalLink } from "lucide-react"
import { AMAZON_PEAK_PATH } from "@/lib/amazon-holiday-peak-2026"
import { JsonLd } from "@/components/json-ld"
import { TIKTOK_FEE_CHANGE_PATH } from "@/lib/tiktok-fee-change-2026"
import { feeFaq, feeShortAnswer } from "@/lib/fee-short-answer"
import { ORGANIZATION_REF } from "@/lib/site-jsonld"
import { FeeRelatedLinks } from "@/components/related-links"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

// Titles embed the current year — regenerate daily so it rolls over instead
// of freezing at deploy time.
export const revalidate = 86400

interface PageProps {
  params: Promise<{ marketplace: string }>
}

export function generateStaticParams() {
  return MARKETPLACES.map((m) => ({ marketplace: m.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marketplace: slug } = await params
  const marketplace = getMarketplace(slug)

  if (!marketplace) return { title: "Marketplace not found | MarketplaceBeta" }

  const verified = formatVerifiedDate(marketplace.lastVerified)
  const title = `${marketplace.name} Fees ${new Date().getFullYear()}: Every Category (${verified})`
  const description = `Complete ${marketplace.name} ${marketplace.feeName} table for all ${marketplace.categories.length} categories, plus a margin calculator. Updated ${verified}.`
  const canonical = `${SITE_URL}/fees/${marketplace.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  }
}

export default async function MarketplaceFeesPage({ params }: PageProps) {
  const { marketplace: slug } = await params
  const marketplace = getMarketplace(slug)

  if (!marketplace) notFound()

  const verified = formatVerifiedDate(marketplace.lastVerified)
  const pageUrl = `${SITE_URL}/fees/${marketplace.slug}`
  const shortAnswer = feeShortAnswer(marketplace)
  const faq = feeFaq(marketplace)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Fees", item: `${SITE_URL}/fees` },
        { "@type": "ListItem", position: 3, name: `${marketplace.name} fees`, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${marketplace.name} seller ${marketplace.feeName}s by category`,
      description: `${marketplace.name} ${marketplace.feeName} for each of ${marketplace.categories.length} seller categories, checked against the marketplace's published fee schedule on ${verified}.`,
      url: pageUrl,
      dateModified: marketplace.lastVerified,
      creator: ORGANIZATION_REF,
      isAccessibleForFree: true,
      keywords: [`${marketplace.name} fees`, `${marketplace.name} ${marketplace.feeName}`, "marketplace seller fees", "ecommerce referral fees"],
      variableMeasured: `${marketplace.feeName} (percent of sale price)`,
      isBasedOn: marketplace.sourceUrl,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/fees" className="hover:text-sky-600 dark:hover:text-sky-400">
            Fees
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">{marketplace.shortName}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {marketplace.name} fees by category
        </h1>

        <p id="short-answer" className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          {shortAnswer}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Verified {verified}</span>
          <a
            href={marketplace.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400"
          >
            Official fee schedule
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
          {marketplace.summary}
        </p>

        {marketplace.slug === "tiktok-shop" && (
          <p className="mt-3 text-sm">
            <Link href={TIKTOK_FEE_CHANGE_PATH} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">
              6% or 8%? What&apos;s confirmed about the 2026 TikTok Shop fee change, and how to check your settlement statement
            </Link>
          </p>
        )}

        {(marketplace.accountFee || marketplace.perOrderFee || marketplace.listingFee) && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Charged on top of the {marketplace.feeName}
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {marketplace.accountFee && (
                <li>
                  ${marketplace.accountFee.amount.toFixed(2)} per {marketplace.accountFee.period}
                  {marketplace.accountFee.note ? ` — ${marketplace.accountFee.note}` : ""}
                </li>
              )}
              {marketplace.perOrderFee && (
                <li>{orderFeeLabel(marketplace)}</li>
              )}
              {marketplace.listingFee && (
                <li>${marketplace.listingFee.toFixed(2)} per listing</li>
              )}
              {marketplace.paymentProcessingPct && (
                <li>
                  {marketplace.paymentProcessingPct}% payment processing
                  {marketplace.paymentProcessingFlat
                    ? ` + $${marketplace.paymentProcessingFlat.toFixed(2)}`
                    : ""}
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Category
                </th>
                <th className="pb-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
                  {marketplace.feeName.replace(/\b\w/g, (c) => c.toUpperCase())}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {marketplace.categories.map((category) => (
                <tr key={category.slug} className="group">
                  <td className="py-3">
                    <Link
                      href={`/fees/${marketplace.slug}/${category.slug}`}
                      className="font-medium text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400"
                    >
                      {category.label}
                    </Link>
                    {category.note && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {category.note}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right align-top text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
                    {category.referralPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {marketplace.slug === "amazon" && (
          <p className="mt-6 text-sm">
            <Link href={AMAZON_PEAK_PATH} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">
              FBA holiday peak fees (Oct 15, 2026 to Jan 14, 2027) and the 3.5% surcharge, by size tier with worked examples
            </Link>
          </p>
        )}

        <section id="faq" className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {marketplace.name} fees: frequently asked questions
          </h2>
          <dl className="mt-4 space-y-5">
            {faq.map((f) => (
              <div key={f.question}>
                <dt className="font-semibold text-slate-900 dark:text-white">{f.question}</dt>
                <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Compare other marketplaces
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MARKETPLACES.filter((m) => m.slug !== marketplace.slug).map((other) => (
              <Link
                key={other.slug}
                href={`/fees/${other.slug}`}
                className="editorial-elevated editorial-lift bg-card rounded-xl border border-slate-200 p-4 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/5"
              >
                <p className="font-medium text-slate-900 dark:text-white">{other.name}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {Math.min(...other.categories.map((c) => c.referralPct))}%–
                  {Math.max(...other.categories.map((c) => c.referralPct))}% across{" "}
                  {other.categories.length} categories
                </p>
              </Link>
            ))}
          </div>
        </section>

        <FeeRelatedLinks marketplace={marketplace} />

        <BriefCta source={BRIEF_CTA_KEYS.feeMarketplace(marketplace.slug)} heading={`Know when ${marketplace.shortName} fees move`} />
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
