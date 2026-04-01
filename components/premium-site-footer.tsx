import Image from "next/image"
import Link from "next/link"

export function PremiumSiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_22%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.1),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,1))] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
            <div>
              <span className="block font-bold">MarketplaceBeta</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Operator Intelligence Desk
              </span>
            </div>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
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
