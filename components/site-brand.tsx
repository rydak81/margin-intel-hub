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
  priority = false,
}: SiteBrandProps) {
  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative shrink-0 sm:hidden">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
        <Image
          src="/brand-icon.png"
          alt="MarketplaceBeta icon"
          width={32}
          height={32}
          priority={priority}
          className={cn("relative h-8 w-8 rounded-lg object-cover ring-1 ring-sky-400/20", iconClassName)}
        />
      </div>

      <div className="hidden min-w-0 sm:block">
        <Image
          src="/brand-logo.jpg"
          alt="MarketplaceBeta"
          width={1600}
          height={852}
          priority={priority}
          className={cn("h-10 w-auto object-contain", logoClassName)}
        />
        {deskLabel ? (
          <span
            className={cn(
              "block pl-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/48",
              labelClassName
            )}
          >
            {deskLabel}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
