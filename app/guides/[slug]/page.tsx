import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OPERATOR_GUIDES, GUIDE_UPDATED } from '@/lib/operator-guides'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { ResourceLink } from '@/components/resource-link'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
type Props = { params: Promise<{ slug: string }> }
export function generateStaticParams() { return OPERATOR_GUIDES.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = OPERATOR_GUIDES.find(g => g.slug === slug)
  if (!guide) return { title: 'Guide not found | MarketplaceBeta' }
  return { title: `${guide.title} | MarketplaceBeta`, description: guide.description, alternates: { canonical: `/guides/${slug}` }, openGraph: { title: guide.title, description: guide.description, url: `/guides/${slug}`, type: 'article', publishedTime: GUIDE_UPDATED, modifiedTime: GUIDE_UPDATED } }
}
export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = OPERATOR_GUIDES.find(g => g.slug === slug)
  if (!guide) notFound()
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: guide.title, description: guide.description, datePublished: GUIDE_UPDATED, dateModified: GUIDE_UPDATED, mainEntityOfPage: `${siteUrl}/guides/${slug}`, author: { '@type': 'Organization', name: 'MarketplaceBeta', url: `${siteUrl}/about` }, publisher: { '@type': 'Organization', name: 'MarketplaceBeta', logo: { '@type': 'ImageObject', url: `${siteUrl}/brand-icon.png` } } }
  return <div className="min-h-screen bg-background"><PremiumSiteHeader active="guides" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link href="/guides" className="font-semibold text-primary">Operator guides</Link><span aria-hidden="true"> / </span>{guide.category}</nav>
      <header className="editorial-intro rounded-2xl border border-border p-6 sm:p-10">
        <p className="editorial-eyebrow">{guide.category} · Practical guide</p><h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">{guide.title}</h1>
        <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{guide.description}</p>
        <p className="mt-5 text-sm text-muted-foreground">By MarketplaceBeta · Updated <time dateTime={GUIDE_UPDATED}>October 9, 2026</time> · {guide.readTime} read</p>
        <p className="mt-3 text-sm text-muted-foreground">AI-assisted educational guide. Examples are hypothetical; use current source documents and your own business data. <Link href="/editorial-policy" className="underline">Our editorial method</Link>.</p>
      </header>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="guide-copy rounded-2xl border border-border bg-card p-6 sm:p-10 editorial-elevated">
          <div className="mb-10 rounded-xl border-l-4 border-blue-600 bg-blue-50 p-5 dark:bg-blue-950/40"><p className="font-bold">The decision</p><p className="mt-2">{guide.takeaway}</p></div>
          {guide.sections.map(section => <section key={section.id} id={section.id} className="mb-10 scroll-mt-48 last:mb-0">
            <h2 className="mb-5 text-2xl font-bold sm:text-3xl">{section.title}</h2>
            {section.paragraphs.map((paragraph, i) => <p key={i} className="mb-5 leading-8 text-muted-foreground">{paragraph}</p>)}
            {section.table && <div className="my-6 overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[280px] text-left text-sm"><caption className="bg-secondary px-4 py-3 text-left font-semibold">Hypothetical example · USD unless noted</caption><thead><tr>{section.table.headings.map(h => <th key={h} scope="col" className="border-b border-border px-4 py-3">{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row,i) => <tr key={i} className="border-b border-border last:border-0 even:bg-secondary/40">{row.map((cell,j) => j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-medium">{cell}</th> : <td key={j} className="whitespace-nowrap px-4 py-3 tabular-nums">{cell}</td>)}</tr>)}</tbody></table></div>}
            {section.bullets && <ul className="list-disc space-y-3 pl-6 text-muted-foreground">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
          </section>)}
          <section id="sources" className="mt-10 border-t border-border pt-8"><h2 className="text-2xl font-bold">Sources and assumptions</h2><p className="mt-3 text-sm text-muted-foreground">Source pages consulted October 9, 2026. Platform terms and fees can change; follow the current official documents. Numerical examples are original illustrations, not reported seller results.</p><ul className="mt-5 space-y-5">{guide.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{source.label} ↗</a><p className="mt-2 text-sm text-muted-foreground">{source.context}</p></li>)}</ul></section>
        </article>
        <aside className="space-y-6 lg:sticky lg:top-44">
          <nav aria-label="On this page" className="rounded-2xl border border-border bg-card p-6 editorial-elevated"><p className="editorial-eyebrow">On this page</p><ul className="mt-4 space-y-3 text-sm">{guide.sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="hover:text-primary hover:underline">{s.title}</a></li>)}</ul></nav>
          <div className="rounded-2xl bg-slate-950 p-6 text-white editorial-elevated"><h2 className="text-xl font-bold">Put it into practice</h2><ResourceLink event="resource_download_click" resource={slug} href={guide.download.href} download className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white">{guide.download.label} ↓</ResourceLink><p className="mt-3 text-xs text-slate-300">Free printable HTML · no signup</p><ResourceLink event="guide_tool_click" resource={slug} href="/tools#profit" className="mt-5 block text-sm font-bold text-blue-200">Open the profit calculator →</ResourceLink><ResourceLink event="guide_newsletter_click" resource={slug} href="/newsletter" className="mt-4 block text-sm font-bold text-blue-200">Explore the daily brief →</ResourceLink></div>
        </aside>
      </div>
      <section className="mt-12"><h2 className="text-2xl font-bold">Continue your research</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{OPERATOR_GUIDES.filter(g => g.slug !== slug).map(g => <Link key={g.slug} href={`/guides/${g.slug}`} className="editorial-elevated editorial-lift rounded-xl border border-border bg-card p-6 font-bold">{g.title} →</Link>)}</div></section>
    </main><PremiumSiteFooter /></div>
}
