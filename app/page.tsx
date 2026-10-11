import HomePageClient from "@/components/home-page-client"
import { loadHomepageData } from "@/lib/homepage-data"

export const metadata = {
  title: 'Marketplace News & Ecommerce Operator Intelligence | MarketplaceBeta',
  description: 'Follow marketplace news, explore ecommerce intelligence, and use practical guides to evaluate fees, profitability, advertising, and multichannel operations.',
  alternates: { canonical: 'https://marketplacebeta.com' },
}

export const revalidate = 300

export default async function HomePage() {
  const { initialArticles, initialBreakingNews } = await loadHomepageData()

  return (
    <HomePageClient
      initialArticles={initialArticles}
      initialBreakingNews={initialBreakingNews}
    />
  )
}
