import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Ecommerce & Marketplace Industry Events | MarketplaceBeta',
  description: 'Explore ecommerce and marketplace industry events for sellers, agencies, and technology teams.',
  alternates: { canonical: 'https://marketplacebeta.com/events' },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
