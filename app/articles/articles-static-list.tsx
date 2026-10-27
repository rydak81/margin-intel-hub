import Link from "next/link"
import type { InitialArticlesData } from "@/lib/articles-initial"

/**
 * Plain server-rendered list. It is the Suspense fallback of the interactive
 * browser below, so it is what lands in the HTML sent to crawlers (and to
 * visitors before the interactive archive hydrates).
 */
export function ArticlesStaticList({ initial }: { initial: InitialArticlesData | null }) {
  return (
    <main className="site-width mx-auto px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Marketplace news archive</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Search the reporting behind the headlines by marketplace, topic and impact. Original analysis lives in{" "}
        <Link className="underline" href="/intelligence/analysis">Intelligence</Link>, and the day&apos;s briefing is on the{" "}
        <Link className="underline" href="/news">News desk</Link>.
      </p>
      {initial ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Latest articles">
          {initial.articles.map(article => (
            <li key={article.id} className="rounded-xl border border-border p-4">
              <h2 className="text-lg font-bold leading-7">
                <Link href={`/news/${article.id}`}>{article.title}</Link>
              </h2>
              {article.summary ? <p className="mt-2 line-clamp-3 text-base text-muted-foreground">{article.summary}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{article.sourceName}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground" role="status">Loading research archive…</p>
      )}
    </main>
  )
}
