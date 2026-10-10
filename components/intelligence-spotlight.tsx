import Link from 'next/link'
import { ArrowUpRight, LayoutDashboard } from 'lucide-react'
import type { NewsArticle } from '@/lib/homepage-data'
export function IntelligenceSpotlight({ articles }: { articles: NewsArticle[] }) {
  const platforms = [['amazon', 'Amazon'], ['walmart', 'Walmart'], ['tiktok', 'TikTok Shop']]
  return <aside className="dashboard-spotlight relative rounded-2xl border border-blue-400/25 bg-slate-950 p-6 text-white sm:p-7" aria-label="Explore the intelligence dashboard">
    <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200"><LayoutDashboard className="h-4 w-4" />Your intelligence workspace</span><span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-slate-300">Free</span></div>
    <h2 className="mt-5 text-3xl font-bold tracking-tight">The whole picture.<br /><span className="text-blue-300">Your point of view.</span></h2>
    <p className="mt-3 text-sm leading-6 text-slate-300">Filter the news by platform, role, and decision. Keep a view ready for your next visit.</p>
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Coverage in this homepage briefing</p><div className="space-y-3">{platforms.map(([key, label]) => { const count = articles.filter(article => article.platforms?.includes(key)).length; return <Link key={key} href={`/intelligence?platform=${key}`} className="group block rounded focus-visible:outline-blue-300"><span className="mb-1.5 flex justify-between text-sm"><span className="font-semibold group-hover:text-blue-200">{label}</span><span className="tabular-nums text-slate-300">{articles.length ? `${count} stories` : '—'}</span></span><span aria-hidden="true" className="block h-1.5 rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${articles.length ? count / articles.length * 100 : 0}%` }} /></span></Link> })}</div></div>
    <Link href="/intelligence" className="mt-5 flex min-h-12 items-center justify-between rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-400">Open the intelligence dashboard<ArrowUpRight className="h-5 w-5" /></Link>
    <p className="mt-3 text-xs text-slate-400">News coverage, not marketplace sales or share.</p>
  </aside>
}
