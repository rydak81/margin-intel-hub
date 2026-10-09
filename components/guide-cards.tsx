import Link from 'next/link'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
export function GuideCards() {
  return <div className="grid gap-6 md:grid-cols-3">{OPERATOR_GUIDES.map((guide, index) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="research-card editorial-elevated editorial-lift flex flex-col rounded-2xl border border-border bg-card p-6">
    <span className="research-index" aria-hidden="true">0{index + 1}</span>
    <p className="editorial-eyebrow">{guide.category}</p>
    <h2 className="mt-3 text-2xl font-bold leading-tight">{guide.title}</h2>
    <p className="mt-4 text-muted-foreground">{guide.description}</p>
    <span className="mt-auto pt-6 text-sm font-bold text-primary">{guide.readTime} read · Open guide →</span>
  </Link>)}</div>
}
