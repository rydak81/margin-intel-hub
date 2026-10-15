import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Daily Marketplace Brief | MarketplaceBeta',
  description: 'Subscribe to marketplace developments, fee changes, and operator context from MarketplaceBeta. Read the intelligence dossier before joining. Unsubscribe anytime.',
  alternates: { canonical: '/newsletter' },
}

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children
}
