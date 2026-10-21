import { describe, expect, it } from 'vitest'
import { getDossierSponsor } from './sponsorship'
import { generateDossierEmail, renderDossierSponsorCredit } from './email-templates'

describe('dossier presenting sponsor', () => {
  it('is hidden when unset or invalid', () => {
    expect(getDossierSponsor({})).toBeNull()
    expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme' })).toBeNull()
    expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme', DOSSIER_SPONSOR_URL: 'javascript:alert(1)' })).toBeNull()
    for (const bad of ['https://', 'http://', 'https://exa mple.com']) {
      expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme', DOSSIER_SPONSOR_URL: bad }), bad).toBeNull()
    }
    expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme', DOSSIER_SPONSOR_URL: 'https://acme.test', DOSSIER_SPONSOR_LOGO_URL: 'https://' })?.logoUrl).toBeUndefined()
    expect(renderDossierSponsorCredit(null)).toBe('')
    const html = generateDossierEmail('Sam', 'sam@example.com', null)
    expect(html).not.toContain('Presented by')
  })

  it('reads name, url and an optional http(s) logo', () => {
    expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: ' Acme ', DOSSIER_SPONSOR_URL: 'https://acme.test', DOSSIER_SPONSOR_LOGO_URL: 'ftp://x' }))
      .toEqual({ name: 'Acme', url: 'https://acme.test/?utm_source=marketplacebeta&utm_medium=dossier', logoUrl: undefined })
    expect(getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme', DOSSIER_SPONSOR_URL: 'https://acme.test', DOSSIER_SPONSOR_LOGO_URL: 'https://acme.test/logo.png' })?.logoUrl)
      .toBe('https://acme.test/logo.png')
  })

  it("tags the link with utm_medium=dossier without overriding the sponsor's UTMs", () => {
    const own = getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'Acme', DOSSIER_SPONSOR_URL: 'https://acme.test/?utm_source=mb&utm_campaign=oct' })!
    const q = new URL(own.url).searchParams
    expect(q.get('utm_source')).toBe('mb')
    expect(q.get('utm_campaign')).toBe('oct')
    expect(q.get('utm_medium')).toBe('dossier')
  })

  it('renders a labelled, escaped credit in the delivery email', () => {
    const sponsor = getDossierSponsor({ DOSSIER_SPONSOR_NAME: 'A<b>', DOSSIER_SPONSOR_URL: 'https://acme.test/?a=1&b=2', DOSSIER_SPONSOR_LOGO_URL: 'https://acme.test/l.png' })
    const html = generateDossierEmail('Sam', 'sam@example.com', sponsor)
    expect(html).toContain('Sponsored &middot; Presented by')
    expect(html).toContain('A&lt;b&gt;')
    expect(html).not.toContain('A<b>')
    expect(html).toContain('href="https://acme.test/?a=1&amp;b=2&amp;utm_source=marketplacebeta&amp;utm_medium=dossier" rel="sponsored nofollow noopener"')
    expect(html).toContain('src="https://acme.test/l.png"')
  })
})
