import Link from "next/link"

import { cn } from "@/lib/utils"

interface SiteBrandProps {
  href?: string
  deskLabel?: string
  className?: string
  logoClassName?: string
  iconClassName?: string
  labelClassName?: string
  priority?: boolean
}

export function SiteBrand({
  href = "/",
  deskLabel,
  className,
  logoClassName,
  iconClassName,
  labelClassName,
}: SiteBrandProps) {
  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-3", className)}>
      {/* Mobile: Icon only */}
      <div className="relative shrink-0 sm:hidden">
        <img
          src="/logo-mark.svg"
          alt="MarketplaceBeta"
          className={cn("relative h-11 w-11 object-contain", iconClassName)}
        />
      </div>

      {/* Desktop: Logo mark + wordmark */}
      <div className="hidden min-w-0 items-center gap-3 sm:flex">
        <img
          src="/logo-mark.svg"
          alt="MarketplaceBeta"
          className={cn("h-14 w-14 shrink-0 object-contain", logoClassName)}
        />
        <div className="flex flex-col justify-center">
          <span className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">Marketplace</span>
            <span className="text-white/90">Beta</span>
          </span>
          {deskLabel ? (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.18em] text-white/50",
                labelClassName
              )}
            >
              {deskLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
