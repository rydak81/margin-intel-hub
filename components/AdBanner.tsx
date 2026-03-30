'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getModuleTypeLabel, type SponsorConfig, type SponsorZone } from '@/lib/sponsors'

interface AdBannerProps {
  sponsor: SponsorConfig
  variant: SponsorZone
  dismissible?: boolean
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
    <div className={`relative overflow-hidden ${className || ""}`}>
      <Image
        src={sponsor.bannerImageUrl}
        alt={sponsor.bannerImageAlt || `${sponsor.name} creative`}
        fill
        sizes={
          variant === "sidebar"
            ? "320px"
            : variant === "footer"
              ? "(min-width: 1024px) 420px, 100vw"
              : "(min-width: 1024px) 560px, 100vw"
        }
        className="object-cover"
        style={{ objectPosition: sponsor.imageFocus?.[variant] || "center center" }}
        priority={variant === "top-banner"}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/15" />
    </div>
  )
}

function SponsorHeader({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="rounded-full bg-white/70 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
        Sponsored
      </Badge>
      <Badge variant="outline" className="rounded-full border-white/60 bg-white/60 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
        {getModuleTypeLabel(sponsor.moduleType)}
      </Badge>
      <span className="text-xs font-medium text-muted-foreground">{sponsor.partnerType}</span>
    </div>
  )
}

function SponsorHighlights({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {sponsor.highlights.slice(0, 3).map((highlight) => (
        <div
          key={highlight}
          className="rounded-xl border border-white/50 bg-white/55 px-3 py-2 text-xs font-medium text-slate-700 backdrop-blur"
        >
          {highlight}
        </div>
      ))}
    </div>
  )
}

function SponsorActions({ sponsor, compact = false }: { sponsor: SponsorConfig; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? "flex-col" : "flex-col sm:flex-row"} gap-2`}>
      <Button asChild size={compact ? "sm" : "default"} className="shadow-sm">
        <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
          {sponsor.ctaText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
      {sponsor.secondaryCtaText && sponsor.secondaryCtaUrl && (
        <Button asChild variant="outline" size={compact ? "sm" : "default"}>
          {sponsor.secondaryCtaUrl.startsWith("/") ? (
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
      className="absolute right-3 top-3 z-10 rounded-full border border-white/60 bg-white/80 p-1.5 text-slate-500 backdrop-blur transition-colors hover:text-slate-900"
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
      <Card className="relative mb-8 overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_70px_-28px_rgba(15,23,42,0.45)]">
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.9fr]">
            <div className="relative overflow-hidden p-6 md:p-8">
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundColor: sponsor.backgroundColor }} />
              <div className="relative z-[1] space-y-5">
                <SponsorHeader sponsor={sponsor} />
                <div className="flex items-center gap-3">
                  {sponsor.logoUrl && (
                    <div className="relative h-11 w-11 overflow-hidden rounded-xl border bg-white shadow-sm">
                      <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-2" sizes="44px" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{sponsor.badge}</p>
                    <p className="text-sm font-medium text-foreground/80">{sponsor.trustLabel}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">{sponsor.tagline}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{sponsor.description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Proof Point</p>
                    <p className="text-sm font-medium text-foreground">{sponsor.proofPoint}</p>
                  </div>
                  <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why It Fits Here</p>
                    <p className="text-sm font-medium text-foreground">{sponsor.whyRelevant}</p>
                  </div>
                </div>
                <SponsorHighlights sponsor={sponsor} />
                <SponsorActions sponsor={sponsor} />
              </div>
            </div>
            <div className="relative min-h-[260px] border-t lg:min-h-full lg:border-l lg:border-t-0">
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
      <Card className="relative my-8 overflow-hidden border bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] shadow-[0_14px_45px_-24px_rgba(15,23,42,0.4)]">
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.05fr_0.8fr]">
          <div className="space-y-4 p-5 md:p-6">
            <SponsorHeader sponsor={sponsor} />
            <div className="flex items-center gap-3">
              {sponsor.logoUrl && (
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-white">
                  <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-2" sizes="40px" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{sponsor.name}</p>
                <p className="text-xs text-muted-foreground">{sponsor.badge}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold tracking-tight text-balance">{sponsor.tagline}</h4>
              <p className="text-sm leading-7 text-muted-foreground">{sponsor.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-white/70 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Proof Point</p>
                <p className="text-sm font-medium">{sponsor.proofPoint}</p>
              </div>
              <div className="rounded-xl border bg-white/70 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why Relevant</p>
                <p className="text-sm font-medium">{sponsor.whyRelevant}</p>
              </div>
            </div>
            <SponsorActions sponsor={sponsor} />
          </div>
          <div className="relative min-h-[220px] border-t lg:border-l lg:border-t-0">
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
      <Card className="relative overflow-hidden border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-sm">
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="space-y-4 p-4">
          <SponsorHeader sponsor={sponsor} />
          <div className="flex items-center gap-3">
            {sponsor.logoUrl && (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-white">
                <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-2" sizes="40px" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold">{sponsor.name}</h4>
              <p className="text-xs text-muted-foreground">{sponsor.partnerType}</p>
            </div>
          </div>
          {sponsor.bannerImageUrl && (
            <div className="relative h-36 overflow-hidden rounded-xl border bg-slate-100">
              <SponsorImage sponsor={sponsor} variant={variant} className="absolute inset-0" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-base font-semibold leading-6 text-balance">{sponsor.tagline}</p>
            <p className="text-sm leading-6 text-muted-foreground">{sponsor.description}</p>
          </div>
          <div className="rounded-xl border bg-white/70 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why this sponsor is relevant</p>
            <p className="text-sm font-medium text-foreground">{sponsor.whyRelevant}</p>
          </div>
          <div className="space-y-2">
            {sponsor.highlights.slice(0, 3).map((highlight) => (
              <div key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
    <Card className="relative mt-8 overflow-hidden border bg-[linear-gradient(90deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] shadow-sm">
      <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          {sponsor.logoUrl && (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-white">
              <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-2" sizes="40px" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{sponsor.name}</p>
            <p className="text-xs text-muted-foreground">{getModuleTypeLabel(sponsor.moduleType)} · {sponsor.trustLabel}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{sponsor.tagline}</p>
          <p className="text-sm text-muted-foreground">{sponsor.proofPoint}</p>
        </div>
        <SponsorActions sponsor={sponsor} compact />
      </CardContent>
    </Card>
  )
}
