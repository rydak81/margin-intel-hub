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

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient-1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="logo-gradient-2" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      {/* Four-pointed star shape with rounded ends */}
      <path
        d="M24 4C24 4 26.5 11 26.5 14C26.5 17 24 20 24 20C24 20 21.5 17 21.5 14C21.5 11 24 4 24 4Z"
        fill="url(#logo-gradient-1)"
      />
      <path
        d="M24 28C24 28 26.5 31 26.5 34C26.5 37 24 44 24 44C24 44 21.5 37 21.5 34C21.5 31 24 28 24 28Z"
        fill="url(#logo-gradient-2)"
      />
      <path
        d="M4 24C4 24 11 21.5 14 21.5C17 21.5 20 24 20 24C20 24 17 26.5 14 26.5C11 26.5 4 24 4 24Z"
        fill="url(#logo-gradient-2)"
      />
      <path
        d="M28 24C28 24 31 21.5 34 21.5C37 21.5 44 24 44 24C44 24 37 26.5 34 26.5C31 26.5 28 24 28 24Z"
        fill="url(#logo-gradient-1)"
      />
      {/* Corner connectors */}
      <circle cx="10" cy="10" r="3" fill="url(#logo-gradient-1)" />
      <circle cx="38" cy="10" r="3" fill="url(#logo-gradient-1)" />
      <circle cx="10" cy="38" r="3" fill="url(#logo-gradient-2)" />
      <circle cx="38" cy="38" r="3" fill="url(#logo-gradient-1)" />
      {/* Diagonal connectors */}
      <path
        d="M12 12L18 18"
        stroke="url(#logo-gradient-1)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M36 12L30 18"
        stroke="url(#logo-gradient-1)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 36L18 30"
        stroke="url(#logo-gradient-2)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M36 36L30 30"
        stroke="url(#logo-gradient-1)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
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
        <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-br from-sky-400/20 via-cyan-300/10 to-fuchsia-400/20 blur-md" />
        <LogoMark className={cn("relative h-10 w-10", iconClassName)} />
      </div>

      {/* Desktop: Logo mark + wordmark */}
      <div className="hidden min-w-0 items-center gap-3 sm:flex">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/15 via-transparent to-fuchsia-400/15 blur-sm" />
          <LogoMark className={cn("relative h-12 w-12", logoClassName)} />
        </div>
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
