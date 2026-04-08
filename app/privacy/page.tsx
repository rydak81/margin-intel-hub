"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteLogo, SiteLogoFooter } from "@/components/site-logo"

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: April 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketplaceBeta (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, and safeguard
              your information when you visit our website and subscribe to our services. We
              believe in transparency and want you to understand exactly what data we handle
              and why.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you subscribe to the Daily Marketplace Brief or create an account, we
              may collect your email address, first name, company name, and professional
              role. This information is provided voluntarily and is used to personalize your
              experience and deliver relevant content.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to collect usage data, including pages
              visited, time spent on site, referring URLs, and general device information
              (browser type, operating system). This data helps us understand how our
              readers engage with content so we can improve the experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Delivering the Daily Marketplace Brief and other newsletter content to your inbox</li>
              <li>Personalizing content recommendations based on your role and interests</li>
              <li>Improving our website, tools, and editorial coverage</li>
              <li>Analyzing aggregate usage trends via Vercel Analytics</li>
              <li>Communicating important updates about our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase, a trusted infrastructure
              provider with enterprise-grade security practices. We implement reasonable
              technical and organizational measures to protect your personal information
              against unauthorized access, alteration, or destruction. All data is
              transmitted over encrypted connections (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Vercel Analytics to understand website traffic and usage patterns.
              Vercel Analytics is a privacy-friendly analytics solution that does not use
              cookies for tracking and does not collect personally identifiable information.
              Aggregate analytics data helps us make editorial decisions and improve site
              performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">We Do Not Sell Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties. We
              do not share your email address with advertisers or other companies for their
              marketing purposes. Your data is used solely to operate and improve
              MarketplaceBeta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Email Preferences</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can unsubscribe from the Daily Marketplace Brief at any time by clicking
              the &quot;unsubscribe&quot; link at the bottom of any email. You may also contact us
              directly to update your email preferences or request removal from our mailing
              list. We honor all unsubscribe requests promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights (GDPR &amp; CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a resident of the European Economic Area (EEA), you have rights
              under the General Data Protection Regulation (GDPR), including the right to
              access, correct, or delete your personal data, and the right to data
              portability. If you are a California resident, you have rights under the
              California Consumer Privacy Act (CCPA), including the right to know what
              personal information we collect, the right to request deletion, and the right
              to opt out of the sale of personal information (though we do not sell your
              data). To exercise any of these rights, please contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site contains links to third-party websites, news sources, and tools. We
              are not responsible for the privacy practices of these external sites. We
              encourage you to review their privacy policies independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will
              revise the &quot;Last updated&quot; date at the top of this page. For significant
              changes, we will notify subscribers via email. Continued use of MarketplaceBeta
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or your personal data, please
              reach out to us at{" "}
              <a href="mailto:privacy@marketplacebeta.com" className="text-primary hover:underline">
                privacy@marketplacebeta.com
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
