import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Ecommerce Seller Tools & Profit Calculator | MarketplaceBeta',
  description: 'Use ecommerce scenario tools to examine product profitability, marketplace fees, listings, and keyword research.',
  alternates: { canonical: 'https://marketplacebeta.com/tools' },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
