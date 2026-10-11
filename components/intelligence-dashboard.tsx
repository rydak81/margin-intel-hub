'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Activity, Layers3, Radio, Search } from 'lucide-react'
import { DEFAULT_INTELLIGENCE_VIEW, INTELLIGENCE_VIEW_KEY, validateIntelligenceView, viewSearch, type IntelligenceView } from '@/lib/intelligence-view'
import { EditorialIntro } from '@/components/editorial-intro'
import { DECISION_PROMPTS, filterIntelligence, INTELLIGENCE_AUDIENCES, INTELLIGENCE_CATEGORIES, INTELLIGENCE_PLATFORMS, safeSourceUrl, signalLabel, type IntelligenceSnapshot } from '@/lib/intelligence'

const INITIAL_FILTERS = DEFAULT_INTELLIGENCE_VIEW
const utcDate = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
const fieldClass = 'mt-2 h-12 w-full rounded-lg border border-border bg-background px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function IntelligenceDashboard({ snapshot, initialView }: { snapshot: IntelligenceSnapshot; initialView: IntelligenceView | null }) {
  const [filters, setFilters] = useState(initialView || INITIAL_FILTERS)
  const [viewMessage, setViewMessage] = useState('')
  const [hasSavedView, setHasSavedView] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)
  useEffect(() => {
    setFilters(initialView || INITIAL_FILTERS)
    setVisibleCount(12)
    setViewMessage('')
    setHasSavedView(false)
    try {
      const stored = localStorage.getItem(INTELLIGENCE_VIEW_KEY)
      if (!stored || stored.length > 2000) return
      const saved = JSON.parse(stored)
      if (saved.version !== 1 || !saved.filters || typeof saved.filters !== 'object') return
      setHasSavedView(true)
      if (!initialView) { setFilters(validateIntelligenceView(saved.filters)); setViewMessage('Your saved view is ready. Time windows use the latest available snapshot.') }
    } catch { /* Storage can be disabled; the dashboard still works. */ }
  }, [initialView])
  const rows = useMemo(() => filterIntelligence(snapshot.articles, filters, Date.parse(snapshot.checkedAt)), [snapshot, filters])
  const update = (patch: Partial<IntelligenceView>) => {
    const next = { ...filters, ...patch }
    setFilters(next); setVisibleCount(12); setViewMessage('')
    const query = viewSearch(next)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? '?' + query : ''}`)
  }
  const saveView = () => {
    try { localStorage.setItem(INTELLIGENCE_VIEW_KEY, JSON.stringify({ version: 1, filters })); setHasSavedView(true); setViewMessage('View saved on this browser. Open the dashboard next time to pick up here.') }
    catch { setViewMessage('This browser could not save the view. You can bookmark the filtered page instead.') }
  }
  const forgetView = () => {
    try { localStorage.removeItem(INTELLIGENCE_VIEW_KEY); setHasSavedView(false); setViewMessage('Saved view removed from this browser.') }
    catch { setViewMessage('This browser could not remove the saved view. Check your browser storage settings.') }
  }
  const sources = new Set(rows.map(row => row.sourceName)).size
  const highImpact = rows.filter(row => row.impactLevel === 'high').length
  const platformCounts = INTELLIGENCE_PLATFORMS.map(([key, label]) => ({ key, label, count: rows.filter(row => row.platforms.includes(key)).length }))
  const categories = INTELLIGENCE_CATEGORIES.map(([key, label]) => ({ key, label, count: rows.filter(row => row.category === key).length })).sort((a, b) => b.count - a.count)
  const newest = snapshot.articles[0]?.publishedAt
  const isStale = newest && Date.parse(snapshot.checkedAt) - Date.parse(newest) > 2 * 86400000

  return <>
    <EditorialIntro eyebrow="The intelligence dashboard" title="Know what changed. Decide what matters." description="A working view of marketplace developments, organized around your channels and the decisions on your desk." />
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>News intelligence · Snapshot checked {utcDate(snapshot.checkedAt)} at {snapshot.checkedAt.slice(11, 16)} UTC · Refreshes up to every five minutes</p>
      <a href="#coverage" className="font-semibold text-primary underline underline-offset-4">About this data</a>
    </div>
    {snapshot.status === 'unavailable' ? <div role="status" className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-6"><h2 className="text-xl font-bold">The news snapshot is temporarily unavailable.</h2><p className="mt-2">We couldn’t load the source data. The empty view below does not indicate a quiet market. Try again shortly or <Link href="/articles" className="text-primary underline">open the archive</Link>.</p></div> : isStale ? <p role="status" className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">The newest available story is from {utcDate(newest)}. Coverage may be delayed; verify time-sensitive changes with the original source.</p> : null}

    <section aria-label="Filter intelligence" className="editorial-elevated mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold">Time window<select className={fieldClass} value={filters.days} onChange={e => update({ days: Number(e.target.value) })}><option value={1}>Last 24 hours</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label>
        <label className="text-sm font-semibold">Platform<select className={fieldClass} value={filters.platform} onChange={e => update({ platform: e.target.value })}><option value="all">All platforms</option>{INTELLIGENCE_PLATFORMS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-sm font-semibold">Your perspective<select className={fieldClass} value={filters.audience} onChange={e => update({ audience: e.target.value })}><option value="all">All operators</option>{INTELLIGENCE_AUDIENCES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-sm font-semibold">Decision area<select className={fieldClass} value={filters.category} onChange={e => update({ category: e.target.value })}><option value="all">All topics</option>{INTELLIGENCE_CATEGORIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-semibold"><span className="flex items-center gap-2"><Search className="h-4 w-4" />Search this snapshot</span><input type="search" className={fieldClass} value={filters.query} onChange={e => update({ query: e.target.value })} placeholder="Search headlines, context, or sources" /></label><button type="button" className="h-12 rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted" onClick={() => update(INITIAL_FILTERS)}>Reset filters</button></div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5"><button type="button" onClick={saveView} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Save this view</button>{hasSavedView ? <button type="button" onClick={forgetView} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold">Forget saved view</button> : null}<span className="text-sm text-muted-foreground">Keep your filters on this browser. No account needed.</span></div>
      <p role="status" className="mt-3 text-sm text-primary">{viewMessage}</p>
    </section>

    <section aria-label="Filtered news overview" className="intelligence-stats mt-7 grid gap-4 sm:grid-cols-3" aria-live="polite">
      {[{ title: 'Curated stories', value: rows.length, detail: 'After relevance and topic filtering', icon: Layers3 }, { title: 'Marked high impact', value: highImpact, detail: 'Automated editorial tags; verify relevance', icon: Activity }, { title: 'Named sources', value: sources, detail: 'Source labels, not verified independent reports', icon: Radio }].map(stat => <div key={stat.title} className="editorial-elevated rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">{stat.title}<stat.icon className="h-5 w-5 text-primary" /></div><p className="mt-3 text-5xl font-bold tracking-tight">{snapshot.status === 'ready' ? stat.value : '—'}</p><p className="mt-3 text-sm text-muted-foreground">{stat.detail}</p></div>)}
    </section>

    <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <section className="editorial-elevated rounded-2xl border border-border bg-card p-6"><p className="editorial-eyebrow">Channel coverage</p><h2 className="mt-2 text-2xl font-bold">Where the news is</h2><p className="mt-2 text-sm text-muted-foreground">Stories in your filtered view. Multi-platform stories can count in more than one channel.</p><div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">{platformCounts.map(platform => <button type="button" key={platform.key} aria-pressed={filters.platform === platform.key} onClick={() => update({ platform: filters.platform === platform.key ? 'all' : platform.key })} className="rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex items-center justify-between text-sm font-semibold"><span>{platform.label}</span><span>{snapshot.status === 'ready' ? platform.count : '—'}</span></span><span aria-hidden="true" className="mt-2 block h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${rows.length ? platform.count / rows.length * 100 : 0}%` }} /></span></button>)}</div></section>
      <section className="editorial-elevated rounded-2xl border border-slate-700 bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-blue-300">Operating agenda</p><h2 className="mt-2 text-2xl font-bold">What needs a closer look</h2><p className="mt-2 text-sm leading-6 text-slate-300">Topics by coverage volume in this view. More headlines do not imply a bigger commercial opportunity.</p><div className="mt-5 space-y-3">{categories.filter(item => item.count > 0).slice(0, 4).map(item => <button key={item.key} type="button" onClick={() => update({ category: item.key })} className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-4 text-left hover:bg-white/10"><span className="font-semibold">{item.label}</span><span className="rounded-md bg-white/10 px-2 py-1 text-sm">{item.count}</span></button>)}{!rows.length ? <p className="py-6 text-slate-300">{snapshot.status === 'ready' ? 'No matching coverage in this view.' : 'Coverage is temporarily unavailable.'}</p> : null}</div><Link href="/guides" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-300">Work through the numbers<ArrowUpRight className="h-4 w-4" /></Link></section>
    </div>

    <section className="mt-12" aria-labelledby="latest-signals"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="editorial-eyebrow">From signal to investigation</p><h2 id="latest-signals" className="mt-2 text-3xl font-bold">Your latest developments</h2></div><p className="text-sm text-muted-foreground">{snapshot.status === 'ready' ? `Newest first · ${rows.length} matching stories` : 'Story counts unavailable'}</p></div>
      {!rows.length ? <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8"><h3 className="text-xl font-bold">{snapshot.status === 'ready' ? 'No stories match these filters.' : 'Stories are temporarily unavailable.'}</h3><p className="mt-2 text-muted-foreground">{snapshot.status === 'ready' ? 'Broaden the platform or time window, or ' : 'Try again shortly or '}<Link href="/articles" className="text-primary underline">search the full archive</Link>. Missing coverage is not evidence of no activity.</p></div> : <div className="mt-6 grid gap-6 lg:grid-cols-2">{rows.slice(0, visibleCount).map(article => { const source = safeSourceUrl(article.sourceUrl); return <article key={article.id} className="editorial-elevated editorial-lift rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-md bg-primary/10 px-2.5 py-1.5 text-primary">{signalLabel(article.category, INTELLIGENCE_CATEGORIES)}{article.categoryBasis === 'headline_rule' ? ' · headline tag' : ''}</span>{article.impactLevel === 'high' ? <span className="rounded-md bg-amber-500/10 px-2.5 py-1.5 text-amber-800 dark:text-amber-200">High impact · automated tag</span> : null}</div><h3 className="mt-4 text-2xl font-bold leading-tight"><Link className="hover:text-primary" href={`/news/${article.id}`}>{article.title}</Link></h3><p className="mt-3 text-sm text-muted-foreground">{article.sourceName} · <time dateTime={article.publishedAt}>{utcDate(article.publishedAt)}</time></p><p className="mt-4 leading-7 text-muted-foreground">{article.summary}</p><div className="mt-5 rounded-xl border border-border bg-muted/40 p-4"><p className="text-xs font-bold uppercase tracking-wider text-primary">{article.actionItem ? 'Suggested next check · AI-assisted' : 'Decision prompt'}</p><p className="mt-2 text-sm leading-6">{article.actionItem || DECISION_PROMPTS[article.category] || 'Confirm the original announcement and assess whether it affects your market, category, or workflow.'}</p></div><div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-semibold"><Link href={`/news/${article.id}`} className="text-primary">Read the context →</Link>{source ? <a href={source} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-4">Original source ↗</a> : null}</div></article> })}</div>}
      {rows.length > visibleCount ? <button type="button" onClick={() => setVisibleCount(count => count + 12)} className="mx-auto mt-8 block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">Show more developments</button> : null}
    </section>

    <section id="coverage" className="mt-12 scroll-mt-44 rounded-2xl border border-border bg-card p-6 sm:p-8"><p className="editorial-eyebrow">Coverage & methodology</p><h2 className="mt-2 text-2xl font-bold">Understand the evidence behind the view.</h2><div className="mt-5 grid gap-6 md:grid-cols-3"><div><h3 className="font-bold">Available now</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Headlines, publication dates, source links, automated platform and audience tags, summaries, and suggested checks. Legacy broad categories are routed by headline rules, marked on story cards. Other unmatched stories remain Commerce context. Sellers includes legacy brand tags; logistics selects logistics coverage, and technology includes technology topics and SaaS audience tags.</p></div><div><h3 className="font-bold">A recent sample</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">We inspect up to 500 newest eligible records published within 90 days, then filter relevance and similar topics. {snapshot.status === 'ready' ? `This snapshot inspected ${snapshot.sampledCount} records and retained ${snapshot.articles.length} stories.` : 'Snapshot counts are unavailable.'}{snapshot.capped ? ' The 500-record cap was reached: longer windows are incomplete.' : ''} Counts describe coverage, not market share or sales.</p></div><div><h3 className="font-bold">Product data is not connected</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Amazon product rankings, price history, Etsy product metrics, and MeshNomics data are not part of this dashboard yet. News alone cannot establish demand, profitability, or a market-wide trend.</p></div></div><p className="mt-6 text-sm text-muted-foreground">Tags and summaries may be incomplete or inaccurate. Similarity filtering can combine related developments; use the archive and original sources for deeper research. <Link href="/editorial-policy" className="font-semibold text-primary underline">Read the editorial method</Link>.</p></section>
  </>
}
