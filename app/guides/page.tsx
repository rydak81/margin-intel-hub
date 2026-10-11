import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { EditorialIntro } from '@/components/editorial-intro'
import { GuideCards } from '@/components/guide-cards'
import { ResourceLink } from '@/components/resource-link'
export const metadata: Metadata = {
  title: 'Ecommerce operator guides and free worksheets | MarketplaceBeta',
  description: 'Practical guides to product profitability, advertising break-even, and marketplace expansion, with worked examples and free printable worksheets.',
  alternates: { canonical: '/guides' },
  openGraph: { title: 'The operator library | MarketplaceBeta', description: 'Practical ecommerce decisions, worked through.', url: '/guides' },
}
export default function GuidesPage() {
  return <div className="min-h-screen bg-background"><PremiumSiteHeader active="guides" />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <EditorialIntro eyebrow="The operator library" title="Make the next decision with better numbers." description="Original worked examples, practical checklists, and tools for the decisions behind an ecommerce business. Free to read and download." />
      <section className="mt-10" aria-label="Operator guides"><GuideCards /></section>
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated" aria-labelledby="downloads-title">
        <p className="editorial-eyebrow">Keep a working copy</p><h2 id="downloads-title" className="mt-3 text-3xl font-bold">Two practical downloads. No signup required.</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">Printable HTML files that open in your browser and work offline. Print them or use your browser’s Save as PDF option. Write your own inputs and assumptions alongside the examples.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ResourceLink event="resource_download_click" resource="profitability-worksheet" href="/downloads/product-profitability-worksheet.html" download className="rounded-xl border border-border bg-background p-5 font-bold text-primary">Product profitability worksheet <span className="mt-2 block text-sm font-normal text-muted-foreground">Costs, advertising limits, and a downside case · HTML download ↓</span></ResourceLink>
          <ResourceLink event="resource_download_click" resource="launch-checklist" href="/downloads/marketplace-launch-checklist.html" download className="rounded-xl border border-border bg-background p-5 font-bold text-primary">Marketplace launch checklist <span className="mt-2 block text-sm font-normal text-muted-foreground">Evidence, owners, and a pilot decision · HTML download ↓</span></ResourceLink>
        </div>
      </section>
      <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-primary"><Link href="/tools">Open the operator tools →</Link><Link href="/editorial-policy">How we work with sources and AI →</Link></div>
    </main><PremiumSiteFooter /></div>
}
