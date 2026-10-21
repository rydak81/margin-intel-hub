// UTM tagging for sponsor links. Adds MarketplaceBeta's source/medium so sponsors
// can see our traffic in their own analytics, but never overrides a UTM parameter
// the sponsor already put on the URL. Non-URL input is returned unchanged.

export const UTM_SOURCE = 'marketplacebeta'

export function withUtm(url: string, medium: string, extra: { campaign?: string; content?: string } = {}): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url
  const params = parsed.searchParams
  const setIfAbsent = (key: string, value: string | undefined) => {
    if (value && !params.has(key)) params.set(key, value)
  }
  setIfAbsent('utm_source', UTM_SOURCE)
  setIfAbsent('utm_medium', medium)
  setIfAbsent('utm_campaign', extra.campaign)
  setIfAbsent('utm_content', extra.content)
  return parsed.toString()
}
