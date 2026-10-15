/** Accept only a known campaign key; never forward arbitrary URL values. */
export function newsletterSource(search: string): 'newsletter_dossier_2026_10' | 'newsletter_page' {
  const values = new URLSearchParams(search).getAll('source')
  return values.length === 1 && values[0] === 'dossier_2026_10'
    ? 'newsletter_dossier_2026_10'
    : 'newsletter_page'
}
