import Link from "next/link"

interface SiteLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
  className?: string
}

const sizes = {
  sm: { icon: 24, text: "text-sm font-bold", gap: "gap-1.5" },
  md: { icon: 32, text: "text-lg font-bold", gap: "gap-2" },
  lg: { icon: 40, text: "text-xl font-bold", gap: "gap-2.5" },
}

/** Inline SVG logo mark — blue-to-purple gradient 4-pointed star */
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0099FF" />
          <stop offset="40%" stopColor="#4466FF" />
          <stop offset="100%" stopColor="#CC44FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#logoGrad)"
        d="M100 8C106 8 114 40 114 56C114 68 120 76 132 76C148 76 192 80 192 100C192 120 148 124 132 124C120 124 114 132 114 144C114 160 106 192 100 192C94 192 86 160 86 144C86 132 80 124 68 124C52 124 8 120 8 100C8 80 52 76 68 76C80 76 86 68 86 56C86 40 94 8 100 8Z"
      />
    </svg>
  )
}

export function SiteLogo({ size = "md", showText = true, href = "/", className = "" }: SiteLogoProps) {
  const s = sizes[size]

  const content = (
    <span className={`flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.icon} />
      {showText && (
        <span className={`${s.text} tracking-tight hidden sm:inline`}>
          <span className="text-foreground">Marketplace</span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #4466FF, #CC44FF)" }}
          >
            Beta
          </span>
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

/** Compact footer logo */
export function SiteLogoFooter() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <LogoMark size={20} />
      <span className="text-sm font-semibold">
        <span className="text-foreground/80">Marketplace</span>
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #4466FF, #CC44FF)" }}
        >
          Beta
        </span>
      </span>
    </Link>
  )
}

export { LogoMark }
