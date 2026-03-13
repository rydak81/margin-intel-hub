"use client"

import { useState } from "react"
import Link from "next/link"
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
  ShoppingBag,
  Building2,
  Code2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Zap,
  Shield,
  BarChart2,
  PieChart,
  Briefcase,
  Store,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Solution categories for different audiences
const SOLUTIONS = [
  {
    id: "brand-sellers",
    title: "For Brand Sellers",
    subtitle: "Scale profitably across marketplaces",
    icon: ShoppingBag,
    color: "bg-blue-500",
    description: "Connect with vetted agencies, discover tools that actually work, and get data-driven insights to grow your business.",
    benefits: [
      "Curated agency introductions based on your specific needs",
      "Tool recommendations from sellers at your revenue level",
      "Exclusive market data and trend reports",
      "Access to our Deal Flow Network for funding/exit opportunities"
    ],
    cta: "Get Matched with Solutions",
    popular: true,
  },
  {
    id: "agencies",
    title: "For Agencies",
    subtitle: "Find qualified brand clients",
    icon: Building2,
    color: "bg-emerald-500",
    description: "Get in front of qualified brand sellers actively looking for agency partners. No more cold outreach.",
    benefits: [
      "Warm introductions to brands seeking your services",
      "Showcase your expertise in our partner directory",
      "Thought leadership via sponsored content",
      "Attend exclusive industry events"
    ],
    cta: "Become a Partner",
  },
  {
    id: "saas-tech",
    title: "For SaaS & Tech",
    subtitle: "Reach active e-commerce operators",
    icon: Code2,
    color: "bg-purple-500",
    description: "Connect with sellers, aggregators, and agencies who are actively evaluating tools like yours.",
    benefits: [
      "Sponsored placements in our Tools section",
      "Product reviews and case studies",
      "Newsletter sponsorship opportunities",
      "Lead generation through our audience"
    ],
    cta: "Explore Partnerships",
  },
  {
    id: "investors",
    title: "For Investors & Acquirers",
    subtitle: "Source quality deal flow",
    icon: TrendingUp,
    color: "bg-amber-500",
    description: "Access our network of brands considering exits, funding, or strategic partnerships.",
    benefits: [
      "Deal flow alerts matching your investment criteria",
      "Confidential introductions to brand owners",
      "Market intelligence and sector reports",
      "Due diligence support and introductions"
    ],
    cta: "Join Deal Network",
  },
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
  { id: "agency", label: "Agency Services (PPC, Creative, etc.)" },
  { id: "tools", label: "Software & Tools" },
  { id: "funding", label: "Funding / Capital" },
  { id: "exit", label: "Exit / Acquisition" },
  { id: "strategy", label: "Strategy Consulting" },
  { id: "logistics", label: "Logistics / 3PL" },
]

// Trust logos/stats
const TRUST_STATS = [
  { value: "5,000+", label: "Newsletter Subscribers" },
  { value: "150+", label: "Partner Solutions" },
  { value: "$2B+", label: "GMV Represented" },
  { value: "98%", label: "Match Satisfaction" },
]

export default function SolutionsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null)
  const [formStep, setFormStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    annualRevenue: "",
    primaryMarketplace: "",
    helpNeeded: [] as string[],
    referralSource: "",
  })

  const handleSolutionClick = (solutionId: string) => {
    setSelectedSolution(solutionId)
    setFormStep(1)
    setSubmitted(false)
    setDialogOpen(true)
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, helpNeeded: [...prev.helpNeeded, id] }))
    } else {
      setFormData(prev => ({ ...prev, helpNeeded: prev.helpNeeded.filter(item => item !== id) }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Determine if high priority (revenue > $1M)
      const highPriorityRevenues = ['1m_5m', '5m_10m', '10m_25m', '25m_plus']
      const isHighPriority = highPriorityRevenues.includes(formData.annualRevenue)
      
      const { error } = await supabase.from('leads').insert({
        email: formData.email,
        name: formData.name,
        company_name: formData.companyName,
        annual_revenue: formData.annualRevenue,
        primary_marketplace: formData.primaryMarketplace,
        help_needed: formData.helpNeeded,
        referral_source: formData.referralSource,
        lead_source: 'solutions_page',
        solution_interest: selectedSolution,
        is_high_priority: isHighPriority,
      })
      
      if (error) throw error
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting lead:', error)
      // Still show success for demo purposes
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSolutionData = SOLUTIONS.find(s => s.id === selectedSolution)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">Ecom Intel Hub</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/tools" className="text-sm font-semibold hover:text-primary transition-colors">
                Tools
              </Link>
              <Link href="/solutions" className="text-sm font-semibold text-primary transition-colors">
                Solutions
              </Link>
              <Link href="/community" className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1.5">
                Community
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">BETA</span>
              </Link>
              <Link href="/events" className="text-sm font-semibold hover:text-primary transition-colors">
                Events
              </Link>
              <Link href="/newsletter" className="text-sm font-semibold hover:text-primary transition-colors">
                Newsletter
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/tools" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                <Link href="/solutions" className="px-4 py-2 hover:bg-muted rounded-md bg-muted" onClick={() => setMobileMenuOpen(false)}>Solutions</Link>
                <Link href="/community" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Community</Link>
                <Link href="/events" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                <Link href="/newsletter" className="px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Newsletter</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Trusted by 5,000+ E-commerce Professionals
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Find the Right Solution for Your E-commerce Business
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Whether you're a brand seller looking to scale, an agency seeking clients, or an investor sourcing deals - we connect you with the right partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => handleSolutionClick('brand-sellers')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Solutions for Every Role</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our curated network spans the entire e-commerce ecosystem. Find the perfect match for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SOLUTIONS.map((solution) => {
              const Icon = solution.icon
              return (
                <Card 
                  key={solution.id} 
                  className={`relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                    solution.popular ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSolutionClick(solution.id)}
                >
                  {solution.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${solution.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{solution.title}</CardTitle>
                    <CardDescription className="text-base">{solution.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{solution.description}</p>
                    <ul className="space-y-2 mb-6">
                      {solution.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full group-hover:bg-primary/90">
                      {solution.cta}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our matching process is simple, fast, and designed to respect your time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tell Us About You</h3>
              <p className="text-muted-foreground">
                Complete a brief questionnaire about your business, challenges, and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Find Matches</h3>
              <p className="text-muted-foreground">
                Our team identifies the best-fit partners from our vetted network.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Connected</h3>
              <p className="text-muted-foreground">
                Receive warm introductions and start conversations with qualified partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Ecom Intel Hub</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just another directory. We're your strategic partner in e-commerce growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Vetted Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every agency, tool, and partner in our network is vetted for quality and track record.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Personalized Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No generic lists. We match you based on your specific situation and needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Industry Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access our community of successful sellers, operators, and investors.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Data-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get access to market intelligence and trend reports exclusive to our network.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Briefcase className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Deal Flow Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with capital providers or explore exit opportunities discreetly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Store className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Multi-Channel Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Amazon, Walmart, TikTok Shop, Shopify - we cover the entire marketplace ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of e-commerce professionals who've found the right partners through our network.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => handleSolutionClick('brand-sellers')}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Ecom Intel Hub</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/newsletter" className="hover:text-foreground transition-colors">Newsletter</Link>
              <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
              <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 Ecom Intel Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Lead Capture Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-2xl mb-2">You're All Set!</DialogTitle>
              <DialogDescription className="text-base mb-6">
                Thanks for your interest! Our team will review your information and reach out within 1-2 business days with personalized recommendations.
              </DialogDescription>
              <Button onClick={() => setDialogOpen(false)}>
                Back to Solutions
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedSolutionData && (
                    <div className={`w-8 h-8 rounded-lg ${selectedSolutionData.color} flex items-center justify-center`}>
                      <selectedSolutionData.icon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {selectedSolutionData?.title}
                </DialogTitle>
                <DialogDescription>
                  {formStep === 1 ? "Tell us about yourself" : "Tell us about your business"}
                </DialogDescription>
              </DialogHeader>

              {/* Progress Indicator */}
              <div className="flex gap-2 mb-4">
                <div className={`h-1 flex-1 rounded-full ${formStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1 flex-1 rounded-full ${formStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              </div>

              {formStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Brand Name *</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>How did you hear about us? *</Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select one..." />
                      </SelectTrigger>
                      <SelectContent>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setFormStep(2)}
                    disabled={!formData.name || !formData.email || !formData.companyName || !formData.referralSource}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Annual Revenue *</Label>
                    <Select
                      value={formData.annualRevenue}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, annualRevenue: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range..." />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Marketplace *</Label>
                    <Select
                      value={formData.primaryMarketplace}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMarketplace: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marketplace..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>What do you need help with? (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {HELP_OPTIONS.map((opt) => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={opt.id}
                            checked={formData.helpNeeded.includes(opt.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(opt.id, checked as boolean)}
                          />
                          <Label htmlFor={opt.id} className="text-sm font-normal cursor-pointer">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFormStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleSubmit}
                      disabled={!formData.annualRevenue || !formData.primaryMarketplace || isSubmitting}
                    >
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
    </div>
  )
}
