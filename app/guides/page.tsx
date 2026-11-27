import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { BriefCta } from '@/components/brief-cta'
import { BRIEF_CTA_KEYS } from '@/lib/brief-cta'
import { EditorialIntro } from '@/components/editorial-intro'
import { GuideCards } from '@/components/guide-cards'
import { ResourceLink } from '@/components/resource-link'
import { JsonLd } from '@/components/json-ld'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
import { sectionPageJsonLd } from '@/lib/site-jsonld'
export const metadata: Metadata = {
  title: 'Ecommerce operator guides and free worksheets | MarketplaceBeta',
  description: 'Practical guides to product profitability, advertising break-even, and marketplace expansion, with worked examples and free printable worksheets.',
  alternates: { canonical: '/guides' },
  openGraph: { title: 'The operator library | MarketplaceBeta', description: 'Practical ecommerce decisions, worked through.', url: '/guides' },
}
const GUIDE_DOWNLOADS = [
  { name: 'Product profitability worksheet', path: '/downloads/product-profitability-worksheet.html' },
  { name: 'Marketplace launch checklist', path: '/downloads/marketplace-launch-checklist.html' },
]

export default function GuidesPage() {
  const jsonLd = sectionPageJsonLd({
    name: 'Make the next decision with better numbers.',
    description: 'Practical guides to product profitability, advertising break-even, and marketplace expansion, with worked examples and free printable worksheets.',
    path: '/guides',
    items: [
      ...OPERATOR_GUIDES.map((guide) => ({ name: guide.title, path: `/guides/${guide.slug}` })),
      ...GUIDE_DOWNLOADS,
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
    ],
  })
  return <div className="min-h-screen bg-background"><JsonLd data={jsonLd} /><PremiumSiteHeader active="guides" />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <EditorialIntro eyebrow="The operator library" title="Make the next decision with better numbers." description="Original worked examples, practical checklists, and tools for the decisions behind an ecommerce business. Free to read and download." />
      <section className="mt-10" aria-labelledby="guide-index-title">
        <h2 id="guide-index-title" className="text-3xl font-bold">Guide index</h2>
        <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{OPERATOR_GUIDES.length} operator guides. Each one is a hypothetical worked example with its assumptions written down. The numbers in a guide are not fee quotes and not a case study of a real seller. For a marketplace&apos;s schedule, use the <Link href="/fees" className="font-semibold text-primary underline">fee pages</Link>, which show the source and the date it was last checked, and the <Link href="/fees/changelog" className="font-semibold text-primary underline">fee change log</Link> when a figure in our tables changes. The <Link href="/editorial-policy" className="font-semibold text-primary underline">editorial method</Link> explains how examples, sources, and corrections are handled.</p>
        <ul className="mt-6 space-y-4">
          {OPERATOR_GUIDES.map((guide) => (
            <li key={guide.slug} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{guide.category} · {guide.readTime} read</p>
              <h3 className="mt-2 text-xl font-bold"><Link href={`/guides/${guide.slug}`} className="hover:text-primary">{guide.title}</Link></h3>
              <p className="mt-2 text-muted-foreground">{guide.takeaway}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8" aria-label="Operator guides"><GuideCards /></div>
      </section>
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated" aria-labelledby="downloads-title">
        <p className="editorial-eyebrow">Keep a working copy</p><h2 id="downloads-title" className="mt-3 text-3xl font-bold">Two practical downloads. No signup required.</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">Printable HTML files that open in your browser and work offline. Print them or use your browser’s Save as PDF option. Write your own inputs and assumptions alongside the examples.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ResourceLink event="resource_download_click" resource="profitability-worksheet" href="/downloads/product-profitability-worksheet.html" download className="rounded-xl border border-border bg-background p-5 font-bold text-primary">Product profitability worksheet <span className="mt-2 block text-sm font-normal text-muted-foreground">Costs, advertising limits, and a downside case · HTML download ↓</span></ResourceLink>
          <ResourceLink event="resource_download_click" resource="launch-checklist" href="/downloads/marketplace-launch-checklist.html" download className="rounded-xl border border-border bg-background p-5 font-bold text-primary">Marketplace launch checklist <span className="mt-2 block text-sm font-normal text-muted-foreground">Evidence, owners, and a pilot decision · HTML download ↓</span></ResourceLink>
        </div>
      </section>
      <BriefCta source={BRIEF_CTA_KEYS.guidesHub} heading="Get the decisions behind the numbers, daily" body="The free Daily Marketplace Brief: fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy, plus operator analysis." />
      <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-primary"><Link href="/tools">Open the operator tools →</Link><Link href="/editorial-policy">How we work with sources and AI →</Link></div>
    </main><PremiumSiteFooter /></div>
}
