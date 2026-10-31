import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'

const toolsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'MarketplaceBeta seller tools',
  itemListElement: [
    ['Marketplace Profit Calculator', 'https://marketplacebeta.com/tools#profit', 'Calculate per-unit profit after marketplace fees, fulfillment and landed cost.'],
    ['Sales Forecaster', 'https://marketplacebeta.com/tools#forecast', 'Project marketplace sales from historical trends.'],
    ['Listing Optimizer', 'https://marketplacebeta.com/tools#listing', 'Score and improve marketplace product listings.'],
    ['Keyword Trends', 'https://marketplacebeta.com/tools#keywords', 'Explore ecommerce keyword trends.'],
  ].map(([name, url, description], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'SoftwareApplication',
      name,
      url,
      description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  })),
}
export const metadata: Metadata = {
  title: 'Ecommerce Seller Tools & Profit Calculator | MarketplaceBeta',
  description: 'Use ecommerce scenario tools to examine product profitability, marketplace fees, listings, and keyword research.',
  alternates: { canonical: 'https://marketplacebeta.com/tools' },
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={toolsJsonLd} />
      {children}
    </>
  )
}
