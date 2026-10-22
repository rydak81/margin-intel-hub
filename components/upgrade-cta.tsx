import Link from 'next/link'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { UpgradeLink } from '@/components/upgrade-link'
import { PRO_FEATURES, resolveOffers } from '@/lib/paid-offer'

type Variant = 'banner' | 'card'

/**
 * Upgrade call to action for MarketplaceBeta Pro. Server component: reads the
 * configured Stripe Payment Link (or falls back to the founding-member list).
 * `placement` is a fixed analytics identifier, e.g. "dossier_hero".
 */
export function UpgradeCta({ placement, variant = 'banner', headline, className = '' }: { placement: string; variant?: Variant; headline?: string; className?: string }) {
  const { pro } = resolveOffers()
  const title = headline ?? 'Go deeper with MarketplaceBeta Pro'
  const bullets = PRO_FEATURES.slice(0, 3)

  if (variant === 'card') {
    return (
      <aside className={`rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-50 to-white p-6 text-slate-900 dark:from-amber-950/30 dark:to-slate-950 dark:text-slate-100 ${className}`} aria-label="MarketplaceBeta Pro">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-amber-700 dark:text-amber-300"><Lock className="h-3.5 w-3.5" />Pro · Founding members</p>
        <h2 className="mt-3 text-xl font-bold leading-snug">{title}</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6">
          {bullets.map(b => <li key={b.title} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-amber-600" /><span><strong>{b.title}.</strong> <span className="text-muted-foreground">{b.text}</span></span></li>)}
        </ul>
        {pro.priceLabel ? <p className="mt-4 text-sm font-semibold">{pro.priceLabel}</p> : null}
        <UpgradeLink placement={placement} href={pro.href} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-bold text-slate-950 hover:bg-amber-400">{pro.ctaLabel}<ArrowRight className="h-4 w-4" /></UpgradeLink>
        <Link href="/pricing" className="mt-3 block text-center text-sm font-semibold text-amber-800 underline underline-offset-4 dark:text-amber-200">Compare free and Pro</Link>
      </aside>
    )
  }

  return (
    <section className={`editorial-elevated relative overflow-hidden rounded-2xl border border-amber-500/50 bg-slate-950 p-7 text-white sm:p-9 ${className}`} aria-label="MarketplaceBeta Pro">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-amber-300"><Lock className="h-3.5 w-3.5" />MarketplaceBeta Pro · Founding members</p>
          <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{title}</h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 sm:grid-cols-3">
            {bullets.map(b => <li key={b.title} className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="font-bold text-amber-200">{b.title}</p><p className="mt-1 text-slate-300">{b.text}</p></li>)}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          {pro.priceLabel ? <p className="text-lg font-bold text-amber-200">{pro.priceLabel}</p> : <p className="text-sm text-slate-300">Founding seats are limited. Get on the list and lock the founding rate.</p>}
          <UpgradeLink placement={placement} href={pro.href} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3.5 font-bold text-slate-950 hover:bg-amber-300">{pro.ctaLabel}<ArrowRight className="h-4 w-4" /></UpgradeLink>
          <Link href="/pricing" className="text-sm font-semibold text-amber-200 underline underline-offset-4">See everything in Pro</Link>
        </div>
      </div>
    </section>
  )
}
