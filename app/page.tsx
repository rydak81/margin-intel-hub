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
    description: "Human-led ecommerce intelligence, amplified by AI: an AI-classified news archive, publicly graded forecasts, and evidence-labeled research — built by ecommerce operators for Amazon, Walmart, TikTok Shop, eBay, and Etsy sellers.",
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
  title: 'Ecommerce Marketplace Intelligence & Forecasts | MarketplaceBeta',
  description: 'Human-led ecommerce intelligence, amplified by AI: 8,541 articles from 54 sources AI-classified and counting, public forecasts graded as they resolve, and evidence labels on every claim — built by ecommerce operators for Amazon, Walmart, TikTok Shop, eBay and Etsy sellers.',
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
