import Image from "next/image"
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
        <Image
          src="/brand-icon.png"
          alt="MarketplaceBeta"
          width={40}
          height={40}
          className={cn("relative h-10 w-10 rounded-lg object-cover", iconClassName)}
        />
      </div>

      {/* Desktop: Logo mark + wordmark */}
      <div className="hidden min-w-0 items-center gap-3.5 sm:flex">
        <Image
          src="/brand-icon.png"
          alt="MarketplaceBeta"
          width={48}
          height={48}
          className={cn("h-12 w-12 shrink-0 rounded-lg object-cover", logoClassName)}
        />
        <div className="flex flex-col justify-center">
          <span className="text-xl font-semibold tracking-tight text-white">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Marketplace</span>
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
