import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Wrench, 
  TrendingUp, 
  Search,
  ArrowRight,
  AlertCircle
} from "lucide-react"

// Trending articles to show on 404 page
const TRENDING_ARTICLES = [
  {
    id: "1",
    title: "Amazon Announces Major FBA Fee Changes for Q2 2026",
    category: "Platform Updates",
    source: "Digital Commerce 360",
  },
  {
    id: "2", 
    title: "TikTok Shop GMV Exceeds $15B as Live Commerce Takes Off",
    category: "Market & Metrics",
    source: "Modern Retail",
  },
  {
    id: "3",
    title: "New Tariff Regulations Impact Cross-Border Sellers",
    category: "Industry",
    source: "Retail Dive",
  },
  {
    id: "4",
    title: "Walmart Marketplace Seller Count Reaches 200K Milestone",
    category: "Platform Updates",
    source: "PYMNTS",
  },
  {
    id: "5",
    title: "AI-Powered Listing Tools See 300% Adoption Increase",
    category: "Tools & Technology",
    source: "TechCrunch",
  },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">MarketplaceBeta</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          {/* 404 Message */}
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page doesn&apos;t exist — but here&apos;s what&apos;s trending today
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/tools">
                <Wrench className="h-4 w-4 mr-2" />
                Explore Tools
              </Link>
            </Button>
          </div>

          {/* Trending Articles */}
          <div className="text-left">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Now
            </h2>
            <div className="space-y-3">
              {TRENDING_ARTICLES.map((article, index) => (
                <Link key={article.id} href="/">
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-start gap-4">
                      <span className="text-2xl font-bold text-muted-foreground/50 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {article.source}
                          </span>
                        </div>
                        <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Search Suggestion */}
          <Card className="mt-8 border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Looking for something specific? Try searching on the homepage.
              </p>
              <Button variant="outline" asChild>
                <Link href="/">
                  Go to Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
