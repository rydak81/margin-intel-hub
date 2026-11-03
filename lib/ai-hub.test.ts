import { describe, expect, it, vi } from 'vitest'
import { AI_PLAYBOOKS, getAiPlaybook, filterAiPlaybooks } from './ai-playbooks'
import { SITE_NAVIGATION } from './site-navigation'
import sitemap from '@/app/sitemap'
import config from '@/next.config.mjs'

vi.mock('@/lib/supabase/admin', () => ({createAdminClient: () => { throw new Error('No database in this test') }}))

describe('AI desk migration', () => {
  it('publishes discoverable playbook URLs without the retired desk in navigation or sitemap', async () => {
    const urls = (await sitemap()).map(x=>x.url)
    expect(SITE_NAVIGATION).toContainEqual({key:'ai',href:'/ai',label:'AI for Operators'})
    expect(SITE_NAVIGATION.some(x=>x.href.includes('manufacturing'))).toBe(false)
    expect(urls).toContain('https://marketplacebeta.com/ai')
    expect(urls.some(x=>x.includes('desktop-manufacturing'))).toBe(false)
    for (const p of AI_PLAYBOOKS) expect(urls).toContain(`https://marketplacebeta.com/ai/${p.slug}`)
    const redirects=await config.redirects!()
    expect(redirects).toContainEqual({source:'/desktop-manufacturing',destination:'/ai',permanent:true})
    expect(redirects.some(x=>x.source.includes('desktop-manufacturing/'))).toBe(false)
  })
  it('resolves real guides and rejects unknown slugs', () => {
    expect(new Set(AI_PLAYBOOKS.map(p=>p.slug)).size).toBe(AI_PLAYBOOKS.length)
    for (const p of AI_PLAYBOOKS) expect(getAiPlaybook(p.slug)).toBe(p)
    expect(getAiPlaybook('not-a-playbook')).toBeUndefined()
    for (const p of AI_PLAYBOOKS) {
      expect(p.sources.every(s=>new URL(s.href).protocol==='https:')).toBe(true)
      expect(p.review.length).toBeGreaterThan(0)
    }
  })
  it('filters by both category and query with an empty result for a mismatch', () => {
    expect(filterAiPlaybooks(' SKU ', 'Listings').map(p=>p.category)).toEqual(['Listings'])
    expect(filterAiPlaybooks('unmatched zzz', '')).toHaveLength(0)
    expect(filterAiPlaybooks('', '')).toHaveLength(AI_PLAYBOOKS.length)
  })
})
