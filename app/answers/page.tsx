import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { BriefCta } from "@/components/brief-cta"
import { JsonLd } from "@/components/json-ld"
import { briefSignupHref } from "@/lib/brief-cta"
import {
  ANSWER_PAGES,
  ANSWERS_PATH,
  CHECKED_ON,
  CHECKED_ON_2026_11_20,
  JOB_GROUPS,
  MARKETPLACE_GROUPS,
  answerPath,
  answerTrackingSource,
  answersIn,
  formatAnswerDate,
} from "@/lib/answers"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
const CANONICAL = `${SITE_URL}${ANSWERS_PATH}`
const TITLE = "Questions sellers ask"
const DESCRIPTION = "Direct answers on Etsy, Amazon, Walmart, TikTok Shop, and eBay fees, each with the source and a worked example."
const HUB_SOURCE = answerTrackingSource("index")

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

function AnswerCard({ slug }: { slug: string }) {
  const page = ANSWER_PAGES.find(item => item.slug === slug)!
  return (
    <li className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
        <Link href={answerPath(page.slug)} className="underline decoration-sky-400/60 underline-offset-4 hover:decoration-sky-600">{page.question}</Link>
      </h4>
      <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{page.directAnswer}</p>
    </li>
  )
}

export default function AnswersIndexPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Questions sellers ask", item: CANONICAL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ANSWER_PAGES.map(page => ({
        "@type": "Question",
        name: page.question,
        acceptedAnswer: { "@type": "Answer", text: page.directAnswer },
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader ctaHref={briefSignupHref(HUB_SOURCE)} />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Questions sellers ask</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Questions sellers ask</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          Short answers to fee, storage, and ads questions, each with the marketplace&apos;s own source and a hypothetical worked example. The first six answers were checked <time dateTime={CHECKED_ON}>{formatAnswerDate(CHECKED_ON)}</time>. Walmart, TikTok Shop, and the Etsy sale answer were checked <time dateTime={CHECKED_ON_2026_11_20}>{formatAnswerDate(CHECKED_ON_2026_11_20)}</time>. The Amazon size-tier fulfillment dollars on the sale page were read October 21, 2026.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">By marketplace</h2>
          <div className="mt-4 grid gap-8 lg:grid-cols-3">
            {MARKETPLACE_GROUPS.map(group => (
              <div key={group.key}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{group.label}</h3>
                <ul className="mt-3 space-y-3">
                  {answersIn({ marketplace: group.key }).map(page => <AnswerCard key={page.slug} slug={page.slug} />)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">By job</h2>
          <div className="mt-4 space-y-8">
            {JOB_GROUPS.map(group => (
              <div key={group.key}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{group.label}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.blurb}</p>
                <ul className="mt-3 grid gap-3 md:grid-cols-2">
                  {answersIn({ job: group.key }).map(page => <AnswerCard key={page.slug} slug={page.slug} />)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          Category rates for the same marketplaces are on the <Link href="/fees" className="font-medium text-sky-700 underline underline-offset-4 dark:text-sky-300">fee tables</Link>.
        </p>

        <BriefCta source={HUB_SOURCE} className="mt-10 max-w-3xl" />
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
