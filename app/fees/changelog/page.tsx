import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { feeChangelogNewestFirst } from '@/lib/fee-changelog'
import { getMarketplace } from '@/lib/marketplace-fees'

export const metadata: Metadata = {
  title: 'Marketplace Fee Change Log: Dated Amazon, Walmart, eBay & Etsy Fee History | MarketplaceBeta',
  description: 'A dated history of every change to our marketplace fee tables, with the exact old and new rates and the official source each was checked against.',
  alternates: { canonical: 'https://marketplacebeta.com/fees/changelog' },
}

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export default function FeeChangelogPage() {
  const entries = feeChangelogNewestFirst()
  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="fees" backHref="/fees" backLabel="Fees" />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">Fee history</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Marketplace fee change log</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Every update to our <Link href="/fees" className="text-primary underline underline-offset-4">fee tables</Link>, dated, with the exact old and new figures. Fees are seasonal variables now; this is the record of when they moved.</p>
        </section>
        <ol className="mt-10 space-y-10">
          {entries.map((entry, i) => (
            <li key={`${entry.date}-${i}`} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground"><time dateTime={entry.date}>{fmt(entry.date)}</time></p>
              <h2 className="mt-1 text-2xl font-bold">{entry.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{entry.summary}</p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-2 pr-4">Marketplace</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Before</th><th className="py-2">After</th></tr></thead>
                  <tbody>
                    {entry.changes.map((c, j) => (
                      <tr key={j} className="border-b border-border last:border-0 align-top">
                        <td className="py-2 pr-4 font-medium">{getMarketplace(c.marketplace)?.name ?? c.marketplace}</td>
                        <td className="py-2 pr-4">{c.category}</td>
                        <td className="py-2 pr-4 text-muted-foreground line-through decoration-slate-400">{c.before}</td>
                        <td className="py-2 font-medium">{c.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Checked against: {entry.sources.map((s, k) => <span key={s}>{k ? ', ' : ''}<a href={s} rel="nofollow noopener" target="_blank" className="underline underline-offset-2">{new URL(s).hostname}</a></span>)}</p>
            </li>
          ))}
        </ol>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
