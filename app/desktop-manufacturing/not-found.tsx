import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
export default function RetiredManufacturingReport() {
  return <div className="min-h-screen bg-background"><PremiumSiteHeader/><main className="mx-auto max-w-3xl px-6 py-20"><p className="editorial-eyebrow">Coverage update</p><h1 className="mt-4 text-4xl font-bold">The manufacturing desk has retired.</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">This report is no longer available here. MarketplaceBeta now focuses on ecommerce intelligence and practical AI workflows for operators.</p><Link href="/ai" className="mt-8 inline-block rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground">Explore AI for Operators →</Link></main><PremiumSiteFooter/></div>
}
