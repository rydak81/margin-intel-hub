"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteLogo, SiteLogoFooter } from "@/components/site-logo"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <SiteLogo size="md" />
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
              <Link href="/newsletter" className="text-base font-semibold hover:text-primary transition-colors">
                Newsletter
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button asChild className="hidden sm:flex">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          The Intelligence Hub for Marketplace Commerce
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          MarketplaceBeta is an AI-powered platform that aggregates, classifies, and
          analyzes e-commerce news so marketplace professionals can make better decisions,
          faster.
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why We Exist</h2>
            <p className="text-muted-foreground leading-relaxed">
              The e-commerce landscape moves fast. Amazon changes its fee structure. Walmart
              rolls out a new fulfillment program. TikTok Shop rewrites the playbook on
              social commerce. A major aggregator makes an acquisition. A new policy drops
              on a Friday afternoon that reshapes how you run your business.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Keeping up with all of it used to mean checking dozens of sources every day --
              scanning Twitter threads, reading trade publications, monitoring platform
              announcements, and hoping you didn&apos;t miss the one update that actually
              mattered. We built MarketplaceBeta to solve that problem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketplaceBeta continuously scans hundreds of sources across the e-commerce
              ecosystem -- from platform announcements and industry publications to earnings
              reports and regulatory filings. Our AI engine classifies every story by
              platform, category, and impact level, then surfaces what matters most to you.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This is not just aggregation. We use artificial intelligence to identify
              patterns, flag critical developments, and separate signal from noise. When
              Amazon announces a fee change, you will see it within hours -- classified,
              contextualized, and ranked by how much it affects your business.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Daily Marketplace Brief</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every weekday morning at 7am ET, we deliver the Daily Marketplace Brief --
              a curated digest of the most important stories from the past 24 hours. Over
              5,000 e-commerce professionals start their day with our brief. It takes five
              minutes to read and covers everything from fee changes and policy updates to
              M&amp;A activity and emerging trends. It is free, and always will be.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Built for Marketplace Professionals</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Whether you are an Amazon seller optimizing your margins, an agency managing
              dozens of brand accounts, a SaaS founder building tools for the ecosystem,
              or an operator scaling across multiple platforms, MarketplaceBeta is built
              for you. Our audience includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Amazon Sellers and Brand Owners</span>{" "}
                -- tracking fee changes, policy updates, and competitive intelligence
              </li>
              <li>
                <span className="font-medium text-foreground">E-commerce Agencies</span>{" "}
                -- staying ahead of platform shifts to advise clients proactively
              </li>
              <li>
                <span className="font-medium text-foreground">SaaS and Technology Providers</span>{" "}
                -- understanding the landscape they build for
              </li>
              <li>
                <span className="font-medium text-foreground">Investors and Analysts</span>{" "}
                -- monitoring the pulse of marketplace commerce
              </li>
              <li>
                <span className="font-medium text-foreground">Marketplace Operators</span>{" "}
                -- managing multi-channel businesses across Amazon, Walmart, TikTok Shop,
                and beyond
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Makes Us Different</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">AI-Powered Analysis, Not Just Aggregation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Anyone can compile links. We use AI to classify stories by platform,
                  category, and impact -- so you see what matters most to your specific
                  role and business.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Comprehensive Coverage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We monitor hundreds of sources across the e-commerce ecosystem, from
                  major publications to niche community forums. If something important
                  happens in marketplace commerce, it shows up here.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Speed and Signal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our automated pipeline means stories appear within hours, not days. And
                  our AI classification ensures you spend your time on high-impact news,
                  not scrolling through noise.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Community-Driven</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Beyond the news feed, MarketplaceBeta brings together a community of
                  marketplace professionals who share insights, discuss trends, and help
                  each other navigate the ever-changing landscape.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Tools and Resources</h2>
            <p className="text-muted-foreground leading-relaxed">
              In addition to news and analysis, we curate a directory of essential tools
              and resources for marketplace professionals. From FBA calculators and keyword
              research tools to repricers and analytics platforms -- we help you find the
              right tools to run your business more effectively. Our events calendar tracks
              the most important industry conferences, webinars, and networking
              opportunities throughout the year.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe that access to timely, well-organized information should not be a
              competitive advantage reserved for the biggest players. Our mission is to
              democratize marketplace intelligence -- giving every seller, agency, and
              builder the same quality of information that was once only available to those
              with dedicated research teams. We want to be the first thing you read every
              morning and the source you trust to keep you informed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed">
              We love hearing from our readers. Whether you have a news tip, feedback on
              the platform, or just want to say hello, reach out to us at{" "}
              <a href="mailto:hello@marketplacebeta.com" className="text-primary hover:underline">
                hello@marketplacebeta.com
              </a>.
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/newsletter">Subscribe to the Daily Brief</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <SiteLogoFooter />
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
