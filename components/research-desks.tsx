import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { RESEARCH_DESKS } from "@/lib/site-navigation"

export function ResearchDesks({ compact = false }: { compact?: boolean }) {
  return <section aria-label="Research by business decision" className="research-desks my-10 border-y border-border py-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="editorial-eyebrow">The research desk</p><h2 className="mt-2 text-2xl font-semibold">Start with the decision you need to make.</h2></div>
      {!compact && <Link href="/articles" className="text-sm font-semibold text-primary">Explore the archive →</Link>}
    </div>
    <div className={`grid gap-px overflow-hidden rounded-xl border border-border bg-border ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {RESEARCH_DESKS.map(desk => <a key={desk.category} href={`/articles?category=${desk.category}`} className="group min-w-0 bg-card p-5 transition-colors hover:bg-secondary">
        <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold">{desk.title}</h3><ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-primary" /></div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{compact ? desk.question : desk.description}</p>
      </a>)}
    </div>
  </section>
}
