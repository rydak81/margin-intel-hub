import Link from 'next/link'
import { ArrowUpRight, BookOpenText, Calculator, LayoutDashboard, Search } from 'lucide-react'
const destinations = [
  { href: '/intelligence', title: 'Your intelligence dashboard', detail: 'Follow your platforms. Save a view. Find your next check.', icon: LayoutDashboard, label: '01 / Get perspective' },
  { href: '/articles', title: 'Follow the evidence', detail: 'Search the archive and trace a story back to its source.', icon: Search, label: '02 / Go deeper' },
  { href: '/tools', title: 'Put numbers to the decision', detail: 'Explore costs and profitability with your own assumptions.', icon: Calculator, label: '03 / Model a scenario' },
  { href: '/guides', title: 'Build your operating playbook', detail: 'Worked examples and free worksheets to put into practice.', icon: BookOpenText, label: '04 / Take it with you' },
]
export function WorkspaceDiscovery() {
  return <section className="site-width mx-auto px-4 pt-12 sm:px-6" aria-labelledby="workspace-discovery-title"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="editorial-eyebrow">Keep exploring</p><h2 id="workspace-discovery-title" className="mt-2 text-3xl font-bold">A better next move starts here.</h2></div><span className="text-sm text-muted-foreground">News → context → decision</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{destinations.map(item => <Link key={item.href} href={item.href} className="workspace-card editorial-lift group relative rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><item.icon className="h-6 w-6 text-primary" /><ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none" /></div><p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p><h3 className="mt-2 text-xl font-bold leading-snug">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p></Link>)}</div></section>
}
