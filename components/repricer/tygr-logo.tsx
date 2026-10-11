// The ProfitTygr mark: three tiger-claw stripes that read as an ascending
// bar chart — predator + profit in one shape. Tiger orange against the
// app's sky-blue wordmark accent.

export function TygrLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="ProfitTygr logo">
      <defs>
        <linearGradient id="tygr-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#tygr-gradient)" />
      <g transform="rotate(-14 24 24)" fill="#fff">
        <rect x="12" y="24" width="5" height="12.5" rx="2.5" opacity="0.9" />
        <rect x="21" y="18.5" width="5" height="18" rx="2.5" opacity="0.95" />
        <rect x="30" y="13" width="5" height="23.5" rx="2.5" />
      </g>
    </svg>
  )
}
