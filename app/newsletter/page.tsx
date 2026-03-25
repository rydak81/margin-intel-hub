"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  Mail,
  Check,
  Clock,
  Users,
  Zap,
  ArrowLeft,
  Loader2,
  Building,
  ShoppingBag,
  Wrench,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
} from "lucide-react"

const ROLES = [
  { id: "brand_seller", label: "Brand / Seller", icon: ShoppingBag },
  { id: "agency", label: "Agency", icon: Building },
  { id: "saas_tech", label: "SaaS / Tech", icon: Wrench },
  { id: "investor", label: "Investor", icon: TrendingUp },
  { id: "service_provider", label: "Service Provider", icon: Briefcase },
  { id: "other", label: "Other", icon: MoreHorizontal },
]

const FEATURES = [
  "Breaking news from Amazon, Walmart, TikTok Shop & more",
  "Fee changes and policy updates that affect your bottom line",
  "M&A activity and funding rounds in the ecosystem",
  "Actionable tactics from top sellers and experts",
  "Tool recommendations and platform updates",
  "Weekly market data and trend analysis",
]

const SOCIAL_PROOF = [
  { metric: "5,000+", label: "Subscribers" },
  { metric: "5 min", label: "Average Read" },
  { metric: "45%", label: "Open Rate" },
  { metric: "Daily", label: "Delivery" },
]

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [company, setCompany] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(null)
    setError(null)
    setAlreadySubscribed(false)
    
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    }
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAlreadySubscribed(false)
    
    // Validate email
    if (!email) {
      setEmailError("Email is required")
      return
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    
    if (selectedRoles.length === 0) {
      setError("Please select at least one role")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          company: company.trim() || undefined,
          role: selectedRoles[0], // Primary role
          source: "newsletter_page",
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.error === "already_subscribed") {
          setAlreadySubscribed(true)
        } else {
          setError(data.error || "Failed to subscribe. Please try again.")
        }
        return
      }
      
      setSubmitted(true)
    } catch (err) {
      console.error("Subscribe error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.svg" alt="MarketplaceBeta logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-bold text-xl hidden sm:block">MarketplaceBeta</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-base font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/tools" className="text-base font-semibold hover:text-primary transition-colors">
                Tools
              </Link>
              <Link href="/events" className="text-base font-semibold hover:text-primary transition-colors">
                Events
              </Link>
              <Link href="/newsletter" className="text-base font-semibold text-primary">
                Newsletter
              </Link>
            </nav>
            <Button asChild className="hidden sm:flex">
              <Link href="/">Back to News</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {submitted ? (
          /* Success State with Animation */
          <div className="max-w-lg mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              You&apos;re In!
            </h1>
            <p className="text-lg text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              Welcome to the community! Check your inbox for a confirmation email. 
              Your first Daily Marketplace Brief will arrive tomorrow morning at 7am ET.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <Button asChild size="lg">
                <Link href="/">
                  Read Today&apos;s News
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/tools">
                  Explore Seller Tools
                </Link>
              </Button>
            </div>
          </div>
        ) : alreadySubscribed ? (
          /* Already Subscribed State */
          <div className="max-w-lg mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">You&apos;re Already Subscribed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Great news - you&apos;re already on our list! Check your inbox (and spam folder) 
              for the Daily Marketplace Brief. It arrives every weekday at 7am ET.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  Read Today&apos;s News
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                setAlreadySubscribed(false)
                setEmail("")
              }}>
                Try Different Email
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Value Proposition */}
            <div>
              <Badge variant="outline" className="mb-6">
                <Mail className="h-3 w-3 mr-1" />
                Free Daily Newsletter
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                The Daily<br />Marketplace Brief
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Join 5,000+ e-commerce professionals who start their day with the most 
                important marketplace news, delivered in 5 minutes or less.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-10">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="grid grid-cols-4 gap-4">
                {SOCIAL_PROOF.map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-2xl font-bold text-primary">{item.metric}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Sample Preview */}
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  SAMPLE BRIEFING
                </h3>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Image src="/icon.svg" alt="MarketplaceBeta logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm">The Daily Marketplace Brief</p>
                        <p className="text-xs text-muted-foreground">March 11, 2026</p>
                      </div>
                    </div>
                    <Separator className="mb-4" />
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-amber-500 text-white border-0 text-xs">Breaking</Badge>
                        <p>Amazon announces 2.5% FBA fee reduction for Q2...</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">Platform</Badge>
                        <p>TikTok Shop expands fulfillment network to 15 new states...</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">M&A</Badge>
                        <p>Thrasio acquires supplement brand for $45M...</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      + 5 more stories in today&apos;s brief
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Signup Form */}
            <div className="lg:sticky lg:top-24">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Subscribe for Free</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
{/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {emailError && (
                        <p className="text-sm text-red-500">{emailError}</p>
                      )}
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (optional)</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Acme Inc."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>What best describes you? *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((role) => (
                          <div
                            key={role.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleRole(role.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                toggleRole(role.id)
                              }
                            }}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              selectedRoles.includes(role.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                              selectedRoles.includes(role.id)
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                            }`}>
                              {selectedRoles.includes(role.id) && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <role.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{role.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || !email || selectedRoles.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe to Daily Brief
                          <Mail className="h-4 w-4 ml-2" />
                        </>
                      )}
</Button>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                      </div>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                      Free forever. No spam. Unsubscribe anytime.<br />
                      By subscribing, you agree to our{" "}
                      <Link href="/privacy" className="underline">Privacy Policy</Link>.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Daily at 7am ET</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>5,000+ readers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>5 min read</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image src="/icon.svg" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
              <span>MarketplaceBeta</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
