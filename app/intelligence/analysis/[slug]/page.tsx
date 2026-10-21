import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { AnalysisInline } from '@/components/analysis-inline'
import { ANALYSIS_ARTICLES, getAnalysis } from '@/lib/analysis'
import { FORECASTS } from '@/lib/forecasts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
type Props = { params: Promise<{ slug: string }> }
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export const dynamicParams = false
export function generateStaticParams() { return ANALYSIS_ARTICLES.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = getAnalysis(slug)
  if (!a) return { title: 'Analysis not found | MarketplaceBeta' }
  const path = `/intelligence/analysis/${slug}`
  const ogImage = '/api/og?title=' + encodeURIComponent(a.headline) + '&category=' + encodeURIComponent('Analysis')
  return {
    title: `${a.seoTitle} | MarketplaceBeta`,
    description: a.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: a.seoTitle, description: a.metaDescription, url: path, type: 'article', publishedTime: a.publishedOn, modifiedTime: a.updatedOn, tags: a.tags, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: a.seoTitle, description: a.metaDescription, images: [ogImage] },
  }
}

export default async function AnalysisPage({ params }: Props) {
  const { slug } = await params
  const a = getAnalysis(slug)
  if (!a) notFound()
  const cta = `/newsletter?source=${a.newsletterSource}#subscribe`
  const forecasts = FORECASTS.filter(f => a.forecastIds.includes(f.id))
  const url = `${siteUrl}/intelligence/analysis/${slug}`
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: a.headline, description: a.metaDescription, datePublished: a.publishedOn, dateModified: a.updatedOn, keywords: a.tags.join(', '), mainEntityOfPage: url, author: { '@type': 'Organization', name: 'MarketplaceBeta', url: `${siteUrl}/about` }, publisher: { '@type': 'Organization', name: 'MarketplaceBeta', logo: { '@type': 'ImageObject', url: `${siteUrl}/brand-icon.png` } } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Intelligence', item: `${siteUrl}/intelligence` },
      { '@type': 'ListItem', position: 2, name: 'Analysis', item: `${siteUrl}/intelligence/analysis` },
      { '@type': 'ListItem', position: 3, name: a.seoTitle, item: url },
    ] },
  ]
  return <div className="min-h-screen bg-background">
    <JsonLd data={schema} />
    <PremiumSiteHeader active="analysis" backHref="/intelligence/analysis" backLabel="Analysis" ctaHref={cta} />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link href="/intelligence" className="font-semibold text-primary">Intelligence</Link><span aria-hidden="true"> / </span><Link href="/intelligence/analysis" className="font-semibold text-primary">Analysis</Link></nav>
      <header className="editorial-intro rounded-2xl border border-border p-6 sm:p-10">
        <p className="editorial-eyebrow">Analysis · {a.tags[0]}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">{a.headline}</h1>
        <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{a.dek}</p>
        <p className="mt-5 text-sm text-muted-foreground">By {a.author} · <time dateTime={a.publishedOn}>{fmtDate(a.publishedOn)}</time>{a.updatedOn !== a.publishedOn && <> · Updated <time dateTime={a.updatedOn}>{fmtDate(a.updatedOn)}</time></>} · {a.readTime} read</p>
        <p className="mt-3 text-sm text-muted-foreground">AI-assisted, human-reviewed analysis. Every figure links to its source below; worked examples are hypothetical. Use current source documents and your own business data. <Link href="/editorial-policy" className="underline">Our editorial method</Link>.</p>
      </header>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="guide-copy rounded-2xl border border-border bg-card p-6 sm:p-10 editorial-elevated">
          <div className="mb-10 rounded-xl border-l-4 border-blue-600 bg-blue-50 p-5 dark:bg-blue-950/40"><p className="font-bold">The decision</p><p className="mt-2">{a.takeaway}</p></div>
          {a.sections.map(section => <section key={section.id} id={section.id} className="mb-10 scroll-mt-48 last:mb-0">
            <h2 className="mb-5 text-2xl font-bold sm:text-3xl">{section.title}</h2>
            {section.paragraphs.map((p, i) => <p key={i} className="mb-5 leading-8 text-muted-foreground"><AnalysisInline text={p} /></p>)}
            {section.table && <div className="my-6 overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[480px] text-left text-sm"><caption className="bg-secondary px-4 py-3 text-left font-semibold">{section.table.caption}</caption><thead><tr>{section.table.headings.map(h => <th key={h} scope="col" className="border-b border-border px-4 py-3">{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i} className="border-b border-border last:border-0 even:bg-secondary/40">{row.map((cell, j) => j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-medium">{cell}</th> : <td key={j} className="px-4 py-3 tabular-nums">{cell}</td>)}</tr>)}</tbody></table></div>}
            {section.bullets && <ul className="list-disc space-y-3 pl-6 leading-8 text-muted-foreground">{section.bullets.map(item => <li key={item}><AnalysisInline text={item} /></li>)}</ul>}
          </section>)}
          {forecasts.length > 0 && <section id="forecasts" className="mt-10 scroll-mt-48 border-t border-border pt-8"><h2 className="text-2xl font-bold">Forecasts this piece tracks</h2><p className="mt-3 text-sm text-muted-foreground">Dated calls from our public ledger, graded hit or miss when they resolve.</p><ul className="mt-5 space-y-4">{forecasts.map(f => <li key={f.id} className="rounded-xl border border-border p-4"><p className="font-semibold">{f.id} · {f.statement}</p><p className="mt-2 text-sm text-muted-foreground">Resolve by <time dateTime={f.resolveBy}>{fmtDate(f.resolveBy)}</time> · Status: {f.status}</p></li>)}</ul><Link href="/intelligence/forecasts" className="mt-4 inline-block text-sm font-bold text-primary">See the full scorecard →</Link></section>}
          <section id="sources" className="mt-10 border-t border-border pt-8"><h2 className="text-2xl font-bold">Sources</h2><p className="mt-3 text-sm text-muted-foreground">Consulted {fmtDate(a.updatedOn)}. Carrier and platform terms change; check the current official documents and your own contract before acting.</p><ul className="mt-5 space-y-5">{a.sources.map(s => <li key={s.href}>{s.href.startsWith('/') ? <Link href={s.href} className="font-semibold text-primary underline">{s.label}</Link> : <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{s.label} ↗</a>}<p className="mt-2 text-sm text-muted-foreground">{s.context}</p></li>)}</ul></section>
        </article>
        <aside className="space-y-6 lg:sticky lg:top-44">
          <nav aria-label="On this page" className="rounded-2xl border border-border bg-card p-6 editorial-elevated"><p className="editorial-eyebrow">On this page</p><ul className="mt-4 space-y-3 text-sm">{a.sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="hover:text-primary hover:underline">{s.title}</a></li>)}{forecasts.length > 0 && <li><a href="#forecasts" className="hover:text-primary">Forecasts tracked</a></li>}<li><a href="#sources" className="hover:text-primary">Sources</a></li></ul></nav>
          <div className="rounded-2xl bg-slate-950 p-6 text-white editorial-elevated"><h2 className="text-xl font-bold">Get the next one in your inbox</h2><p className="mt-3 text-sm text-slate-300">The free Daily Marketplace Brief: fee changes, forecast grades and operator analysis like this.</p><Link href={cta} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white">Subscribe free<ArrowRight className="h-4 w-4" /></Link></div>
        </aside>
      </div>
    </main><PremiumSiteFooter /></div>
}
