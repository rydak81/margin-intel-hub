import type { Metadata } from 'next'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { IntelligenceDashboard } from '@/components/intelligence-dashboard'
import { loadIntelligenceSnapshot } from '@/lib/intelligence-data'
export const revalidate = 300
export const metadata: Metadata = {
  title: 'Ecommerce intelligence dashboard | MarketplaceBeta',
  description: 'Explore recent marketplace news by platform, audience, and operating topic. Source-linked context for sellers, agencies, technology companies, and logistics operators.',
  alternates: { canonical: '/intelligence' },
}
export default async function IntelligencePage() {
  const snapshot = await loadIntelligenceSnapshot()
  return <div className="min-h-screen bg-background"><PremiumSiteHeader active="intelligence" /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><IntelligenceDashboard snapshot={snapshot} /></main><PremiumSiteFooter /></div>
}
