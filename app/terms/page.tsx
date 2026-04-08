"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteLogo, SiteLogoFooter } from "@/components/site-logo"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: April 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using MarketplaceBeta (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree to these terms, please
              do not use our website or subscribe to our newsletter. We reserve the right
              to modify these terms at any time, and your continued use of the Service
              constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketplaceBeta is an AI-powered intelligence platform that aggregates,
              classifies, and summarizes e-commerce and marketplace news. Our services
              include a curated news feed, the Daily Marketplace Brief newsletter, seller
              tools and resources, an events calendar, and community features. The Service
              is designed to inform and educate e-commerce professionals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Not Financial or Business Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content provided on MarketplaceBeta is for informational and educational
              purposes only. Nothing on this site constitutes financial advice, investment
              advice, legal advice, or any other form of professional counsel. The news,
              analysis, data, and opinions presented should not be relied upon as the sole
              basis for any business or financial decision. You should consult with
              qualified professionals before making decisions that may affect your business.
              MarketplaceBeta is not responsible for any actions taken based on the content
              we publish.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Newsletter Subscription</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Daily Marketplace Brief is a free newsletter delivered via email. By
              subscribing, you agree to receive daily emails from MarketplaceBeta. You may
              unsubscribe at any time using the link provided in each email. We do not
              charge for the newsletter, and there are no hidden fees or automatic billing.
              We reserve the right to modify the frequency, format, or content of the
              newsletter at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">User-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketplaceBeta may offer community features where users can post comments,
              discussions, or other content. By submitting user-generated content, you grant
              MarketplaceBeta a non-exclusive, royalty-free, worldwide license to use,
              display, and distribute that content in connection with the Service. You are
              solely responsible for the content you post and must ensure it does not
              violate any applicable laws, infringe on intellectual property rights, or
              contain harmful, abusive, or misleading material. We reserve the right to
              remove any user-generated content at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All original content on MarketplaceBeta, including but not limited to text,
              graphics, logos, AI-generated summaries, data compilations, and software, is
              the property of MarketplaceBeta or its content creators and is protected by
              copyright and other intellectual property laws. You may not reproduce,
              distribute, or create derivative works from our content without prior written
              permission. News articles and content linked from third-party sources remain
              the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Accuracy of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide accurate and up-to-date information. However, because we
              aggregate content from multiple sources and use AI-assisted classification,
              we cannot guarantee the accuracy, completeness, or timeliness of all
              information presented. News stories are attributed to their original sources,
              and we encourage readers to verify critical information independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Links and Tools</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketplaceBeta contains links to third-party websites, tools, and services.
              These links are provided for convenience and informational purposes. We do
              not endorse, control, or assume responsibility for the content, privacy
              policies, or practices of any third-party sites. Your use of third-party
              services is at your own risk and subject to their respective terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, MarketplaceBeta and its operators,
              contributors, and affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of or
              inability to use the Service. This includes, without limitation, damages for
              loss of profits, business interruption, or loss of data. Our total liability
              for any claim related to the Service shall not exceed the amount you paid us
              in the twelve months preceding the claim (which, for free subscribers, is
              zero).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
              any kind, whether express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular purpose, and
              non-infringement. We do not warrant that the Service will be uninterrupted,
              error-free, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at
              any time, with or without cause and with or without notice. Reasons for
              termination may include violation of these terms, abusive behavior in
              community spaces, or activities that harm the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with
              the laws of the United States. Any disputes arising from these terms or your
              use of the Service shall be resolved in the appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@marketplacebeta.com" className="text-primary hover:underline">
                legal@marketplacebeta.com
              </a>.
            </p>
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
