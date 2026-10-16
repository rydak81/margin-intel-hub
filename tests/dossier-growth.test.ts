import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { newsletterSource } from '@/lib/newsletter-source'

const dossier = readFileSync(new URL('../public/intelligence/dossier-2026-10.html', import.meta.url), 'utf8')
const newsletter = readFileSync(new URL('../app/newsletter/page.tsx', import.meta.url), 'utf8')

test('newsletter attribution keeps dossier campaign and rejects unsafe values', () => {
  assert.equal(newsletterSource('?source=dossier_2026_10'), 'newsletter_dossier_2026_10')
  for (const search of ['', '?source=other', '?source=private@example.com', '?source=dossier_2026_10&source=other', '?source=dossier_2026_10&source=dossier_2026_10']) {
    assert.equal(newsletterSource(search), 'newsletter_page')
  }
  assert.equal(newsletterSource('?email=private@example.com&source=dossier_2026_10'), 'newsletter_dossier_2026_10')
})

test('report metadata lives in its head and preserves the overview canonical', () => {
  const head = dossier.split('</head>')[0]
  assert.match(head, /<title>The 2026 Margin Squeeze/)
  assert.match(head, /name="description"/)
  assert.match(head, /rel="canonical" href="https:\/\/marketplacebeta.com\/intelligence\/dossier"/)
  assert.equal((dossier.match(/<head>/g) || []).length, 1)
  assert.equal((dossier.match(/<body>/g) || []).length, 1)
  assert.ok(dossier.indexOf('</head>') < dossier.indexOf('<body>'))
})

test('report navigation has working section anchors and next steps', () => {
  const ids = new Set([...dossier.matchAll(/id="([^"]+)"/g)].map(match => match[1]))
  for (const match of dossier.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1])
  assert.match(dossier, /href="\/"/)
  assert.match(dossier, /href="\/news"/)
  assert.equal((dossier.match(/href="\/newsletter\?source=dossier_2026_10#subscribe"/g) || []).length, 2)
  assert.match(newsletter, /id="subscribe"/)
  assert.match(newsletter, /Read the October dossier without signing up/)
})

test('signup reuses allowlisted source and existing success-only event', () => {
  assert.match(newsletter, /const source = newsletterSource\(window.location.search\)/)
  assert.match(newsletter, /trackResourceEvent\("newsletter_signup", source\)/)
  assert.ok(newsletter.indexOf('if (!response.ok)') < newsletter.indexOf('trackResourceEvent("newsletter_signup", source)'))
  assert.doesNotMatch(dossier, /<script/)
})
