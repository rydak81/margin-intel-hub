'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SponsorLogo } from '@/components/SponsorLogo'
import { getModuleTypeLabel, type SponsorConfig, type SponsorZone } from '@/lib/sponsors'

interface AdBannerProps {
  sponsor: SponsorConfig
  variant: SponsorZone
  dismissible?: boolean
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  const int = Number.parseInt(value, 16)
  const red = (int >> 16) & 255
  const green = (int >> 8) & 255
  const blue = int & 255

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getModuleBackground(sponsor: SponsorConfig): string {
  if (sponsor.id === 'threecolts') {
    return 'radial-gradient(circle at top left, rgba(87,169,247,0.26), transparent 28%), radial-gradient(circle at top right, rgba(189,82,249,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(255,248,69,0.12), transparent 22%), linear-gradient(135deg, rgba(2,6,23,0.98), rgba(15,23,42,0.97))'
  }

  return `radial-gradient(circle at top left, ${hexToRgba(sponsor.backgroundColor, 0.34)}, transparent 30%), linear-gradient(135deg, rgba(2,6,23,0.98), ${hexToRgba(sponsor.backgroundColor, 0.88)} 56%, rgba(15,23,42,0.98))`
}

function getLogoFrameClasses(sponsor: SponsorConfig, variant: SponsorZone): string {
  const isWideWordmark = sponsor.id === 'threecolts'

  if (variant === 'top-banner') {
    return isWideWordmark
      ? 'h-11 w-32 rounded-full border-white/15 bg-white px-3 shadow-sm'
      : 'h-11 w-11 rounded-xl border-white/15 bg-white shadow-sm'
  }

  if (variant === 'inline') {
    return isWideWordmark
      ? 'h-10 w-28 rounded-full border-white/15 bg-white px-3'
      : 'h-10 w-10 border-white/15 bg-white'
  }

  return isWideWordmark
    ? 'h-10 w-28 rounded-full border-white/15 bg-white px-3'
    : 'h-10 w-10 border-white/15 bg-white'
}

function getLogoImageClasses(sponsor: SponsorConfig): string {
  return sponsor.id === 'threecolts' ? 'p-3' : 'p-2'
}

function SponsorImage({
  sponsor,
  variant,
  className,
}: {
  sponsor: SponsorConfig
  variant: SponsorZone
  className?: string
}) {
  if (!sponsor.bannerImageUrl) return null

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      <Image
        src={sponsor.bannerImageUrl}
        alt={sponsor.bannerImageAlt || `${sponsor.name} creative`}
        fill
        sizes={
          variant === 'sidebar'
            ? '320px'
            : variant === 'footer'
              ? '(min-width: 1024px) 420px, 100vw'
              : '(min-width: 1024px) 560px, 100vw'
        }
        className="object-cover"
        style={{ objectPosition: sponsor.imageFocus?.[variant] || 'center center' }}
        priority={variant === 'top-banner'}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/35" />
    </div>
  )
}

function SponsorHeader({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        Sponsored
      </Badge>
      <Badge variant="outline" className="rounded-full border-white/20 bg-white/8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        {getModuleTypeLabel(sponsor.moduleType)}
      </Badge>
      <span className="text-xs font-medium text-white/70">{sponsor.partnerType}</span>
    </div>
  )
}

function SponsorHighlights({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {sponsor.highlights.slice(0, 3).map((highlight) => (
        <div
          key={highlight}
          className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-medium text-white/85 backdrop-blur"
        >
          {highlight}
        </div>
      ))}
    </div>
  )
}

function SponsorActions({ sponsor, compact = false }: { sponsor: SponsorConfig; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2`}>
      <Button asChild size={compact ? 'sm' : 'default'} className="border border-white/10 bg-white text-slate-950 shadow-sm hover:bg-white/90">
        <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
          {sponsor.ctaText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
      {sponsor.secondaryCtaText && sponsor.secondaryCtaUrl && (
        <Button asChild variant="outline" size={compact ? 'sm' : 'default'} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          {sponsor.secondaryCtaUrl.startsWith('/') ? (
            <Link href={sponsor.secondaryCtaUrl}>{sponsor.secondaryCtaText}</Link>
          ) : (
            <a href={sponsor.secondaryCtaUrl} target="_blank" rel="noopener noreferrer">
              {sponsor.secondaryCtaText}
            </a>
          )}
        </Button>
      )}
    </div>
  )
}

function DismissButton({
  dismissible,
  sponsor,
  onDismiss,
}: {
  dismissible: boolean
  sponsor: SponsorConfig
  onDismiss: () => void
}) {
  if (!dismissible) return null

  return (
    <button
      onClick={onDismiss}
      className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-slate-950/45 p-1.5 text-white/75 backdrop-blur transition-colors hover:text-white"
      aria-label={`Dismiss ${sponsor.name} sponsor module`}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export function AdBanner({ sponsor, variant, dismissible = false }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (variant === 'top-banner') {
    return (
      <Card
        className="relative mb-8 overflow-hidden border border-white/10 text-white shadow-[0_26px_90px_-38px_rgba(2,6,23,0.88)]"
        style={{ background: getModuleBackground(sponsor) }}
      >
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.9fr]">
            <div className="relative overflow-hidden p-6 md:p-8">
              <div
                className="absolute inset-0 opacity-[0.3]"
                style={{ background: `radial-gradient(circle at top left, ${hexToRgba(sponsor.backgroundColor, 0.4)}, transparent 32%)` }}
              />
              <div className="relative z-[1] space-y-5">
                <SponsorHeader sponsor={sponsor} />
                <div className="flex items-center gap-3">
                  <SponsorLogo
                    name={sponsor.name}
                    logoUrl={sponsor.logoUrl}
                    sizes="44px"
                    className={getLogoFrameClasses(sponsor, variant)}
                    imageClassName={getLogoImageClasses(sponsor)}
                  />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{sponsor.badge}</p>
                    <p className="text-sm font-medium text-white/85">{sponsor.trustLabel}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">{sponsor.tagline}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">{sponsor.description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-sm backdrop-blur">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Proof Point</p>
                    <p className="text-sm font-medium text-white">{sponsor.proofPoint}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-sm backdrop-blur">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Why It Fits Here</p>
                    <p className="text-sm font-medium text-white">{sponsor.whyRelevant}</p>
                  </div>
                </div>
                <SponsorHighlights sponsor={sponsor} />
                <SponsorActions sponsor={sponsor} />
              </div>
            </div>
            <div className="relative min-h-[260px] border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
              <SponsorImage sponsor={sponsor} variant={variant} className="absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 z-[1] space-y-2 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Use Case</p>
                <p className="max-w-md text-sm leading-6 text-white/90">{sponsor.useCase}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'inline') {
    return (
      <Card
        className="relative my-8 overflow-hidden border border-white/10 text-white shadow-[0_16px_52px_-26px_rgba(2,6,23,0.82)]"
        style={{ background: getModuleBackground(sponsor) }}
      >
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.05fr_0.8fr]">
          <div className="space-y-4 p-5 md:p-6">
            <SponsorHeader sponsor={sponsor} />
            <div className="flex items-center gap-3">
              <SponsorLogo
                name={sponsor.name}
                logoUrl={sponsor.logoUrl}
                sizes="40px"
                className={getLogoFrameClasses(sponsor, variant)}
                imageClassName={getLogoImageClasses(sponsor)}
              />
              <div>
                <p className="text-sm font-semibold text-white">{sponsor.name}</p>
                <p className="text-xs text-white/65">{sponsor.badge}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold tracking-tight text-balance">{sponsor.tagline}</h4>
              <p className="text-sm leading-7 text-white/72">{sponsor.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Proof Point</p>
                <p className="text-sm font-medium text-white">{sponsor.proofPoint}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Why Relevant</p>
                <p className="text-sm font-medium text-white">{sponsor.whyRelevant}</p>
              </div>
            </div>
            <SponsorActions sponsor={sponsor} />
          </div>
          <div className="relative min-h-[220px] border-t border-white/10 lg:border-l lg:border-t-0">
            <SponsorImage sponsor={sponsor} variant={variant} className="absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-4 text-white">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Operator Use Case</p>
              <p className="text-sm leading-6 text-white/90">{sponsor.useCase}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Card
        className="relative overflow-hidden border border-white/10 text-white shadow-[0_14px_44px_-24px_rgba(2,6,23,0.82)]"
        style={{ background: getModuleBackground(sponsor) }}
      >
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="space-y-4 p-4">
          <SponsorHeader sponsor={sponsor} />
          <div className="flex items-center gap-3">
            <SponsorLogo
              name={sponsor.name}
              logoUrl={sponsor.logoUrl}
              sizes="40px"
              className={getLogoFrameClasses(sponsor, variant)}
              imageClassName={getLogoImageClasses(sponsor)}
            />
            <div>
              <h4 className="text-sm font-bold text-white">{sponsor.name}</h4>
              <p className="text-xs text-white/65">{sponsor.partnerType}</p>
            </div>
          </div>
          {sponsor.bannerImageUrl && (
            <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-slate-100/5">
              <SponsorImage sponsor={sponsor} variant={variant} className="absolute inset-0" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-base font-semibold leading-6 text-balance text-white">{sponsor.tagline}</p>
            <p className="text-sm leading-6 text-white/72">{sponsor.description}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/8 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Why this sponsor is relevant</p>
            <p className="text-sm font-medium text-white">{sponsor.whyRelevant}</p>
          </div>
          <div className="space-y-2">
            {sponsor.highlights.slice(0, 3).map((highlight) => (
              <div key={highlight} className="flex items-start gap-2 text-sm text-white/72">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
          <SponsorActions sponsor={sponsor} compact />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="relative mt-8 overflow-hidden border border-white/10 text-white shadow-[0_14px_44px_-24px_rgba(2,6,23,0.82)]"
      style={{ background: getModuleBackground(sponsor) }}
    >
      <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <SponsorLogo
            name={sponsor.name}
            logoUrl={sponsor.logoUrl}
            sizes="40px"
            className={getLogoFrameClasses(sponsor, variant)}
            imageClassName={getLogoImageClasses(sponsor)}
          />
          <div>
            <p className="text-sm font-semibold text-white">{sponsor.name}</p>
            <p className="text-xs text-white/65">{getModuleTypeLabel(sponsor.moduleType)} · {sponsor.trustLabel}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{sponsor.tagline}</p>
          <p className="text-sm text-white/72">{sponsor.proofPoint}</p>
        </div>
        <SponsorActions sponsor={sponsor} compact />
      </CardContent>
    </Card>
  )
}
