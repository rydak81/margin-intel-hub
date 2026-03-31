"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Sparkles,
  Zap,
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.76))] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Link href="/" className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
                  <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={32} height={32} className="relative h-8 w-8 rounded-lg object-cover ring-1 ring-sky-400/20" />
                </div>
                <div className="hidden sm:block">
                  <span className="block text-lg font-bold leading-none text-white">MarketplaceBeta</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">Operator Tool Suite</span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/articles" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Articles
              </Link>
              <Link href="/partners" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Partners
              </Link>
              <Link href="/tools" className="text-sm font-semibold text-white">
                Tools
              </Link>
              <Link href="/community" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Community
              </Link>
              <Link href="/events" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Events
              </Link>
              <Link href="/newsletter" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Newsletter
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button asChild className="hidden sm:flex border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/16"
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
        <div className="fixed inset-0 top-14 z-40 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] md:hidden">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-slate-950"
                    : "border border-white/10 bg-white/6 text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{tab.label}</p>
                  <p className={`text-sm ${activeTab === tab.id ? "text-slate-600" : "text-white/60"}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      <section className="relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_18%),linear-gradient(180deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <Zap className="h-4 w-4 text-sky-500" />
              <span className="text-muted-foreground">
                Operator-grade tools for <span className="font-semibold text-foreground">profitability, listings, keywords, and product discovery</span>
              </span>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
              Premium Tool Suite for Marketplace Teams
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
              Free tools built for{" "}
              <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                smarter operator decisions
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg text-slate-600 md:text-xl md:leading-8 dark:text-slate-300">
              Calculate profitability, optimize listings, research keywords, and spot trending products with a cleaner
              workflow built for Amazon sellers, agencies, and e-commerce operators.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Calculator, label: "Profit Modeling", value: "Amazon deal math" },
                { icon: FileText, label: "Listing Optimization", value: "Visibility + conversion" },
                { icon: Search, label: "Keyword Research", value: "Trends + indexing" },
                { icon: TrendingUp, label: "Hot Products", value: "Signal across sources" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <item.icon className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{item.label}</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Feature Cards - Desktop Only */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[24px] border p-4 text-left transition-all ${
                activeTab === tab.id
                  ? "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(55,48,163,0.86))] text-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.65)]"
                  : "border-white/60 bg-white/82 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/94 dark:border-white/10 dark:bg-slate-950/45"
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
        <div className="rounded-[30px] border border-white/60 bg-white/82 p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 md:p-6">
          {activeTab === "calculator" && (
            <div id="profit">
              <div className="mb-6 rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.74))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))]">
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
              <div className="mb-6 rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.74))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))]">
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
              <div className="mb-6 rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.74))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))]">
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
              <div className="mb-6 rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.74))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))]">
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
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94)_52%,rgba(55,48,163,0.9))] p-8 text-center text-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.68)]">
          <Mail className="h-10 w-10 mx-auto mb-4 text-sky-300" />
          <h3 className="text-2xl font-black mb-2">Get Daily E-commerce Insights</h3>
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
      <footer className="border-t border-white/10 mt-12 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
              <span className="text-sm text-white/68">MarketplaceBeta - Seller Tools</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/52">
              <span>All calculations are estimates and should be verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
