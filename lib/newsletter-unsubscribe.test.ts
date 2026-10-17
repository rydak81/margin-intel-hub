import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateDailyBriefEmail, generateDailyBriefText } from './email-templates'
import { GET, POST } from '@/app/api/unsubscribe/route'

const db = vi.hoisted(() => ({ eq: vi.fn(), remove: vi.fn(), from: vi.fn(), admin: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: db.admin }))
const brief = { briefContent: 'Synthetic news fixture.', date: 'Friday, October 16, 2026', articleCount: 1 }
const request = (query: string) => new Request(`https://example.com/api/unsubscribe?${query}`)
const post = (query: string) => new Request('https://example.com/api/unsubscribe', { method: 'POST', body: new URLSearchParams(query) })
beforeEach(() => {
  vi.clearAllMocks()
  db.admin.mockReturnValue({ from: db.from })
  db.from.mockReturnValue({ delete: db.remove })
  db.remove.mockReturnValue({ eq: db.eq })
  db.eq.mockResolvedValue({ count: 1, error: null })
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks() })

describe('daily brief recipient links', () => {
  it('sends distinct encoded links in HTML and text through the actual batch sender', async () => {
    vi.stubEnv('RESEND_API_KEY', 'synthetic-test-key')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'fixture' }) })
    vi.stubGlobal('fetch', fetchMock)
    const { sendBatchEmails } = await import('./email')
    const recipients = [{ email: 'first+brief@example.com' }, { email: 'second@example.com' }]
    const result = await sendBatchEmails(recipients, 'Fixture',
      s => generateDailyBriefEmail({ ...brief, subscriberEmail: s.email }),
      s => generateDailyBriefText({ ...brief, subscriberEmail: s.email }))
    expect(result).toMatchObject({ sent: 2, failed: 0 })
    for (const [index, call] of fetchMock.mock.calls.entries()) {
      const sent = JSON.parse(call[1].body)
      const encoded = encodeURIComponent(recipients[index].email)
      expect(sent.to).toEqual([recipients[index].email])
      expect(sent.html).toContain(`email=${encoded}`)
      expect(sent.text).toContain(`email=${encoded}`)
      expect(sent.html + sent.text).not.toContain('{{email}}')
    }
  })
})

describe('unsubscribe outcomes (mocked database only)', () => {
  it.each(['', 'email=%7B%7Bemail%7D%7D', 'email=not-an-email', 'email=a@example.com&email=b@example.com', 'email=%3Cscript%3E'])('rejects invalid/ambiguous links without touching subscribers: %s', async query => {
    const response = await GET(request(query))
    expect(response.status).toBe(400)
    expect((await POST(post(query))).status).toBe(400)
    expect(db.admin).not.toHaveBeenCalled()
    expect(await response.text()).not.toContain("You've been unsubscribed")
  })
  it('GET only renders confirmation, including for mail scanners', async () => {
    const response = await GET(request('email=fixture@example.com'))
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('form method="post"')
    expect(db.admin).not.toHaveBeenCalled()
  })
  it('supports quoted local parts accepted by signup and escapes the form value', async () => {
    const email = '"customer"@example.com'
    const query = `email=${encodeURIComponent(email)}`
    const html = await (await GET(request(query))).text()
    expect(html).toContain('value="&quot;customer&quot;@example.com"')
    expect(db.admin).not.toHaveBeenCalled()
    expect((await POST(post(query))).status).toBe(200)
    expect(db.eq).toHaveBeenCalledWith('email', email)
  })
  it('confirms an actual matched deletion and normalizes email', async () => {
    const response = await POST(post('email=FIRST%2Bbrief%40example.com'))
    expect(db.remove).toHaveBeenCalledWith({ count: 'exact' })
    expect(db.eq).toHaveBeenCalledWith('email', 'first+brief@example.com')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.text()).toContain("You've been unsubscribed")
  })
  it('does not claim a deletion for an absent or already removed subscriber', async () => {
    db.eq.mockResolvedValue({ count: 0, error: null })
    const response = await POST(post('email=absent@example.com'))
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain('No subscription was changed')
    expect(html).not.toContain("You've been unsubscribed")
  })
  it.each([{ count: null, error: null }, { count: 0, error: { message: 'fixture failure' } }])('never claims success on a failed or unconfirmed result: %o', async result => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    db.eq.mockResolvedValue(result)
    const response = await POST(post('email=fixture@example.com'))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain("You've been unsubscribed")
  })
})
