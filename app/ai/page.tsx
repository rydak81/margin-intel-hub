import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckCircle2, Database, FileCheck2, Workflow, Download } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { AiPlaybookLibrary } from '@/components/ai-playbook-library'
import { SponsorInquiryForm } from '@/components/sponsor-inquiry-form'
import { JsonLd } from '@/components/json-ld'
import { ORGANIZATION_REF } from '@/lib/site-jsonld'
import { AiNews } from '@/components/ai-news'
import { AiQuickStart } from '@/components/ai-quick-start'
import { loadIntelligenceSnapshot } from '@/lib/intelligence-data'
import { AI_PLAYBOOKS } from '@/lib/ai-playbooks'
import { BriefCta } from '@/components/brief-cta'
import { AiRelatedLinks } from '@/components/related-links'
import { AI_BRIEF_BODY, AI_BRIEF_HEADING, AI_HUB_SOURCE, aiHubBriefHref, aiHubRelatedLinks } from '@/lib/ai-related'

export const metadata: Metadata = {
  title: 'AI for Ecommerce Operators: Practical Playbooks | MarketplaceBeta',
  description: 'Practical AI workflows for ecommerce listings, reporting, customer support, advertising and inventory. Sourced guides, prompts and a pilot worksheet.',
  alternates: { canonical: '/ai' },
  openGraph: { title: 'AI for Ecommerce Operators', description: 'Put AI to work on the work that matters.', url: '/ai', type: 'website' },
}
const plan = [
  { week: '01', title: 'Choose one bottleneck', text: 'Pick a repeated task with a clear owner, known inputs, and a result you can review. Record the current time and error rate.' },
  { week: '02', title: 'Build a small pilot', text: 'Use a representative, redacted sample. Keep calculations in code or a spreadsheet. Ask AI to draft, organize, or explain.' },
  { week: '03', title: 'Test the exceptions', text: 'Try missing data, conflicting policies, unusual products, and misleading source text. Record corrections and stop conditions.' },
  { week: '04', title: 'Decide what to keep', text: 'Compare total effort, output quality, and cost with the baseline. Scale only when the evidence justifies it.' },
]
export const revalidate = 300
export default async function AiOperatorsPage() {
  const snapshot = await loadIntelligenceSnapshot()
  return <div className="min-h-screen bg-background">
    <JsonLd data={{'@context':'https://schema.org','@type':'CollectionPage',name:'AI for Ecommerce Operators',url:'https://marketplacebeta.com/ai',hasPart:AI_PLAYBOOKS.map(p=>({'@type':'Article',headline:p.title,publisher: ORGANIZATION_REF,dateModified:p.updatedOn,url:`https://marketplacebeta.com/ai/${p.slug}`}))}}/>
    <PremiumSiteHeader active="ai" ctaHref={aiHubBriefHref()}/>
    <main className="mx-auto site-width px-4 py-8 sm:px-6">
      <section className="relative isolate overflow-hidden rounded-3xl border border-blue-400/30 bg-slate-950 p-6 text-white shadow-2xl sm:p-10 lg:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-48 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-3xl"/>
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">MarketplaceBeta / AI for operators</p><h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">Put AI to work.<br/><span className="text-cyan-200">Make the work better.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Practical playbooks for ecommerce sellers, agencies, and marketplace teams. Better listings. Clearer reporting. More reliable operations.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#playbooks" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 hover:bg-cyan-200">Find your workflow<ArrowRight className="h-5 w-5"/></a><a href="#work-together" className="rounded-xl border border-slate-600 px-5 py-4 font-semibold hover:bg-white/10">Discuss an AI project</a></div><p className="mt-6 text-sm text-slate-400">Source-linked guidance · Copyable prompts · Human review built in</p></div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-[0_24px_60px_-20px_rgba(34,211,238,0.3)] sm:p-7"><div className="flex items-center justify-between border-b border-slate-700 pb-5"><p className="text-xs font-bold uppercase tracking-widest text-cyan-200">The operating loop</p><Workflow className="h-5 w-5 text-cyan-300"/></div><div className="space-y-4 py-5">{[{icon:Database,title:'Start with evidence',text:'Approved product facts, policies, and business data.'},{icon:Workflow,title:'Build a useful draft',text:'A brief, a listing, or an exception queue.'},{icon:FileCheck2,title:'Review before action',text:'Check facts. Assign an owner. Measure the result.'}].map(({icon:Icon,title,text},i)=><div key={title} className="flex gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4"><Icon className="mt-1 h-6 w-6 shrink-0 text-cyan-300"/><div><p className="text-xs text-slate-400">0{i+1}</p><p className="mt-1 text-lg font-bold">{title}</p><p className="mt-2 text-sm leading-6 text-slate-300">{text}</p></div></div>)}</div><p className="text-sm leading-6 text-slate-400">A workflow earns its place when it improves the outcome after review time and cost are included.</p></div>
        </div>
      </section>
      <AiQuickStart/>
      <AiNews snapshot={snapshot}/>
      <AiPlaybookLibrary playbooks={AI_PLAYBOOKS.map(({slug,title,summary,category,readTime,outcome})=>({slug,title,summary,category,readTime,outcome}))}/>
      <section aria-labelledby="research-title" className="grid gap-6 border-t border-border py-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="editorial-elevated rounded-2xl border border-border bg-card p-7 sm:p-9"><p className="editorial-eyebrow">Learn the method</p><h2 id="research-title" className="mt-4 text-3xl font-bold">Inspect the method.<br/>Then judge the result.</h2><p className="mt-5 leading-8 text-muted-foreground">Our own archive is a useful place to examine AI-assisted research: source selection, comparisons, missing evidence, and the difference between a headline and a finding.</p><Link href="/intelligence/analysis/ai-commerce-headlines-are-not-adoption-data" className="mt-6 inline-flex items-center gap-2 font-bold text-primary">Why AI headlines do not prove adoption<ArrowUpRight className="h-5 w-5"/></Link><p className="mt-5 text-sm leading-6 text-muted-foreground">This is an inspectable research example, not evidence of client results. The playbooks are AI-assisted editorial guidance; they have not been individually validated in a customer implementation.</p></div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-7 sm:p-9"><p className="editorial-eyebrow">Follow the evidence</p><h2 className="mt-4 text-2xl font-bold">Stay current without chasing every launch.</h2><p className="mt-4 leading-7 text-muted-foreground">Use the existing news dashboard for developments. Use official documentation to check what a tool actually supports before adding it to your workflow.</p><div className="mt-6 space-y-4"><Link href="/intelligence?category=tools_technology&days=30" className="block rounded-xl border border-border bg-card p-4 font-semibold text-primary">Technology coverage in the dashboard →</Link><a href="https://help.shopify.com/en/manual/ai-powered-tools/sidekick" className="block rounded-xl border border-border bg-card p-4 font-semibold text-primary">Shopify Sidekick documentation ↗</a><a href="https://sell.amazon.com/blog/amazon-listing-ai" className="block rounded-xl border border-border bg-card p-4 font-semibold text-primary">Amazon’s AI listing guide ↗</a></div></div>
      </section>
      <section id="pilot" aria-labelledby="pilot-title" className="scroll-mt-44 border-t border-border py-12"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="editorial-eyebrow">A practical starting point</p><h2 id="pilot-title" className="mt-3 text-3xl font-bold sm:text-4xl">Your first 30-day AI pilot.</h2><p className="mt-4 max-w-2xl text-lg text-muted-foreground">A suggested sequence, not a promise of results. Keep the first project narrow enough to learn from.</p></div><a href="/downloads/ai-workflow-pilot.md" download className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold text-primary"><Download className="h-5 w-5"/>Download the worksheet</a></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{plan.map(p=><div key={p.week} className="editorial-elevated rounded-2xl border border-border bg-card p-6"><p className="text-4xl font-bold text-primary/60">{p.week}</p><h3 className="mt-5 text-xl font-bold">{p.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{p.text}</p></div>)}</div></section>
      <section aria-label="Related and the Brief" className="border-t border-border py-12"><AiRelatedLinks links={aiHubRelatedLinks()} className=""/><BriefCta source={AI_HUB_SOURCE} heading={AI_BRIEF_HEADING} body={AI_BRIEF_BODY}/></section>
      <section id="work-together" aria-labelledby="consulting-title" className="my-8 scroll-mt-44 rounded-3xl border border-blue-800 bg-slate-950 p-6 text-white sm:p-10"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">From reading to implementation</p><h2 id="consulting-title" className="mt-5 text-3xl font-bold sm:text-4xl">Bring a workflow.<br/>Start a useful conversation.</h2><p className="mt-5 leading-8 text-slate-300">Exploring AI for your ecommerce team? Tell us where work gets stuck, what tools you use, and what a better result would look like.</p><ul className="mt-7 space-y-4 text-slate-300">{['Map a repeatable process','Identify the data and review steps','Define a small, measurable pilot'].map(t=><li key={t} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300"/>{t}</li>)}</ul><p className="mt-7 text-sm leading-6 text-slate-400">An inquiry starts a discussion about fit and scope. It does not book a service or commit you to a purchase.</p></div><SponsorInquiryForm sourcePage="ai"/></div></section>
    </main><PremiumSiteFooter/>
  </div>
}
