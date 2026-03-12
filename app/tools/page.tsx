"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfitCalculator } from "@/components/profit-calculator"
import { ListingOptimizer } from "@/components/listing-optimizer"
import { KeywordTrends } from "@/components/keyword-trends"
import { TrendingProducts } from "@/components/trending-products"
import {
  Calculator,
  FileText,
  Search,
  TrendingUp,
  Menu,
  X,
  ArrowLeft,
  BarChart3,
  Wrench,
  Mail,
} from "lucide-react"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("calculator")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const tabMap: Record<string, string> = {
        profit: "calculator",
        listing: "listing",
        keywords: "keywords",
        products: "trending",
      }
      if (tabMap[hash]) {
        setActiveTab(tabMap[hash])
      }
    }
  }, [])

  const tabs = [
    {
      id: "calculator",
      label: "Profit Calculator",
      icon: Calculator,
      description: "Detailed profitability analysis with COGS, fees, and projections"
    },
    {
      id: "listing",
      label: "Listing Optimizer",
      icon: FileText,
      description: "Optimize your Amazon listings for maximum visibility"
    },
    {
      id: "keywords",
      label: "Keyword Research",
      icon: Search,
      description: "Discover keywords, track indexing, and analyze trends"
    },
    {
      id: "trending",
      label: "Hot Products",
      icon: TrendingUp,
      description: "Find trending products from multiple data sources"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:block">Ecom Intel Hub</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                <Link href="/" className="text-base font-semibold hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/tools" className="text-base font-semibold text-primary">
                  Tools
                </Link>
                <Link href="/events" className="text-base font-semibold hover:text-primary transition-colors">
                  Events
                </Link>
                <Link href="/newsletter" className="text-base font-semibold hover:text-primary transition-colors">
                  Newsletter
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to News
                </Link>
              </Button>
              <Button asChild className="hidden sm:flex">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background md:hidden">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{tab.label}</p>
                  <p className={`text-sm ${activeTab === tab.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Badge variant="outline" className="mb-4">
            <Wrench className="h-3 w-3 mr-1" />
            Free Seller Tools
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Seller Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Free professional tools for Amazon sellers and e-commerce operators. 
            Calculate profits, optimize listings, research keywords, and discover trending products.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Feature Cards - Desktop Only */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                activeTab === tab.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent bg-card hover:bg-muted/50 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <tab.icon className="h-4 w-4" />
                </div>
                <span className="font-semibold">{tab.label}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{tab.description}</p>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-background">
          {activeTab === "calculator" && (
            <div id="profit">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Calculator className="h-7 w-7 text-primary" />
                    Deal Calculator
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive profitability analysis with COGS, Amazon fees, and margin scoring
                  </p>
                </div>
              </div>
              <ProfitCalculator />
            </div>
          )}

          {activeTab === "listing" && (
            <div id="listing">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="h-7 w-7 text-primary" />
                    Listing Optimizer
                  </h2>
                  <p className="text-muted-foreground">
                    Optimize your Amazon listing for better rankings and conversions
                  </p>
                </div>
              </div>
              <ListingOptimizer />
            </div>
          )}

          {activeTab === "keywords" && (
            <div id="keywords">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Search className="h-7 w-7 text-primary" />
                    Keyword Research & Trends
                  </h2>
                  <p className="text-muted-foreground">
                    Discover high-value keywords, track indexing, and analyze search trends
                  </p>
                </div>
              </div>
              <KeywordTrends />
            </div>
          )}

          {activeTab === "trending" && (
            <div id="products">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending & Hot Products
                  </h2>
                  <p className="text-muted-foreground">
                    Discover trending products from Amazon, TikTok Shop, Google Trends, and more
                  </p>
                </div>
              </div>
              <TrendingProducts />
            </div>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 p-8 rounded-xl bg-primary text-primary-foreground text-center">
          <Mail className="h-10 w-10 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Get Daily E-commerce Insights</h3>
          <p className="text-primary-foreground/80 mb-4 max-w-md mx-auto">
            Join 5,000+ sellers who get the daily marketplace brief with news, tips, and tool updates.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/newsletter">
              Subscribe for Free
              <Mail className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Ecom Intel Hub - Seller Tools</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>All calculations are estimates and should be verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
