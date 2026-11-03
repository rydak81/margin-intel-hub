import Link from 'next/link'
import type { IntelligenceSnapshot } from '@/lib/intelligence'
import { safeSourceUrl } from '@/lib/intelligence'
import { selectAiCommerceNews } from '@/lib/ai-news'

export function AiNews({ snapshot }: { snapshot: IntelligenceSnapshot }) {
  const stories = selectAiCommerceNews(snapshot.articles, Date.parse(snapshot.checkedAt))
  return (
    <section id="ai-news" aria-labelledby="ai-news-title" className="scroll-mt-44 border-t border-border py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="editorial-eyebrow">AI & ecommerce / News watch</p><h2 id="ai-news-title" className="mt-3 text-3xl font-bold sm:text-4xl">What changed. What to check.</h2></div>
        <Link href="/intelligence?q=AI&days=30" className="font-semibold text-primary">Explore the archive →</Link>
      </div>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Reports from the last 30 days matching both AI and ecommerce terms in our curated archive. Selection is automated; these headlines are reporting, not proof of business results.</p>
      {stories.length > 0 ? <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{stories.map(story => {
        const source = safeSourceUrl(story.sourceUrl)
        return <article key={story.id} className="editorial-elevated rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground">{story.sourceName} · <time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></p>
          <h3 className="mt-4 text-xl font-bold leading-snug"><Link href={`/news/${story.id}`} className="hover:text-primary">{story.title}</Link></h3>
          <p className="mt-4 line-clamp-4 leading-7 text-muted-foreground">{story.summary}</p>
          <p className="mt-5 rounded-lg bg-secondary/60 p-4 text-sm leading-6"><strong>Operator check:</strong> Verify availability, required data, and review controls before testing this in your business.</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold"><Link href={`/news/${story.id}`} className="text-primary">Read the context →</Link>{source && <a href={source} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">Original source ↗</a>}</div>
        </article>
      })}</div> : <div className="mt-7 rounded-2xl border border-dashed border-border bg-card p-6"><p className="font-semibold">{snapshot.status === 'unavailable' ? 'News is temporarily unavailable.' : 'No matching recent reports in this archive sample.'}</p><p className="mt-2 leading-7 text-muted-foreground">The playbooks below are available to use. Missing coverage does not mean there were no developments.</p></div>}
      <p className="mt-5 text-xs leading-6 text-muted-foreground">Archive check: <time dateTime={snapshot.checkedAt}>{new Date(snapshot.checkedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</time>. Up to 500 recent archive records are considered; this is not an exhaustive news feed.</p>
    </section>
  )
}
