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
        <Image
          src="/brand-icon.png"
          alt="MarketplaceBeta icon"
          width={36}
          height={36}
          priority={priority}
          className={cn("h-9 w-9 rounded-lg object-contain", iconClassName)}
        />
      </div>

      <div className="hidden min-w-0 sm:block">
        <Image
          src="/brand-logo.jpg"
          alt="MarketplaceBeta"
          width={1600}
          height={852}
          priority={priority}
          className={cn("h-8 w-auto object-contain", logoClassName)}
        />
      </div>
    </Link>
  )
}
