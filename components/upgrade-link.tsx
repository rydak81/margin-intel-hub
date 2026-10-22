'use client'
import { trackResourceEvent } from '@/lib/resource-analytics'
import type { ComponentProps } from 'react'

/** Upgrade/checkout link with a fixed placement identifier for analytics. */
export function UpgradeLink({ placement, children, href, ...props }: ComponentProps<'a'> & { placement: string; href: string }) {
  const external = /^https:\/\//.test(href)
  return (
    <a
      {...props}
      href={href}
      rel={external ? 'noopener' : props.rel}
      onClick={() => trackResourceEvent('upgrade_click', placement)}
    >
      {children}
    </a>
  )
}
