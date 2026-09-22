"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteBrand } from "@/components/site-brand"

type NavKey = "home" | "articles" | "news" | "partners" | "tools" | "fees" | "community" | "events" | "solutions" | "newsletter"

interface PremiumSiteHeaderProps {
  active?: NavKey
  deskLabel?: string
  backHref?: string
  backLabel?: string
  ctaHref?: string
  ctaLabel?: string
  actions?: ReactNode
  mobileContent?: ReactNode
  navExtra?: ReactNode
}

const NAV_ITEMS: Array<{ key: NavKey; href: string; label: string }> = [
  { key: "home", href: "/", label: "Overview" },
  { key: "news", href: "/news", label: "News" },
  { key: "articles", href: "/articles", label: "Articles" },
  { key: "tools", href: "/tools", label: "Seller tools" },
  { key: "fees", href: "/fees", label: "Fees" },
  { key: "partners", href: "/partners", label: "Partners" },
  { key: "community", href: "/community", label: "Community" },
  { key: "events", href: "/events", label: "Events" },
  { key: "solutions", href: "/solutions", label: "Solutions" },
  { key: "newsletter", href: "/newsletter", label: "Newsletter" },
]

export function PremiumSiteHeader({
  active, backHref, backLabel = "Back", ctaHref = "/newsletter", ctaLabel = "Get the daily brief",
  actions, mobileContent, navExtra,
}: PremiumSiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-20 items-center justify-between gap-3 py-4 sm:min-h-24">
          <SiteBrand />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {backHref && (
              <Link href={backHref} className="hidden items-center gap-2 text-sm text-slate-300 hover:text-white md:inline-flex">
                <ArrowLeft className="h-4 w-4" />{backLabel}
              </Link>
            )}
            {actions ?? (
              <Button asChild className="hidden h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 sm:inline-flex">
                <Link href={ctaHref}>{ctaLabel}<ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-white hover:bg-white/10 hover:text-white xl:hidden" onClick={() => setMobileMenuOpen(open => !open)} aria-expanded={mobileMenuOpen} aria-controls="site-mobile-navigation" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <nav aria-label="Main navigation" className="hidden items-center justify-between gap-4 border-t border-white/10 xl:flex">
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map(item => (
              <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} className={`border-b-2 py-4 text-sm font-medium transition-colors hover:text-white ${active === item.key ? "border-blue-400 text-white" : "border-transparent text-slate-300"}`}>
                {item.label}
              </Link>
            ))}
          </div>
          {navExtra}
        </nav>
        {mobileMenuOpen && (
          <nav id="site-mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-white/10 py-4 xl:hidden">
            <div className="grid grid-cols-2 gap-1">
              {NAV_ITEMS.map(item => (
                <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-3 py-3 text-base font-medium ${active === item.key ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  {item.label}
                </Link>
              ))}
            </div>
            {mobileContent}
            <Link href={ctaHref} onClick={() => setMobileMenuOpen(false)} className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-blue-500">{ctaLabel}</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
