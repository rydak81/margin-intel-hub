import type { Metadata } from 'next'
import { EmbedFeeCalculator } from '@/components/embed-fee-calculator'

export const metadata: Metadata = {
  title: 'Marketplace Fee Calculator (embed) | MarketplaceBeta',
  robots: { index: false, follow: true },
  alternates: { canonical: '/tools' },
}

// Minimal, iframe-friendly page: no site header/footer. Framing is allowed for
// /embed/* only (see headers() in next.config.mjs).
export default function EmbedFeeCalculatorPage() {
  return <main className="min-h-0 bg-white"><EmbedFeeCalculator /></main>
}
