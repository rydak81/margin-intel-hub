import { ORGANIZATION_REF } from '@/lib/site-jsonld'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronRight, ExternalLink, Globe, Lightbulb } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { ManufacturingCover } from '@/components/manufacturing-cover'
import { paragraphizeArticleContent } from '@/lib/article-content'
import { loadManufacturingSnapshot } from '@/lib/manufacturing-data'
import {
  MANUFACTURING_PROMPTS,
  MANUFACTURING_SOURCES,
  findManufacturingStory,
  manufacturingFallbackCover,
  type ManufacturingStory,
} from '@/lib/manufacturing'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const snapshot = await loadManufacturingSnapshot()
  const story = findManufacturingStory(snapshot.stories, slug)
  if (!story) return { title: 'Report unavailable | MarketplaceBeta', robots: { index: false } }
  const description = story.excerpt || `${story.topic} report from ${story.sourceName}, with operator context from the MarketplaceBeta manufacturing desk.`
  return {
    title: `${story.title} | MarketplaceBeta`,
    description,
    alternates: { canonical: `${SITE_URL}/desktop-manufacturing/story/${story.slug}` },
    openGraph: {
      title: story.title,
      description,
      url: `${SITE_URL}/desktop-manufacturing/story/${story.slug}`,
      type: 'article',
      images: [story.imageUrl || `${SITE_URL}${manufacturingFallbackCover(story.process)}`],
    },
  }
}

function relatedStories(stories: ManufacturingStory[], story: ManufacturingStory): ManufacturingStory[] {
  const siblings = stories.filter((candidate) => candidate.slug !== story.slug)
  const sameTopic = siblings.filter((candidate) => candidate.topic === story.topic || candidate.process === story.process)
  return (sameTopic.length >= 2 ? sameTopic : siblings).slice(0, 4)
}

export default async function ManufacturingStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const snapshot = await loadManufacturingSnapshot()
  const story = findManufacturingStory(snapshot.stories, slug)

  if (!story) {
    // Stories roll out of the snapshot's 90-day window; expired links get a
    // graceful landing instead of a bare 404.
    return (
      <div className="min-h-screen bg-background">
        <PremiumSiteHeader active="manufacturing" deskLabel="Manufacturing Desk" backHref="/desktop-manufacturing" backLabel="Manufacturing Desk" />
        <main className="mx-auto site-width px-4 py-16 sm:px-6">
          <div className="editorial-elevated mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center">
            <p className="editorial-eyebrow">Manufacturing desk</p>
            <h1 className="mt-4 text-3xl font-bold">This report is no longer on the desk.</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Briefs stay available while a report is inside the desk&rsquo;s 90-day coverage window. This one has aged out
              or the link is incomplete — the newest coverage is one click away.
            </p>
            <Link href="/desktop-manufacturing#manufacturing-news" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />Back to the latest reports
            </Link>
          </div>
        </main>
        <PremiumSiteFooter />
      </div>
    )
  }

  const source = MANUFACTURING_SOURCES.find((candidate) => candidate.id === story.sourceId)
  const related = relatedStories(snapshot.stories, story)
  const bodyBlocks = story.body ? paragraphizeArticleContent(story.body, story.title) : []
  const storyUrl = `${SITE_URL}/desktop-manufacturing/story/${story.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: story.title,
    datePublished: story.publishedAt,
    dateModified: story.publishedAt,
    image: [story.imageUrl || `${SITE_URL}${manufacturingFallbackCover(story.process)}`],
    mainEntityOfPage: storyUrl,
    isBasedOn: story.url,
    publisher: ORGANIZATION_REF,
    author: { '@type': 'Organization', name: story.sourceName },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Escape "<" so feed-derived values (title, image URL) can never close the
          script element and inject markup via dangerouslySetInnerHTML. */}
      <Script id={`manufacturing-story-jsonld-${story.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PremiumSiteHeader active="manufacturing" deskLabel="Manufacturing Desk" backHref="/desktop-manufacturing" backLabel="Manufacturing Desk" />

      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-md bg-blue-500/10 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-200">{story.topic}</span>
              <span className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-bold text-muted-foreground">{story.process}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
              </span>
            </div>

            <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-5xl">{story.title}</h1>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />Reported by <span className="font-semibold text-foreground">{story.sourceName}</span> · {story.sourceKind}
            </p>

            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-slate-950">
              <ManufacturingCover src={story.imageUrl} process={story.process} alt={story.title} className="absolute inset-0 h-full w-full object-cover" eager />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {story.imageUrl ? `Image from the ${story.sourceName} feed.` : 'MarketplaceBeta desk cover — the publisher feed provided no image.'}
            </p>

            {bodyBlocks.length > 0 ? (
              <section className="mt-10">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">{story.bodySummary ? 'From the report' : 'Full coverage'}</h2>
                </div>
                <div className="editorial-elevated rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10">
                  <div className="mx-auto max-w-3xl space-y-6">
                    {bodyBlocks.map((block, index) =>
                      block.type === 'paragraph' ? (
                        <p key={`${story.slug}-paragraph-${index}`} className="text-lg leading-8 text-foreground/90 md:leading-9">
                          {block.content}
                        </p>
                      ) : (
                        <div key={`${story.slug}-list-${index}`} className="rounded-xl border border-border bg-secondary/40 p-5">
                          <ul className="space-y-3">
                            {block.items.map((item) => (
                              <li key={item} className="flex gap-3 text-lg leading-8 text-foreground/90">
                                <ChevronRight className="mt-2 h-4 w-4 flex-shrink-0 text-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                    <p className="border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                      {story.bodyTruncated || story.bodySummary ? (
                        <>
                          {story.bodyTruncated
                            ? 'This coverage continues in the original report.'
                            : `The ${story.sourceName} feed distributes a summary of this report.`}{' '}
                          <a href={story.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                            Read the full article at {story.sourceName} →
                          </a>
                        </>
                      ) : (
                        <>Coverage as distributed by {story.sourceName} in its public feed, lightly cleaned for reading.</>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            ) : story.excerpt ? (
              <div className="editorial-elevated mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">From the report</p>
                <p className="mt-4 text-lg leading-8 text-foreground/90 md:text-xl md:leading-9">{story.excerpt}</p>
                <p className="mt-5 border-t border-border pt-4 text-sm leading-7 text-muted-foreground">
                  The {story.sourceName} feed carries this summary only — the full article is linked at the end of this brief.
                </p>
              </div>
            ) : (
              <div className="editorial-elevated mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <p className="text-lg leading-8 text-muted-foreground">
                  The publisher&rsquo;s feed carries this headline without a summary. The operator questions below still apply —
                  the full report is linked at the end of this brief.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operator check</p>
              </div>
              <p className="mt-4 text-base leading-8 text-foreground/90">{MANUFACTURING_PROMPTS[story.topic]}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Topic and process tags are automated. Treat this brief as a research starting point, not a finding about demand or profitability.
              </p>
            </div>

            <div className="editorial-elevated mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Original source</p>
                <p className="mt-2 leading-7 text-muted-foreground">
                  This brief is based on reporting published by <span className="font-semibold text-foreground">{story.sourceName}</span>.
                  Read the original for the full article, specifications, and primary-source context.
                </p>
              </div>
              <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-bold text-primary hover:border-primary/40">
                Read at {story.sourceName}<ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>

          <aside className="space-y-6">
            {source ? (
              <div className="editorial-elevated rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Source lens</p>
                <h2 className="mt-3 text-xl font-bold">{story.sourceName}</h2>
                <p className="mt-2 text-sm font-semibold text-primary">{source.kind} · {source.process}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {source.kind === 'Manufacturer'
                    ? 'Manufacturer announcements tell you what the vendor says. Validate performance claims before changing your operating plan.'
                    : 'Trade reporting adds market context across vendors. Follow the primary sources it cites before acting.'}
                </p>
              </div>
            ) : null}

            {related.length > 0 ? (
              <div>
                <h2 className="mb-4 text-base font-bold">More from this desk</h2>
                <div className="space-y-4">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/desktop-manufacturing/story/${item.slug}`} className="editorial-elevated editorial-lift block overflow-hidden rounded-2xl border border-border bg-card">
                      <div className="relative aspect-video overflow-hidden bg-slate-950">
                        <ManufacturingCover src={item.imageUrl} process={item.process} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-bold text-primary">{item.topic}</p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{item.title}</h3>
                        <p className="mt-2 text-xs text-muted-foreground">{item.sourceName} · {shortDate(item.publishedAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <Link href="/desktop-manufacturing#manufacturing-news" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold hover:border-primary/40">
              Back to the manufacturing desk<ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
