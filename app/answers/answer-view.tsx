import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { BriefCta } from "@/components/brief-cta"
import { JsonLd } from "@/components/json-ld"
import {
  analysisLinksFor,
  answerPath,
  answerTrackingSource,
  formatAnswerDate,
  relatedAnswers,
  type AnswerPage,
  type AnswerSource,
} from "@/lib/answers"
import { briefSignupHref } from "@/lib/brief-cta"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

function sourcesByDate(sources: AnswerSource[]): { date: string; sources: AnswerSource[] }[] {
  const order: string[] = []
  const map = new Map<string, AnswerSource[]>()
  for (const source of sources) {
    if (!map.has(source.checkedOn)) order.push(source.checkedOn)
    const list = map.get(source.checkedOn) ?? []
    list.push(source)
    map.set(source.checkedOn, list)
  }
  return order.map(date => ({ date, sources: map.get(date)! }))
}

export function answerJsonLd(page: AnswerPage) {
  const url = `${SITE_URL}${answerPath(page.slug)}`
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Questions sellers ask", item: `${SITE_URL}/answers` },
        { "@type": "ListItem", position: 2, name: page.question, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: page.question,
          acceptedAnswer: { "@type": "Answer", text: page.directAnswer },
        },
      ],
    },
  ]
}

export function AnswerView({ page }: { page: AnswerPage }) {
  const source = answerTrackingSource(page.slug)
  const analysis = analysisLinksFor(page)
  const related = relatedAnswers(page.slug)
  const groups = sourcesByDate(page.sources)

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={answerJsonLd(page)} />
      <PremiumSiteHeader ctaHref={briefSignupHref(source)} />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <article className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/answers" className="hover:text-sky-600 dark:hover:text-sky-400">Questions sellers ask</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-white">{page.question}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{page.question}</h1>

          <p id="answer" className="mt-4 text-lg leading-relaxed text-slate-800 dark:text-slate-100">{page.directAnswer}</p>

          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {groups.map((group, index) => (
              <span key={group.date}>
                {index > 0 ? " " : null}
                Checked <time dateTime={group.date}>{formatAnswerDate(group.date)}</time> against{" "}
                {group.sources.map((item, sourceIndex) => (
                  <span key={item.url}>
                    {sourceIndex === 0 ? null : group.sources.length === 2 ? " and " : sourceIndex === group.sources.length - 1 ? ", and " : ", "}
                    <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-700 underline underline-offset-2 hover:text-sky-800 dark:text-sky-300">
                      {item.name}
                    </a>
                  </span>
                ))}
                .
              </span>
            ))}
          </p>

          {page.examples.map(example => (
            <section key={example.heading} className="mt-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hypothetical worked example: {example.heading}</h2>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{example.caption}</p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <caption className="bg-slate-50 px-3 py-3 text-left font-semibold text-slate-900 dark:bg-white/5 dark:text-white">Hypothetical. {example.heading}</caption>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th scope="col" className="px-3 py-2">Line</th>
                      <th scope="col" className="px-3 py-2">Amount</th>
                      <th scope="col" className="px-3 py-2">How it is figured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {example.lines.map(row => (
                      <tr key={row.label} className="border-b border-slate-200 last:border-0 even:bg-slate-50/70 dark:border-white/10 dark:even:bg-white/5">
                        <th scope="row" className="px-3 py-2 font-medium text-slate-900 dark:text-white">{row.label}</th>
                        <td className="px-3 py-2 tabular-nums text-slate-800 dark:text-slate-100">{row.value}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What to check this week</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
              {page.checks.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fee tables</h2>
            <ul className="mt-4 space-y-3">
              {page.feeLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800 dark:text-sky-300">{link.label}</Link>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{link.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {analysis.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related analysis</h2>
              <ul className="mt-4 space-y-3">
                {analysis.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800 dark:text-sky-300">{link.label}</Link>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{link.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related answers</h2>
            <ul className="mt-4 space-y-3">
              {related.map(item => (
                <li key={item.slug}>
                  <Link href={answerPath(item.slug)} className="font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800 dark:text-sky-300">{item.question}</Link>
                </li>
              ))}
            </ul>
          </section>

          <BriefCta source={source} />
        </article>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
