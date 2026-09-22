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

export function SiteBrand({ href = "/", className }: SiteBrandProps) {
  return (
    <Link href={href} aria-label="MarketplaceBeta home" className={cn("inline-flex shrink-0 items-center gap-2.5 rounded-sm text-white sm:gap-3", className)}>
      <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="h-8 w-8 shrink-0 sm:h-11 sm:w-11">
        <rect width="40" height="40" rx="10" fill="#2563eb" />
        <path d="M10 28V13l10 10 10-10v15" stroke="white" strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 9h5v5" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col">
        <span className="whitespace-nowrap text-[1rem] font-bold leading-none tracking-[-0.045em] sm:text-[1.625rem]">
          Marketplace<span className="font-medium text-blue-300">Beta</span>
        </span>
        <span className="mt-2 hidden text-xs font-medium tracking-[0.12em] text-slate-300 sm:block">COMMERCE. IN CONTEXT.</span>
      </span>
    </Link>
  )
}
