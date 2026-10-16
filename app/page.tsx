import HomePageClient from "@/components/home-page-client"
import { loadHomepageData } from "@/lib/homepage-data"
import { JsonLd } from "@/components/json-ld"

const SITE_URL = "https://marketplacebeta.com"

const homepageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "MarketplaceBeta",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-192.png`,
    description: "Marketplace seller fee data, tools, and news for Amazon, Walmart, TikTok Shop, eBay, and Etsy operators.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "MarketplaceBeta",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  },
]

export const metadata = {
  title: 'Marketplace Seller Fees 2026: Amazon, Walmart, TikTok Shop, eBay & Etsy | MarketplaceBeta',
  description: 'Compare Amazon, Walmart, TikTok Shop, eBay and Etsy seller fees by category, calculate your margin, and follow the marketplace news that changes them. Free fee tables updated monthly.',
  alternates: { canonical: 'https://marketplacebeta.com' },
}

export const revalidate = 300

export default async function HomePage() {
  const { initialArticles, initialBreakingNews } = await loadHomepageData()

  return (
    <>
      <JsonLd data={homepageJsonLd} />
      <HomePageClient
        initialArticles={initialArticles}
        initialBreakingNews={initialBreakingNews}
      />
    </>
  )
}
