'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SponsorLogoProps {
  name: string
  logoUrl?: string
  alt?: string
  sizes: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function SponsorLogo({
  name,
  logoUrl,
  alt,
  sizes,
  className,
  imageClassName,
  fallbackClassName,
}: SponsorLogoProps) {
  const [hasError, setHasError] = useState(!logoUrl)

  useEffect(() => {
    setHasError(!logoUrl)
  }, [logoUrl])

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-white', className)}>
      {!hasError && logoUrl ? (
        <Image
          src={logoUrl}
          alt={alt || name}
          fill
          sizes={sizes}
          className={cn('object-contain p-2', imageClassName)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),rgba(255,255,255,0.94))] text-xs font-bold uppercase tracking-[0.22em] text-slate-700',
            fallbackClassName
          )}
          aria-label={`${name} logo fallback`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}
