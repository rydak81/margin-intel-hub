"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  Menu,
  X,
  DollarSign,
  Globe,
  Layers,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Store,
  Loader2,
  Mail,
  Building2,
  ChevronDown,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Marketplace platform logos (using text placeholders for now)
const MARKETPLACE_LOGOS = [
  { name: "Amazon", color: "bg-orange-500" },
  { name: "Walmart", color: "bg-blue-600" },
  { name: "eBay", color: "bg-red-500" },
  { name: "TikTok Shop", color: "bg-black" },
  { name: "Google Shopping", color: "bg-green-500" },
  { name: "Meta Shops", color: "bg-blue-500" },
  { name: "Target+", color: "bg-red-600" },
  { name: "Wish", color: "bg-cyan-500" },
]

// Form options
const REVENUE_OPTIONS = [
  { value: "under_500k", label: "Under $500K" },
  { value: "500k_1m", label: "$500K - $1M" },
  { value: "1m_5m", label: "$1M - $5M" },
  { value: "5m_10m", label: "$5M - $10M" },
  { value: "10m_25m", label: "$10M - $25M" },
  { value: "25m_plus", label: "$25M+" },
]

const MARKETPLACE_OPTIONS = [
  { value: "amazon_3p", label: "Amazon 3P (Seller Central)" },
  { value: "amazon_1p", label: "Amazon 1P (Vendor Central)" },
  { value: "walmart", label: "Walmart Marketplace" },
  { value: "multi_channel", label: "Multi-Channel" },
  { value: "other", label: "Other" },
]

const REFERRAL_OPTIONS = [
  { value: "newsletter", label: "Newsletter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Google Search" },
  { value: "referral", label: "Referral" },
  { value: "event", label: "Industry Event" },
  { value: "other", label: "Other" },
]

const HELP_OPTIONS = [
  { id: "profit_recovery", label: "Profit Recovery" },
  { id: "multichannel", label: "Multichannel Expansion" },
  { id: "account_management", label: "Account Management" },
  { id: "ppc_advertising", label: "PPC/Advertising" },
  { id: "other", label: "Other" },
]

const SERVICE_TYPES = [
  { value: "ppc", label: "PPC Management" },
  { value: "listing", label: "Listing Optimization" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "brand_protection", label: "Brand Protection" },
  { value: "account_management", label: "Account Management" },
  { value: "international", label: "International Expansion" },
  { value: "creative", label: "Creative/Photography" },
]

export default function SolutionsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [leadModalStep, setLeadModalStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [currentSolution, setCurrentSolution] = useState<string>("")
  
  // Partner directory modals
  const [listingModalOpen, setListingModalOpen] = useState(false)
  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    companyName: "",
    annualRevenue: "",
    primaryMarketplace: "",
    helpNeeded: [] as string[],
    referralSource: "",
    serviceTypeNeeded: "",
  })

  const supabase = createClient()

  const openLeadModal = (solutionId: string) => {
    setCurrentSolution(solutionId)
    setLeadModalStep(1)
    setSubmitSuccess(false)
    setLeadModalOpen(true)
  }

  const handleHelpToggle = (helpId: string) => {
    setFormData(prev => ({
      ...prev,
      helpNeeded: prev.helpNeeded.includes(helpId)
        ? prev.helpNeeded.filter(h => h !== helpId)
        : [...prev.helpNeeded, helpId]
    }))
  }

  const handleSubmitLead = async () => {
    if (!formData.email || !formData.name || !formData.companyName) return

    setIsSubmitting(true)
    try {
      // Determine if high priority (Profit Recovery selected OR $5M+ revenue)
      const isHighPriority = formData.helpNeeded.includes("profit_recovery") || 
        ["5m_10m", "10m_25m", "25m_plus"].includes(formData.annualRevenue)

      const { error } = await supabase.from("leads").insert({
        email: formData.email,
        name: formData.name,
        company_name: formData.companyName,
        annual_revenue: formData.annualRevenue || "under_500k",
        primary_marketplace: formData.primaryMarketplace || "other",
        help_needed: formData.helpNeeded,
        referral_source: formData.referralSource || "other",
        lead_source: "solutions_page",
        solution_interest: currentSolution,
        is_high_priority: isHighPriority,
      })

      if (error) throw error

      setSubmitSuccess(true)
      // Reset form
      setFormData({
        email: "",
        name: "",
        companyName: "",
        annualRevenue: "",
        primaryMarketplace: "",
        helpNeeded: [],
        referralSource: "",
        serviceTypeNeeded: "",
      })
    } catch (error) {
      console.error("Error submitting lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePartnerDirectorySubmit = async (type: "listing" | "recommendation") => {
    if (!formData.email) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("leads").insert({
        email: formData.email,
        name: formData.name || "Not provided",
        company_name: formData.companyName || "Not provided",
        annual_revenue: formData.annualRevenue || "under_500k",
        primary_marketplace: formData.primaryMarketplace || "other",
        help_needed: formData.serviceTypeNeeded ? [formData.serviceTypeNeeded] : [],
        referral_source: "other",
        lead_source: type === "listing" ? "partner_directory_listing" : "partner_recommendation",
        solution_interest: type,
        is_high_priority: false,
      })

      if (error) throw error

      setSubmitSuccess(true)
      setFormData({
        email: "",
        name: "",
        companyName: "",
        annualRevenue: "",
        primaryMarketplace: "",
        helpNeeded: [],
        referralSource: "",
        serviceTypeNeeded: "",
      })
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.svg" alt="MarketplaceBeta logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold text-lg hidden sm:block">MarketplaceBeta</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Home</Link>
              <Link href="/tools" className="text-sm font-semibold hover:text-primary transition-colors">Tools</Link>
              <Link href="/solutions" className="text-sm font-semibold text-primary transition-colors">Solutions</Link>
              {/* Community hidden — launching later */}
              <Link href="/events" className="text-sm font-semibold hover:text-primary transition-colors">Events</Link>
              <Link href="/newsletter" className="text-sm font-semibold hover:text-primary transition-colors">Newsletter</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/tools" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                <Link href="/solutions" className="px-4 py-2 hover:bg-muted rounded-md bg-muted" onClick={() => setMobileMenuOpen(false)}>Solutions</Link>
                {/* Community hidden — launching later */}
                <Link href="/events" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                <Link href="/newsletter" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Newsletter</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
            Solutions for Marketplace Sellers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Curated tools and services to help you recover profits, expand to new channels, and scale your e-commerce business.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        
        {/* Section 1: Profit Recovery & Financial Tools */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Profit Recovery & Financial Tools</h2>
          </div>
          
          <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
            <div className="md:flex">
              <div className="flex-1 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                    Featured Partner
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">MarginPro by ThreeColts</h3>
                <p className="text-lg font-medium text-primary mb-4">Stop Leaving Money on the Table</p>
                
                <p className="text-muted-foreground mb-6">
                  MarginPro audits your Amazon 1P/3P, Walmart, Target+, and shipping carrier accounts to recover lost profits from overcharges, billing errors, and shortages. Most brands recover 1-3% of revenue.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Average Recovery</p>
                    <p className="text-2xl font-bold text-primary">1-3% of Revenue</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Supported Platforms</p>
                    <p className="text-sm font-medium">Amazon 1P, Amazon 3P, Walmart, Target+, Shipping Carriers</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {["FBA Overcharges", "Billing Errors", "Inventory Shortages", "Carrier Disputes"].map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>

                <Button size="lg" onClick={() => openLeadModal("marginpro")} className="gap-2">
                  Get a Free Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="md:w-80 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">No Risk</p>
                      <p className="text-sm text-muted-foreground">Pay only on recovered funds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Fast Results</p>
                      <p className="text-sm text-muted-foreground">See recoveries in 30-60 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Ongoing Monitoring</p>
                      <p className="text-sm text-muted-foreground">Continuous auditing & recovery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 2: Multichannel Expansion */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Multichannel Expansion</h2>
          </div>
          
          <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
            <div className="md:flex">
              <div className="flex-1 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                    Featured Partner
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">CedCommerce by ThreeColts</h3>
                <p className="text-lg font-medium text-primary mb-4">Sell Everywhere Your Customers Shop</p>
                
                <p className="text-muted-foreground mb-6">
                  CedCommerce connects your catalog to 100+ marketplaces worldwide. Manage listings, inventory, and orders from a single dashboard.
                </p>

                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Supported Marketplaces</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKETPLACE_LOGOS.map((platform) => (
                      <div key={platform.name} className={`${platform.color} text-white text-xs font-medium px-3 py-1.5 rounded-full`}>
                        {platform.name}
                      </div>
                    ))}
                    <div className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                      +90 more
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {["Centralized Inventory", "Bulk Listing", "Order Management", "Real-time Sync"].map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>

                <Button size="lg" onClick={() => openLeadModal("cedcommerce")} className="gap-2">
                  Start Multichannel Selling
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="md:w-80 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">100+ Channels</p>
                      <p className="text-sm text-muted-foreground">Global marketplace coverage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Layers className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Single Dashboard</p>
                      <p className="text-sm text-muted-foreground">Manage everything in one place</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Quick Integration</p>
                      <p className="text-sm text-muted-foreground">Go live in days, not weeks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: Seller Management Suite */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Seller Management Suite</h2>
          </div>
          
          <Card className="p-6 md:p-8">
            <div className="md:flex md:items-center md:justify-between gap-8">
              <div className="flex-1 mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Seller 365</h3>
                <p className="text-lg font-medium text-primary mb-4">All-in-One Seller Management</p>
                
                <p className="text-muted-foreground mb-4">
                  A comprehensive suite of tools for marketplace sellers including inventory management, analytics, repricing, and customer communication—all integrated into one powerful platform.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Inventory Management", "Analytics Dashboard", "Repricing Tools", "Customer Support"].map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button size="lg" variant="outline" onClick={() => openLeadModal("seller365")} className="gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Partner & Agency Directory */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Partner & Agency Directory</h2>
            <Badge variant="outline" className="ml-2">Coming Soon</Badge>
          </div>
          
          <Card className="p-6 md:p-8 bg-muted/30">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Find Trusted Partners for Your Business</h3>
              <p className="text-muted-foreground">
                We're building the most comprehensive directory of e-commerce service partners—agencies, consultants, and service providers vetted by the community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Want to be listed */}
              <Card className="p-6 border-dashed">
                <h4 className="font-semibold mb-2">Want to be listed?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you're an agency or service provider, join our directory to connect with brands looking for your expertise.
                </p>
                <Button variant="outline" className="w-full" onClick={() => {
                  setSubmitSuccess(false)
                  setListingModalOpen(true)
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Get Notified When We Launch
                </Button>
              </Card>

              {/* Looking for a partner */}
              <Card className="p-6 border-dashed">
                <h4 className="font-semibold mb-2">Looking for a partner recommendation?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell us what you need and we'll connect you with trusted partners from our network.
                </p>
                <Button variant="outline" className="w-full" onClick={() => {
                  setSubmitSuccess(false)
                  setPartnerModalOpen(true)
                }}>
                  <Users className="h-4 w-4 mr-2" />
                  Request a Recommendation
                </Button>
              </Card>
            </div>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/icon.svg" alt="MarketplaceBeta logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold">MarketplaceBeta</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your source for e-commerce industry intelligence
            </p>
          </div>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent className="sm:max-w-md">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl mb-2">Thank You!</DialogTitle>
              <DialogDescription>
                We've received your information and will be in touch within 1-2 business days.
              </DialogDescription>
              <Button className="mt-6" onClick={() => setLeadModalOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {leadModalStep === 1 ? "Get Started" : "Almost There!"}
                </DialogTitle>
                <DialogDescription>
                  {leadModalStep === 1 
                    ? "Tell us about yourself so we can connect you with the right solution."
                    : "Just a few more details to personalize your experience."
                  }
                </DialogDescription>
              </DialogHeader>

              {leadModalStep === 1 ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      placeholder="Your company"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setLeadModalStep(2)}
                    disabled={!formData.email || !formData.name || !formData.companyName}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Annual Marketplace Revenue</Label>
                    <Select
                      value={formData.annualRevenue}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, annualRevenue: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Marketplace</Label>
                    <Select
                      value={formData.primaryMarketplace}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMarketplace: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marketplace" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>What do you need help with?</Label>
                    <div className="space-y-2">
                      {HELP_OPTIONS.map((opt) => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={opt.id}
                            checked={formData.helpNeeded.includes(opt.id)}
                            onCheckedChange={() => handleHelpToggle(opt.id)}
                          />
                          <label htmlFor={opt.id} className="text-sm cursor-pointer">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>How did you hear about us?</Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setLeadModalStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleSubmitLead} disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Listing Request Modal */}
      <Dialog open={listingModalOpen} onOpenChange={setListingModalOpen}>
        <DialogContent className="sm:max-w-md">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl mb-2">You're on the List!</DialogTitle>
              <DialogDescription>
                We'll notify you as soon as the Partner Directory launches.
              </DialogDescription>
              <Button className="mt-6" onClick={() => setListingModalOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Join the Partner Directory</DialogTitle>
                <DialogDescription>
                  Enter your email to get notified when we launch the directory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="listing-email">Email *</Label>
                  <Input
                    id="listing-email"
                    type="email"
                    placeholder="you@agency.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listing-company">Company Name</Label>
                  <Input
                    id="listing-company"
                    placeholder="Your agency or company"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handlePartnerDirectorySubmit("listing")}
                  disabled={!formData.email || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Notify Me"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Partner Recommendation Modal */}
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent className="sm:max-w-md">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl mb-2">Request Received!</DialogTitle>
              <DialogDescription>
                We'll review your needs and send you partner recommendations within 2-3 business days.
              </DialogDescription>
              <Button className="mt-6" onClick={() => setPartnerModalOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Request a Partner Recommendation</DialogTitle>
                <DialogDescription>
                  Tell us what you're looking for and we'll connect you with the right partners.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email *</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-company">Company Name</Label>
                  <Input
                    id="partner-company"
                    placeholder="Your company"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>What type of service do you need?</Label>
                  <Select
                    value={formData.serviceTypeNeeded}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceTypeNeeded: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handlePartnerDirectorySubmit("recommendation")}
                  disabled={!formData.email || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
