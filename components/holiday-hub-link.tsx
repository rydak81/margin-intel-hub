import Link from 'next/link'
import { HOLIDAY_HUB_LINK_LABEL, HOLIDAY_HUB_PATH } from '@/lib/holiday-hub'

/** Small link back to /holiday-2026 from every page the hub lists (see lib/holiday-hub.ts). */
export function HolidayHubBackLink({ className = 'mt-10' }: { className?: string }) {
  return (
    <section id="holiday-hub" aria-labelledby="holiday-hub-heading" className={`rounded-xl border border-border bg-secondary/40 p-5 ${className}`}>
      <h2 id="holiday-hub-heading" className="text-lg font-bold">Black Friday and Cyber Monday 2026</h2>
      <p className="mt-2 text-sm text-muted-foreground">Shipping cutoffs, returns, surcharges and peak fees for marketplace sellers, in one place.</p>
      <Link href={HOLIDAY_HUB_PATH} data-cta="holiday_hub" className="mt-3 inline-block font-semibold text-primary underline">{HOLIDAY_HUB_LINK_LABEL}</Link>
    </section>
  )
}
