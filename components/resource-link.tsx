'use client'
import { trackResourceEvent } from '@/lib/resource-analytics'
import type { ComponentProps } from 'react'

type ResourceEvent = 'manufacturing_meshnomics_click' | 'resource_download_click' | 'guide_tool_click' | 'guide_newsletter_click'
export function ResourceLink({ event, resource, children, ...props }: ComponentProps<'a'> & { event: ResourceEvent; resource: string }) {
  return <a {...props} onClick={() => {
    // Fixed resource identifiers only; never search text, emails, or calculator values.
    trackResourceEvent(event, resource)
  }}>{children}</a>
}
