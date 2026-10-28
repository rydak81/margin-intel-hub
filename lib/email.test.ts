import { afterEach, describe, expect, it, vi } from 'vitest'
const options = { to: 'owner@example.com', subject: 'Test', html: '<p>Test</p>' }
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks() })
async function setup() {
  vi.resetModules(); vi.stubEnv('RESEND_API_KEY', 'synthetic-test-key')
  vi.spyOn(console, 'error').mockImplementation(() => {})
  return (await import('./email')).sendEmail
}
describe('Resend acceptance contract', () => {
  it('passes the idempotency key and timeout signal, returning a provider ID', async () => {
    const send = await setup()
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'provider-id' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const signal = AbortSignal.timeout(1000)
    expect(await send({ ...options, idempotencyKey: 'sponsor-inquiry/test', signal })).toEqual({ success: true, id: 'provider-id' })
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ signal, headers: { 'Idempotency-Key': 'sponsor-inquiry/test' } })
  })
  it.each([null, {}, { id: '' }, { id: 123 }])('does not treat an HTTP 200 without a provider ID as acceptance: %j', async body => {
    const send = await setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))))
    expect((await send(options)).success).toBe(false)
  })
  it('handles rejection, timeouts and missing configuration', async () => {
    const send = await setup()
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('rejected', { status: 429 })).mockRejectedValueOnce(new Error('timeout'))
    vi.stubGlobal('fetch', fetchMock)
    expect((await send(options)).success).toBe(false)
    expect((await send(options)).success).toBe(false)
    vi.resetModules(); vi.stubEnv('RESEND_API_KEY', '')
    expect((await (await import('./email')).sendEmail(options)).success).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
