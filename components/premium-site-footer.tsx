import Link from "next/link"
import { SiteBrand } from "@/components/site-brand"
import { SITE_NAVIGATION } from "@/lib/site-navigation"
export function PremiumSiteFooter() {
  return <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div><SiteBrand /><p className="mt-5 max-w-sm text-base leading-7 text-slate-300">News, context, and practical research for the people operating ecommerce businesses.</p></div>
        <nav aria-label="Footer navigation"><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Explore the desk</p><div className="grid grid-cols-2 gap-3">{SITE_NAVIGATION.map(item => <Link key={item.key} href={item.href} className="text-sm text-slate-300 hover:text-white">{item.label}</Link>)}</div></nav>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stay informed</p><p className="mt-4 text-base leading-7 text-slate-300">Keep the developments that affect your next decision in view.</p><Link href="/newsletter" className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">Get the daily brief →</Link></div>
      </div>
      <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-400"><span>© {new Date().getFullYear()} MarketplaceBeta</span><div className="flex flex-wrap gap-5"><Link href="/about" className="hover:text-white">About</Link><Link href="/editorial-policy" className="hover:text-white">Editorial policy</Link><a href="mailto:hello@marketplacebeta.com" className="hover:text-white">Contact</a></div></div>
    </div>
  </footer>
}
