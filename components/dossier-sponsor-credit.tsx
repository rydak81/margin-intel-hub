import type { DossierSponsor } from '@/lib/sponsorship'

/** Labelled "Presented by" credit for the Intelligence Dossier. Renders nothing without a sponsor. */
export function DossierSponsorCredit({ sponsor, tone = 'dark' }: { sponsor: DossierSponsor | null; tone?: 'dark' | 'light' }) {
  if (!sponsor) return null
  const muted = tone === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
  const strong = tone === 'dark' ? 'text-white' : 'text-foreground'
  return (
    <aside aria-label="Sponsored" className="mt-8 flex flex-wrap items-center gap-3" data-testid="dossier-sponsor-credit">
      <span className={`rounded border border-current px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.18em] ${muted}`}>Sponsored</span>
      <span className={`text-sm ${muted}`}>Presented by</span>
      <a href={sponsor.url} target="_blank" rel="sponsored nofollow noopener" className={`inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline ${strong}`}>
        {sponsor.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- sponsor logos are arbitrary external URLs
          <img src={sponsor.logoUrl} alt="" className="h-6 w-auto max-w-[140px] rounded bg-white/90 p-0.5 object-contain" />
        ) : null}
        {sponsor.name}
      </a>
    </aside>
  )
}
