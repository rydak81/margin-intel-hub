'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import type { AiPlaybook } from '@/lib/ai-playbooks'

type Card = Pick<AiPlaybook, 'slug' | 'title' | 'summary' | 'category' | 'readTime' | 'outcome'>

export function AiPlaybookLibrary({ playbooks }: { playbooks: Card[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All workflows')
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const items = playbooks.filter(p => (category === 'All workflows' || p.category === category) && terms.every(term => `${p.title} ${p.summary} ${p.category} ${p.outcome}`.toLowerCase().includes(term)))
  return <section id="playbooks" aria-labelledby="playbooks-title" className="scroll-mt-44 py-12 sm:py-16">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="editorial-eyebrow">The workflow library</p><h2 id="playbooks-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Less busywork. Better decisions.</h2><p className="mt-4 max-w-2xl text-lg text-muted-foreground">Start with a real operating problem. Leave with a process, a prompt, and a way to check the result.</p></div><p role="status" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">{items.length} {items.length === 1 ? 'playbook' : 'playbooks'}</p></div>
    <div className="my-7 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_240px]">
      <label className="text-sm font-semibold">Search playbooks<div className="relative mt-2"><Search aria-hidden="true" className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try listings, inventory, or review…" className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-3 text-base"/></div></label>
      <label className="text-sm font-semibold">Workflow<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-base">{['All workflows', ...new Set(playbooks.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select></label>
    </div>
    {items.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map((p)=><article key={p.slug} className="editorial-elevated editorial-lift flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-transparent px-6 py-5"><span className="text-xs font-bold uppercase tracking-widest text-primary">{p.category}</span><span className="text-xs font-medium text-muted-foreground">{p.readTime}</span></div><div className="flex flex-1 flex-col p-6 sm:p-7"><h3 className="text-2xl font-bold leading-snug tracking-tight"><Link href={`/ai/${p.slug}`} className="hover:text-primary">{p.title}</Link></h3><p className="mt-4 leading-7 text-muted-foreground">{p.summary}</p><p className="my-6 rounded-xl bg-secondary/60 p-4 text-sm leading-6"><span className="block font-bold">What you leave with</span>{p.outcome}</p><Link href={`/ai/${p.slug}`} className="mt-auto inline-flex items-center gap-2 font-bold text-primary">Open the playbook<ArrowUpRight aria-hidden="true" className="h-5 w-5"/></Link></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card p-8"><h3 className="text-xl font-bold">No playbooks match this view.</h3><p className="mt-2 text-muted-foreground">Try another workflow or a shorter search.</p><button onClick={()=>{setQuery('');setCategory('All workflows')}} className="mt-4 font-bold text-primary underline">Reset filters</button></div>}
  </section>
}
