import Link from "next/link"
import { SiteBrand } from "@/components/site-brand"

export function PremiumSiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_22%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.1),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,1))] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <SiteBrand
            href="/"
            deskLabel="Operator Intelligence Desk"
            className="justify-center text-center md:justify-start md:text-left"
            logoClassName="h-10"
            iconClassName="h-7 w-7"
            labelClassName="text-white/45"
          />
          <div className="flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/68 md:justify-end">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/news" className="hover:text-white transition-colors">News</Link>
            <Link href="/articles" className="hover:text-white transition-colors">Articles</Link>
            <Link href="/community" className="hover:text-white transition-colors">Community</Link>
            <Link href="/community/pulse" className="hover:text-white transition-colors">Pulse</Link>
            <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
