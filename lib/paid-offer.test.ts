import { describe, expect, it } from 'vitest'
import { PRO_WAITLIST_HREF, DOSSIER_WAITLIST_HREF, resolveOffers, validCheckoutUrl } from './paid-offer'

describe('validCheckoutUrl', () => {
  it('accepts live Stripe payment links', () => {
    expect(validCheckoutUrl('https://buy.stripe.com/abc123')).toBe('https://buy.stripe.com/abc123')
    expect(validCheckoutUrl('  https://buy.stripe.com/abc123?prefilled_promo_code=X ')).toBe('https://buy.stripe.com/abc123?prefilled_promo_code=X')
  })
  it('rejects test-mode links unless allowed', () => {
    expect(validCheckoutUrl('https://buy.stripe.com/test_abc123')).toBeNull()
    expect(validCheckoutUrl('https://buy.stripe.com/test_abc123', { allowTest: true })).toBe('https://buy.stripe.com/test_abc123')
    expect(validCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_x')).toBeNull()
  })
  it('rejects non-Stripe, non-https, empty and malformed values', () => {
    for (const bad of [undefined, null, '', '   ', 'not a url', 'http://buy.stripe.com/abc', 'https://evil.example/buy.stripe.com/abc', 'https://buy.stripe.com/', 'javascript:alert(1)', 'https://buy.stripe.com.evil.io/abc']) {
      expect(validCheckoutUrl(bad as string | undefined)).toBeNull()
    }
  })
})

describe('resolveOffers', () => {
  it('falls back to attributed waitlist signups when no checkout is configured', () => {
    const o = resolveOffers({})
    expect(o.pro).toMatchObject({ live: false, href: PRO_WAITLIST_HREF, priceLabel: null })
    expect(o.dossier).toMatchObject({ live: false, href: DOSSIER_WAITLIST_HREF, priceLabel: null })
  })
  it('never shows a price without a live checkout', () => {
    const o = resolveOffers({ proPrice: '$19/month', proUrl: 'https://buy.stripe.com/test_x' })
    expect(o.pro.live).toBe(false)
    expect(o.pro.priceLabel).toBeNull()
  })
  it('uses the configured live links and labels', () => {
    const o = resolveOffers({ proUrl: 'https://buy.stripe.com/pro1', proPrice: '$19/month founding rate', dossierUrl: 'https://buy.stripe.com/dos1', dossierPrice: '$29 one-time' })
    expect(o.pro).toMatchObject({ live: true, href: 'https://buy.stripe.com/pro1', priceLabel: '$19/month founding rate', ctaLabel: 'Become a founding member' })
    expect(o.dossier).toMatchObject({ live: true, href: 'https://buy.stripe.com/dos1', priceLabel: '$29 one-time' })
  })
})
