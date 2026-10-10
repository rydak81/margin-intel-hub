"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditorialIntro } from "@/components/editorial-intro"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { SiteBrand } from "@/components/site-brand"
import { ProfitCalculator } from "@/components/profit-calculator"
import { SalesForecaster } from "@/components/sales-forecaster"
import { ListingOptimizer } from "@/components/listing-optimizer"
import { KeywordTrends } from "@/components/keyword-trends"
import { TrendingProducts } from "@/components/trending-products"
import {
  Calculator,
  FileText,
  Search,
  TrendingUp,
  BarChart3,
  Wrench,
  Mail,
  Sparkles,
  Zap,
  LineChart,
} from "lucide-react"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("calculator")

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const tabMap: Record<string, string> = {
        profit: "calculator",
        listing: "listing",
        keywords: "keywords",
        products: "trending",
        forecast: "forecast",
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
    },
    {
      id: "forecast",
      label: "Sales Forecaster",
      icon: LineChart,
      description: "Probabilistic 12-month unit forecast from your own sales history"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="tools" deskLabel="Operator Tool Suite" backHref="/" backLabel="Home" />

      <div className="mx-auto site-width px-4 pt-10 sm:px-6">
        <EditorialIntro eyebrow="Operator tools" title="Put the numbers to work." description="Model profitability, compare scenarios, and evaluate your next operating decision. Calculations are estimates; verify inputs against your own costs." />
        <p className="mt-5 text-muted-foreground">Need a worked example? <Link href="/guides" className="font-semibold text-primary underline underline-offset-4">Explore the operator guides and free worksheets →</Link></p>
        <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">Keyword Research and Hot Products use modeled preview signals, not measured live demand. Profit Calculator and Listing Optimizer are available below.</p>
      </div>

      {/* Main Content */}
      <main className="site-width mx-auto px-4 py-8">
        {/* Feature Cards - Desktop Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`editorial-lift tool-selector rounded-xl border p-4 text-left transition-all ${
                activeTab === tab.id
                  ? "border-white/10 bg-slate-950 text-white editorial-elevated"
                  : "border-border bg-white editorial-elevated hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/94 dark:border-white/10 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`rounded-xl p-2 ${activeTab === tab.id ? "bg-white/12 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}>
                  <tab.icon className="h-4 w-4" />
                </div>
                <span className="font-semibold">{tab.label}</span>
              </div>
              <p className={`text-sm line-clamp-2 ${activeTab === tab.id ? "text-white/72" : "text-muted-foreground"}`}>{tab.description}</p>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-border bg-white p-5 editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900 md:p-6">
          {activeTab === "calculator" && (
            <div id="profit">
              <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Calculator className="h-7 w-7 text-primary" />
                    Deal Calculator
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Comprehensive profitability analysis with COGS, Amazon fees, and margin scoring
                  </p>
                </div>
              </div>
              <ProfitCalculator />
            </div>
          )}

          {activeTab === "listing" && (
            <div id="listing">
              <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="h-7 w-7 text-primary" />
                    Listing Optimizer
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Optimize your Amazon listing for better rankings and conversions
                  </p>
                </div>
              </div>
              <ListingOptimizer />
            </div>
          )}

          {activeTab === "keywords" && (
            <div id="keywords">
              <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Search className="h-7 w-7 text-primary" />
                    Keyword Research & Trends
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Discover high-value keywords, track indexing, and analyze search trends
                  </p>
                </div>
              </div>
              <KeywordTrends />
            </div>
          )}

          {activeTab === "trending" && (
            <div id="products">
              <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending & Hot Products
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Discover trending products from Amazon, TikTok Shop, Google Trends, and more
                  </p>
                </div>
              </div>
              <TrendingProducts />
            </div>
          )}

          {activeTab === "forecast" && (
            <div id="forecast">
              <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <LineChart className="h-7 w-7 text-primary" />
                    Sales Forecaster
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Holt-Winters + Monte Carlo forecasting fitted to your own sales history — with honest uncertainty bands
                  </p>
                </div>
              </div>
              <SalesForecaster />
            </div>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 rounded-xl border border-white/10 bg-slate-950 p-8 text-center text-white editorial-elevated">
          <Mail className="h-10 w-10 mx-auto mb-4 text-sky-300" />
          <h3 className="text-2xl font-bold mb-2">Get Daily E-commerce Insights</h3>
          <p className="text-white/72 mb-6 max-w-xl mx-auto leading-7">
            Join sellers, operators, and partner teams who use the daily marketplace brief for news, tool updates, and sharper commercial decisions.
          </p>
          <Button asChild className="bg-white text-slate-950 hover:bg-white/92">
            <Link href="/newsletter">
              Subscribe for Free
              <Mail className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <PremiumSiteFooter />
    </div>
  )
}
