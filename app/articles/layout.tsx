import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Marketplace News Archive & Search | MarketplaceBeta',
  description: 'Search marketplace news by platform, topic, and date. Research Amazon, Walmart, Etsy, TikTok Shop, logistics, advertising, and seller operations.',
  alternates: { canonical: 'https://marketplacebeta.com/articles' },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
