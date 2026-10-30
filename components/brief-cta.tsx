import Link from 'next/link'
import { SPONSOR_CTA_HREF, SPONSOR_CTA_LABEL, briefSignupHref } from '@/lib/brief-cta'

type Tone = 'light' | 'dark'

const DEFAULT_HEADING = 'Get fee and policy changes before they hit your margin'
const DEFAULT_BODY = 'The free Daily Marketplace Brief flags fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy, with the source document.'

/** Small "Sponsor the Brief from $N" link. Price comes from lib/sponsor-offers.ts. */
export function SponsorBriefLink({ tone = 'light', className = '' }: { tone?: Tone; className?: string }) {
  const color = tone === 'dark' ? 'text-slate-300 hover:text-white' : 'text-muted-foreground hover:text-foreground'
  return (
    <p className={`text-sm ${className}`}>
      <Link href={SPONSOR_CTA_HREF} data-cta="sponsor_brief" className={`underline underline-offset-4 ${color}`}>{SPONSOR_CTA_LABEL}</Link>
    </p>
  )
}

/**
 * Daily Marketplace Brief signup block with a per-page attribution key and the
 * sponsor link. One component for every fee page and article template.
 */
export function BriefCta({
  source, heading = DEFAULT_HEADING, body = DEFAULT_BODY, buttonLabel = 'Get the free Brief', tone = 'light', className = 'mt-10',
}: { source: string; heading?: string; body?: string; buttonLabel?: string; tone?: Tone; className?: string }) {
  const box = tone === 'dark'
    ? 'bg-slate-950 text-white'
    : 'border border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40'
  const text = tone === 'dark' ? 'text-slate-300' : 'text-muted-foreground'
  return (
    <section className={`rounded-2xl p-6 ${box} ${className}`} aria-label="Daily Marketplace Brief">
      <h2 className="text-xl font-bold">{heading}</h2>
      <p className={`mt-2 ${text}`}>{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href={briefSignupHref(source)} data-cta="brief_signup" className="inline-block rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700">{buttonLabel}</Link>
        <SponsorBriefLink tone={tone} />
      </div>
    </section>
  )
}
