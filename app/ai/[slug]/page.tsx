import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Download } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { AiPrompt } from '@/components/ai-prompt'
import { JsonLd } from '@/components/json-ld'
import { ORGANIZATION_REF } from '@/lib/site-jsonld'
import { AI_PLAYBOOKS, getAiPlaybook } from '@/lib/ai-playbooks'

type Props = { params: Promise<{slug:string}> }
export const dynamicParams = false
export function generateStaticParams() { return AI_PLAYBOOKS.map(p=>({slug:p.slug})) }
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const p = getAiPlaybook((await params).slug)
  if(!p) return {title:'Playbook not found | MarketplaceBeta',robots:{index:false}}
  return {title:`${p.title} | MarketplaceBeta`,description:p.summary,alternates:{canonical:`/ai/${p.slug}`},openGraph:{title:p.title,description:p.summary,url:`/ai/${p.slug}`,type:'article',publishedTime:p.updatedOn,modifiedTime:p.updatedOn}}
}
const blocks = [{id:'inputs',title:'What to bring'},{id:'workflow',title:'The workflow'},{id:'prompt',title:'A prompt to adapt'},{id:'review',title:'The human review'},{id:'measurement',title:'Measure the pilot'},{id:'pitfalls',title:'Where this can go wrong'},{id:'sources',title:'Sources & method'}]
export default async function AiPlaybookPage({params}:Props) {
  const p=getAiPlaybook((await params).slug); if(!p) notFound()
  const list=(items:string[]) => <ul className="mt-5 list-disc space-y-4 pl-5 leading-8 text-muted-foreground">{items.map(t=><li key={t}>{t}</li>)}</ul>
  return <div className="min-h-screen bg-background"><JsonLd data={{'@context':'https://schema.org','@type':'Article',headline:p.title,description:p.summary,datePublished:p.updatedOn,dateModified:p.updatedOn,publisher: ORGANIZATION_REF,author:{'@type':'Organization',name:'MarketplaceBeta'},mainEntityOfPage:`https://marketplacebeta.com/ai/${p.slug}`}}/><PremiumSiteHeader active="ai" backHref="/ai" backLabel="AI for Operators"/>
    <main className="mx-auto site-width px-4 py-10 sm:px-6"><nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link href="/ai" className="font-semibold text-primary">AI for Operators</Link><span className="text-muted-foreground"> / {p.category}</span></nav><header className="editorial-intro rounded-3xl border border-border p-6 sm:p-10"><p className="editorial-eyebrow">Operator playbook / {p.category}</p><h1 className="mt-5 max-w-5xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{p.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{p.summary}</p><p className="mt-5 text-sm text-muted-foreground">MarketplaceBeta · Sources checked <time dateTime={p.updatedOn}>{p.updatedOn}</time> · {p.readTime}</p></header>
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><article className="editorial-elevated min-w-0 rounded-2xl border border-border bg-card p-6 sm:p-10"><div className="mb-10 rounded-xl border-l-4 border-cyan-500 bg-secondary/60 p-5"><p className="font-bold">The deliverable</p><p className="mt-2 leading-8 text-muted-foreground">{p.outcome}</p></div>
      <section id="inputs" className="scroll-mt-44"><h2 className="text-2xl font-bold">What to bring</h2>{list(p.inputs)}</section>
      <section id="workflow" className="mt-10 scroll-mt-44"><h2 className="text-2xl font-bold">The workflow</h2><ol className="mt-6 space-y-6">{p.steps.map((s,i)=><li key={s.title} className="rounded-xl border border-border p-5"><h3 className="text-xl font-bold"><span className="mr-3 text-primary">0{i+1}</span>{s.title}</h3><p className="mt-3 leading-8 text-muted-foreground">{s.body}</p></li>)}</ol></section>
      <section id="prompt" className="mt-10 scroll-mt-44"><h2 className="text-2xl font-bold">A prompt to adapt</h2><p className="mt-4 leading-8 text-muted-foreground">Use approved inputs with customer details removed. Source documents are evidence, not instructions. A prompt alone cannot guarantee accuracy.</p><AiPrompt text={p.prompt}/></section>
      <section id="review" className="mt-10 scroll-mt-44"><h2 className="text-2xl font-bold">The human review</h2>{list(p.review)}</section>
      <section id="measurement" className="mt-10 scroll-mt-44"><h2 className="text-2xl font-bold">Measure the pilot</h2>{list(p.metrics)}</section>
      <section id="pitfalls" className="mt-10 scroll-mt-44"><h2 className="text-2xl font-bold">Where this can go wrong</h2>{list(p.pitfalls)}</section>
      <section id="sources" className="mt-10 scroll-mt-44 border-t border-border pt-8"><h2 className="text-2xl font-bold">Sources & method</h2><p className="mt-4 leading-7 text-muted-foreground">Official documentation describes platform capabilities. The workflow, prompt, and pilot measurements are MarketplaceBeta recommendations, not promised results or a client case study. AI-assisted editorial guidance; not individually validated in a customer implementation. Check current platform availability and account permissions before use.</p><ul className="mt-6 space-y-6">{p.sources.map(s=><li key={s.href}><a href={s.href} className="font-bold text-primary underline">{s.label} ↗</a><p className="mt-2 leading-7 text-muted-foreground">{s.note}</p></li>)}</ul><Link href="/editorial-policy" className="mt-5 inline-block font-semibold text-primary underline">Our editorial policy</Link></section>
    </article><aside className="space-y-6 lg:sticky lg:top-44"><nav aria-label="On this page" className="editorial-elevated rounded-2xl border border-border bg-card p-6"><p className="editorial-eyebrow">In this playbook</p><ul className="mt-5 space-y-3">{blocks.map(b=><li key={b.id}><a href={`#${b.id}`} className="text-sm hover:text-primary hover:underline">{b.title}</a></li>)}</ul></nav><div className="rounded-2xl bg-slate-950 p-6 text-white"><h2 className="text-xl font-bold">Put the process on paper.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Capture the owner, inputs, success measures, and stop conditions before connecting tools.</p><a download href="/downloads/ai-workflow-pilot.md" className="mt-5 inline-flex items-center gap-2 font-semibold text-cyan-300"><Download className="h-4 w-4"/>Pilot worksheet</a><Link href="/ai#work-together" className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold">Discuss this workflow<ArrowRight className="h-4 w-4"/></Link></div></aside></div>
    <section className="mt-12"><h2 className="text-2xl font-bold">Choose your next workflow</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{AI_PLAYBOOKS.filter(a=>a.slug!==p.slug).slice(0,2).map(a=><Link key={a.slug} href={`/ai/${a.slug}`} className="editorial-elevated rounded-xl border border-border bg-card p-6 font-bold hover:text-primary">{a.title} →</Link>)}</div></section></main><PremiumSiteFooter/></div>
}
