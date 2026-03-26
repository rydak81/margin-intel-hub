'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { SponsorConfig } from '@/lib/sponsors'

interface AdBannerProps {
  sponsor: SponsorConfig
  variant: 'top-banner' | 'sidebar' | 'inline' | 'footer'
  dismissible?: boolean
}

export function AdBanner({ sponsor, variant, dismissible = true }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const hasCreativeBanner = Boolean(sponsor.bannerImageUrl && variant !== 'sidebar')

  if (dismissed) return null

  if (hasCreativeBanner) {
    const containerClasses = {
      'top-banner': 'relative w-full overflow-hidden rounded-xl mb-6 border bg-card shadow-sm',
      inline: 'relative overflow-hidden rounded-xl my-6 border bg-card shadow-sm',
      footer: 'relative w-full overflow-hidden rounded-xl mt-8 border bg-card shadow-sm',
      sidebar: '',
    }[variant]

    return (
      <div className={containerClasses}>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white/80 transition-colors hover:text-white"
            aria-label={`Dismiss ${sponsor.name} advertisement`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <a
          href={sponsor.ctaUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`${sponsor.name} advertisement`}
          className="block"
        >
          <div className="relative aspect-[1773/886] w-full bg-black">
            <Image
              src={sponsor.bannerImageUrl!}
              alt={sponsor.bannerImageAlt || `${sponsor.name} banner`}
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
              priority={variant === 'top-banner'}
            />
          </div>
        </a>
      </div>
    )
  }

  // TOP BANNER — full-width bar at the top of the page, clean and minimal
  if (variant === 'top-banner') {
    return (
      <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ backgroundColor: sponsor.backgroundColor }}>
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-white/50 hover:text-white/80 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {sponsor.logoUrl && (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 md:h-10 object-contain flex-shrink-0" />
          )}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15" style={{ color: sponsor.textColor + 'cc' }}>
                {sponsor.badge}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-0.5" style={{ color: sponsor.textColor }}>{sponsor.tagline}</h3>
            <p className="text-sm opacity-80" style={{ color: sponsor.textColor }}>{sponsor.description}</p>
          </div>
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-shrink-0 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            {sponsor.ctaText}
          </a>
        </div>
      </div>
    )
  }

  // SIDEBAR — compact card for side panels
  if (variant === 'sidebar') {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{sponsor.badge}</span>
          {dismissible && (
            <button onClick={() => setDismissed(true)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="px-4 pb-4">
          {sponsor.logoUrl && (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-7 mb-2.5 object-contain" />
          )}
          <h4 className="font-semibold text-sm mb-1">{sponsor.tagline}</h4>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{sponsor.description}</p>
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-2 px-4 rounded-md transition-colors"
          >
            {sponsor.ctaText}
          </a>
        </div>
      </div>
    )
  }

  // INLINE — horizontal banner that sits between content sections
  if (variant === 'inline') {
    return (
      <div className="relative rounded-lg border bg-muted/20 overflow-hidden my-6">
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="absolute top-2.5 right-2.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors z-10">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="px-5 py-4 flex flex-col md:flex-row items-center gap-4">
          <span className="absolute top-2.5 left-4 text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
            {sponsor.badge}
          </span>
          {sponsor.logoUrl && (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 object-contain mt-3 md:mt-0 flex-shrink-0" />
          )}
          <div className="flex-1 text-center md:text-left min-w-0">
            <h4 className="font-semibold text-sm">{sponsor.tagline}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{sponsor.description}</p>
          </div>
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-5 rounded-md transition-colors"
          >
            {sponsor.ctaText}
          </a>
        </div>
      </div>
    )
  }

  // FOOTER — subtle full-width bar at the bottom
  if (variant === 'footer') {
    return (
      <div className="relative w-full rounded-lg border bg-muted/10 overflow-hidden mt-8">
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="absolute top-2.5 right-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">{sponsor.badge}</span>
          {sponsor.logoUrl && (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-6 object-contain flex-shrink-0" />
          )}
          <p className="flex-1 text-xs text-muted-foreground text-center sm:text-left">
            <span className="font-medium text-foreground">{sponsor.tagline}</span> — {sponsor.description}
          </p>
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-shrink-0 text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {sponsor.ctaText} →
          </a>
        </div>
      </div>
    )
  }

  return null
}
