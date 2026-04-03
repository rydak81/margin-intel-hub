'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
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
  const isWideWordmark = sponsor.id === 'threecolts' || sponsor.id === 'marketplacepulse'

  if (sponsor.id === 'threecolts') {
    if (variant === 'top-banner') {
      return 'h-12 w-36 rounded-full border-white/15 bg-white px-4 shadow-sm'
    }

    if (variant === 'inline') {
      return 'h-11 w-32 rounded-full border-white/15 bg-white px-4'
    }

    return 'h-11 w-32 rounded-full border-white/15 bg-white px-4'
  }

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
  if (sponsor.id === 'threecolts') return 'p-2.5'
  return sponsor.id === 'marketplacepulse' ? 'p-3' : 'p-2'
}

function SponsorImage({
  sponsor,
  variant,
  className,
  imageClassName,
  scrimClassName,
}: {
  sponsor: SponsorConfig
  variant: SponsorZone
  className?: string
  imageClassName?: string
  scrimClassName?: string
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
        className={imageClassName || 'object-cover'}
        style={{ objectPosition: sponsor.imageFocus?.[variant] || 'center center' }}
        priority={variant === 'top-banner'}
      />
      <div className={scrimClassName || 'absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/35'} />
    </div>
  )
}

function SponsorHeader({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        Sponsored
      </Badge>
      <Badge variant="outline" className="rounded-full border-white/16 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        {getModuleTypeLabel(sponsor.moduleType)}
      </Badge>
      <span className="text-xs font-medium text-white/68">{sponsor.partnerType}</span>
    </div>
  )
}

function SponsorHighlights({ sponsor }: { sponsor: SponsorConfig }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sponsor.highlights.slice(0, 2).map((highlight) => (
        <div
          key={highlight}
          className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/82 backdrop-blur"
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

function SponsorVisualScene({
  sponsor,
  variant,
}: {
  sponsor: SponsorConfig
  variant: SponsorZone
}) {
  const supportingHighlight = sponsor.highlights[1] || sponsor.highlights[0]
  const isThreecolts = sponsor.id === 'threecolts'
  const isMarketplacePulse = sponsor.id === 'marketplacepulse'
  const isMarginPro = sponsor.id === 'marginpro'
  const isCedCommerce = sponsor.id === 'cedcommerce'
  const isTopBanner = variant === 'top-banner'
  const textPanelWidthClass = isTopBanner ? 'w-full max-w-[380px]' : 'w-full max-w-[320px]'
  const headlineSizeClass = isTopBanner
    ? 'text-[clamp(1.85rem,3.2vw,3.35rem)]'
    : 'text-[clamp(1.8rem,2.6vw,3rem)]'
  const bodyWidthClass = isTopBanner ? 'max-w-[320px]' : 'max-w-[300px]'
  const actionsWidthClass = isTopBanner ? 'w-full max-w-[360px]' : 'w-full max-w-[320px]'
  const actionJustifyClass = isTopBanner ? 'justify-center' : 'justify-between'
  const actionHighlightWidthClass = isTopBanner ? 'max-w-[170px]' : 'max-w-[190px]'

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.1),rgba(2,6,23,0.18)_38%,rgba(2,6,23,0.72)_100%)]" />
      <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="absolute -left-6 bottom-10 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

      {sponsor.bannerImageUrl && !isThreecolts && !isMarketplacePulse && !isMarginPro && !isCedCommerce && (
        <div className="absolute inset-x-4 top-4 bottom-4">
          <div className="absolute inset-0 rounded-[28px] border border-white/8 bg-white/[0.03]" />
          <SponsorImage
            sponsor={sponsor}
            variant={variant}
            className="absolute inset-0 rounded-[28px]"
            imageClassName="object-cover scale-[1.1] drop-shadow-[0_22px_48px_rgba(2,6,23,0.6)]"
            scrimClassName="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.14)_48%,rgba(2,6,23,0.38))]"
          />
        </div>
      )}

      {isThreecolts && (
        <div className="absolute inset-x-5 top-5 bottom-5">
          <div className="absolute inset-0 rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(15,23,42,0.3),rgba(2,6,23,0.08))]" />
          <div className="absolute -left-14 top-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-0 top-20 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-36 w-36 rounded-full bg-violet-500/12 blur-3xl" />
          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_left_center,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_right_center,rgba(217,70,239,0.14),transparent_28%)]" />

          <div className={`relative flex h-full flex-col ${isTopBanner ? 'px-8 py-6 text-center' : 'px-6 py-6 text-center'}`}>
            <div className="flex justify-center">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                Strategic Partner
              </div>
            </div>

            <div className={`flex flex-1 flex-col items-center justify-center ${textPanelWidthClass} mx-auto ${isTopBanner ? 'gap-4' : 'gap-3'}`}>
              <div className={`${textPanelWidthClass} space-y-1`}>
                <p className={`${headlineSizeClass} font-extrabold leading-[0.94] tracking-[-0.055em]`}>
                  <span className="block whitespace-nowrap bg-[linear-gradient(135deg,#56d4ff_5%,#9da8ff_48%,#f15df5_100%)] bg-clip-text text-transparent">
                    Keep more.
                  </span>
                </p>
                <p className={`${headlineSizeClass} font-extrabold leading-[0.94] tracking-[-0.055em]`}>
                  <span className="block whitespace-nowrap bg-[linear-gradient(135deg,#78c8ff_0%,#b287ff_52%,#f155ff_100%)] bg-clip-text text-transparent">
                    Sell more.
                  </span>
                </p>
                <p className={`${headlineSizeClass} font-extrabold leading-[0.94] tracking-[-0.055em]`}>
                  <span className="block whitespace-nowrap bg-[linear-gradient(135deg,#8bb8ff_0%,#c97bff_44%,#ff6bd7_100%)] bg-clip-text text-transparent">
                    Scale faster.
                  </span>
                </p>
              </div>
              <p className={`${bodyWidthClass} text-sm font-medium leading-6 text-white/80`}>
                The operational infrastructure to simplify your commerce stack.
              </p>
              {isTopBanner && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 backdrop-blur">
                    <SponsorLogo
                      name="Seller 365"
                      sizes="28px"
                      className="h-7 w-7 rounded-full border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))]"
                      fallbackClassName="text-[9px] tracking-[0.14em] text-white"
                    />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/82">Seller 365</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 backdrop-blur">
                    <SponsorLogo
                      name="MarginPro"
                      logoUrl="/sponsors/marginpro-logo.svg"
                      sizes="28px"
                      className="h-7 w-7 rounded-full border-white/10 bg-white"
                      imageClassName="p-1.5"
                      fallbackClassName="text-[9px]"
                    />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/82">MarginPro</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 backdrop-blur">
                    <SponsorLogo
                      name="CedCommerce"
                      logoUrl="/sponsors/cedcommerce-logo.svg"
                      sizes="28px"
                      className="h-7 w-7 rounded-full border-white/10 bg-white"
                      imageClassName="p-1.5"
                      fallbackClassName="text-[9px]"
                    />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/82">CedCommerce</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-6">
              <div className={`flex ${actionsWidthClass} items-center ${actionJustifyClass} gap-3`}>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-24px_rgba(255,255,255,0.75)]">
                  Explore Threecolts
                </div>
                <div className={`${actionHighlightWidthClass} rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-xs font-medium leading-5 text-white/84 backdrop-blur-md`}>
                  {supportingHighlight}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMarginPro && (
        <div className="absolute inset-x-5 top-5 bottom-5">
          <div className="absolute inset-0 rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(20,184,166,0.1),rgba(2,6,23,0.08))]" />
          <div className="absolute -right-8 top-8 h-32 w-32 rounded-full bg-teal-300/18 blur-3xl" />
          <div className="absolute -left-10 bottom-6 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />

          <div className={`relative flex h-full flex-col justify-between ${isTopBanner ? 'px-8 py-7' : 'px-6 py-6'}`}>
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                Recommended Tool
              </div>
              <div className="space-y-1">
                <p className="text-[clamp(1.6rem,2.7vw,2.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
                  Know your
                </p>
                <p className="text-[clamp(1.6rem,2.7vw,2.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-teal-300">
                  true margins.
                </p>
                <p className="text-[clamp(1.6rem,2.7vw,2.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white/88">
                  Recover profit.
                </p>
              </div>
              <p className="max-w-[300px] text-sm font-medium leading-6 text-white/80">
                Track fees, reimbursements, ad spend, and profit leaks with a cleaner Amazon margin command center.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Fees', 'Reimbursements', 'Profit'].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="max-w-[280px] rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-xs font-medium leading-5 text-white/84 backdrop-blur-md">
                {supportingHighlight}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCedCommerce && (
        <div className="absolute inset-x-5 top-5 bottom-5">
          <div className="absolute inset-0 rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(99,102,241,0.14),rgba(2,6,23,0.08))]" />
          <div className="absolute -right-10 top-8 h-34 w-34 rounded-full bg-indigo-400/16 blur-3xl" />
          <div className="absolute left-4 bottom-2 h-28 w-28 rounded-full bg-violet-500/12 blur-3xl" />

          <div className={`relative flex h-full flex-col justify-between ${isTopBanner ? 'px-8 py-7' : 'px-6 py-6'}`}>
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                Integration Partner
              </div>
              <div className="space-y-1">
                <p className="text-[clamp(1.5rem,2.5vw,2.65rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
                  Connect more
                </p>
                <p className="text-[clamp(1.5rem,2.5vw,2.65rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-indigo-300">
                  channels.
                </p>
                <p className="text-[clamp(1.5rem,2.5vw,2.65rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white/88">
                  Scale cleanly.
                </p>
              </div>
              <p className="max-w-[300px] text-sm font-medium leading-6 text-white/80">
                Multi-channel operations support for catalog, orders, and inventory across fast-growing marketplace stacks.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Amazon', 'Walmart', 'TikTok Shop'].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="max-w-[280px] rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-xs font-medium leading-5 text-white/84 backdrop-blur-md">
                {supportingHighlight}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMarketplacePulse && (
        <div className="absolute inset-x-5 top-5 bottom-5">
          <div className="absolute inset-0 rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(15,23,42,0.22),rgba(2,6,23,0.06))]" />
          <div className="absolute -right-10 top-6 h-36 w-36 rounded-full bg-sky-400/16 blur-3xl" />
          <div className="absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-slate-100/8 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_right_bottom,rgba(148,163,184,0.14),transparent_22%)]" />

          <div className={`relative flex h-full flex-col justify-between ${isTopBanner ? 'px-8 py-7' : 'px-6 py-6'}`}>
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                Research Partner
              </div>
              <div className="space-y-1">
                <p className="text-[clamp(1.65rem,2.8vw,2.9rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
                  Everyone has
                </p>
                <p className="text-[clamp(1.65rem,2.8vw,2.9rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-sky-300">
                  an opinion.
                </p>
                <p className="text-[clamp(1.65rem,2.8vw,2.9rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
                  We have data.
                </p>
              </div>
              <p className="max-w-[300px] text-sm font-medium leading-6 text-white/80">
                Research, benchmark data, and analysis that helps marketplace teams frame smarter decisions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Data', 'Research', 'Analysis'].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="max-w-[280px] rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-xs font-medium leading-5 text-white/84 backdrop-blur-md">
                {supportingHighlight}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isThreecolts && !isMarketplacePulse && !isMarginPro && !isCedCommerce && (
        <div className="absolute right-5 top-5 max-w-[220px] rounded-full border border-white/12 bg-slate-950/55 px-4 py-2 text-xs font-medium text-white/88 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.95)] backdrop-blur-md">
          {supportingHighlight}
        </div>
      )}

      {!isThreecolts && !isMarketplacePulse && !isMarginPro && !isCedCommerce && (
        <div className="absolute bottom-5 left-5 right-5 max-w-[340px] rounded-3xl border border-white/10 bg-slate-950/68 p-4 text-white shadow-[0_18px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-md">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Operator Use Case</p>
          <p className="text-sm leading-6 text-white/90">{sponsor.useCase}</p>
        </div>
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
  const isCustomMiniVisual =
    sponsor.id === 'threecolts' ||
    sponsor.id === 'marketplacepulse' ||
    sponsor.id === 'marginpro' ||
    sponsor.id === 'cedcommerce'

  if (dismissed) return null

  if (variant === 'top-banner') {
    return (
      <Card
        className="relative mb-8 overflow-hidden border border-white/10 text-white shadow-[0_26px_90px_-38px_rgba(2,6,23,0.88)]"
        style={{ background: getModuleBackground(sponsor) }}
      >
        <DismissButton dismissible={dismissible} sponsor={sponsor} onDismiss={() => setDismissed(true)} />
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.12fr_0.94fr]">
            <div className="relative overflow-hidden p-6 md:p-8">
              <div
                className="absolute inset-0 opacity-[0.3]"
                style={{ background: `radial-gradient(circle at top left, ${hexToRgba(sponsor.backgroundColor, 0.4)}, transparent 32%)` }}
              />
              <div className="relative z-[1] space-y-4">
                <SponsorHeader sponsor={sponsor} />
                <div className="flex flex-wrap items-center gap-3">
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
                  <p className="max-w-2xl text-sm leading-7 text-white/76 md:text-base">{sponsor.description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/58">Proof Point</p>
                    <p className="text-sm font-medium text-white">{sponsor.proofPoint}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/58">Best Fit</p>
                    <p className="text-sm font-medium text-white">{sponsor.useCase}</p>
                  </div>
                </div>
                <SponsorHighlights sponsor={sponsor} />
                <SponsorActions sponsor={sponsor} />
              </div>
            </div>
            <div className="relative min-h-[260px] border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.38))]" />
              <SponsorVisualScene sponsor={sponsor} variant={variant} />
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
              <p className="text-sm leading-7 text-white/76">{sponsor.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/58">Proof Point</p>
                <p className="text-sm font-medium text-white">{sponsor.proofPoint}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/58">Best Fit</p>
                <p className="text-sm font-medium text-white">{sponsor.useCase}</p>
              </div>
            </div>
            <SponsorHighlights sponsor={sponsor} />
            <SponsorActions sponsor={sponsor} />
          </div>
          <div className="relative min-h-[220px] border-t border-white/10 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.38))]" />
            <SponsorVisualScene sponsor={sponsor} variant={variant} />
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
          {(sponsor.bannerImageUrl || isCustomMiniVisual) && (
            <div className="relative h-32 overflow-hidden rounded-xl border border-white/10 bg-slate-100/5">
              {sponsor.id === 'marketplacepulse' ? (
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95))] p-4">
                  <div className="absolute -right-8 top-2 h-24 w-24 rounded-full bg-sky-400/12 blur-3xl" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Research Partner</p>
                      <p className="mt-2 text-lg font-black leading-5 text-white">We have data.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3 text-xs font-medium leading-5 text-white/82">
                      {sponsor.highlights[0]}
                    </div>
                  </div>
                </div>
              ) : sponsor.id === 'threecolts' ? (
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(87,169,247,0.2),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(189,82,249,0.16),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-4">
                  <div className="absolute -right-8 top-2 h-24 w-24 rounded-full bg-fuchsia-400/12 blur-3xl" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Strategic Partner</p>
                      <p className="mt-2 text-lg font-black leading-5 text-white">Keep more.</p>
                      <p className="text-lg font-black leading-5 text-sky-300">Sell more.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3 text-xs font-medium leading-5 text-white/82">
                      {sponsor.highlights[0]}
                    </div>
                  </div>
                </div>
              ) : sponsor.id === 'marginpro' ? (
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95))] p-4">
                  <div className="absolute -right-8 top-2 h-24 w-24 rounded-full bg-teal-300/12 blur-3xl" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Recommended Tool</p>
                      <p className="mt-2 text-lg font-black leading-5 text-white">True margins.</p>
                      <p className="text-lg font-black leading-5 text-teal-300">Recover profit.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3 text-xs font-medium leading-5 text-white/82">
                      {sponsor.highlights[1] || sponsor.highlights[0]}
                    </div>
                  </div>
                </div>
              ) : sponsor.id === 'cedcommerce' ? (
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95))] p-4">
                  <div className="absolute -right-8 top-2 h-24 w-24 rounded-full bg-indigo-300/12 blur-3xl" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Integration Partner</p>
                      <p className="mt-2 text-lg font-black leading-5 text-white">Connect more.</p>
                      <p className="text-lg font-black leading-5 text-indigo-300">Scale cleanly.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3 text-xs font-medium leading-5 text-white/82">
                      {sponsor.highlights[0]}
                    </div>
                  </div>
                </div>
              ) : (
                <SponsorImage sponsor={sponsor} variant={variant} className="absolute inset-0" />
              )}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-base font-semibold leading-6 text-balance text-white">{sponsor.tagline}</p>
            <p className="text-sm leading-6 text-white/72 line-clamp-3">{sponsor.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sponsor.highlights.slice(0, 1).map((highlight) => (
              <div key={highlight} className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-semibold text-white/80">
                {highlight}
              </div>
            ))}
            <div className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1.5 text-[11px] font-medium text-white/72">
              {sponsor.useCase}
            </div>
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
