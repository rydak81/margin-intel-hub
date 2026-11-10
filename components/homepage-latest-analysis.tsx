import Link from 'next/link'
import type { HomepageAnalysisCard } from '@/lib/homepage-latest'

/** Newest original analysis, linked from the homepage. */
export function HomepageLatestAnalysis({ articles }: { articles: HomepageAnalysisCard[] }) {
  if (articles.length === 0) return null
  return (
    <section className="border-b border-border bg-background" aria-labelledby="homepage-latest-analysis">
      <div className="mx-auto site-width px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="editorial-eyebrow">Original analysis</p>
            <h2 id="homepage-latest-analysis" className="mt-2 text-2xl font-bold">Latest analysis</h2>
          </div>
          <Link href="/intelligence/analysis" className="text-sm font-bold text-primary">All analysis →</Link>
        </div>
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {articles.map(article => (
            <li key={article.slug}>
              <Link href={article.href} className="editorial-elevated editorial-lift block h-full rounded-xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <time dateTime={article.date}>{article.dateLabel}</time>
                </p>
                <p className="mt-3 text-lg font-bold leading-snug">{article.title}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.summary}</p>
                <p className="mt-4 text-sm font-bold text-primary">Read the analysis →</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
