import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.76))] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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

            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
                <Image
                  src="/brand-icon.png"
                  alt="MarketplaceBeta logo"
                  width={32}
                  height={32}
                  className="relative h-8 w-8 rounded-lg object-cover ring-1 ring-sky-400/20"
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold leading-none text-white">MarketplaceBeta</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  {deskLabel}
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-semibold transition-colors hover:text-white ${
                  active === item.key ? "text-white" : "text-white/82"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {backHref ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="sm:hidden border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white"
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
          </div>
        </div>
      </div>
    </header>
  )
}
