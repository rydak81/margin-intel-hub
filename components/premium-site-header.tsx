"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteBrand } from "@/components/site-brand"

type NavKey =
  | "home"
  | "articles"
  | "news"
  | "partners"
  | "tools"
  | "community"
  | "events"
  | "solutions"
  | "newsletter"

interface PremiumSiteHeaderProps {
  active?: NavKey
  deskLabel?: string
  backHref?: string
  backLabel?: string
  ctaHref?: string
  ctaLabel?: string
}

const NAV_ITEMS: Array<{ key: NavKey; href: string; label: string }> = [
  { key: "home", href: "/", label: "Home" },
  { key: "articles", href: "/articles", label: "Articles" },
  { key: "news", href: "/news", label: "News" },
  { key: "partners", href: "/partners", label: "Partners" },
  { key: "tools", href: "/tools", label: "Tools" },
  { key: "community", href: "/community", label: "Community" },
  { key: "events", href: "/events", label: "Events" },
  { key: "solutions", href: "/solutions", label: "Solutions" },
  { key: "newsletter", href: "/newsletter", label: "Newsletter" },
]

export function PremiumSiteHeader({
  active,
  deskLabel = "Operator Intelligence Desk",
  backHref,
  backLabel = "Back",
  ctaHref = "/newsletter",
  ctaLabel = "Subscribe",
}: PremiumSiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,41,59,0.82))] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)]" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-14 items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {backHref ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white sm:inline-flex"
              >
                <Link href={backHref}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {backLabel}
                </Link>
              </Button>
            ) : null}

            <SiteBrand
              href="/"
              deskLabel={deskLabel}
              className="max-w-[320px]"
              logoClassName="h-11 w-11"
              iconClassName="h-9 w-9"
              labelClassName="truncate text-white/55"
            />
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:text-white ${
                  active === item.key
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:bg-white/6"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {backHref ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white sm:hidden"
              >
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button
              asChild
              size="sm"
              className="hidden border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-sm text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95 sm:flex"
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/16 lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 pb-4 pt-3 lg:hidden">
            <div className="grid gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    active === item.key
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/6 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                className="mt-2 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
