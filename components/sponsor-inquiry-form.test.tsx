// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SponsorInquiryForm } from './sponsor-inquiry-form'

const values = { name: 'Reliability test', email: 'test@example.com', company: 'Synthetic test', offer: 'single_slot', message: 'Synthetic inquiry, not a sponsorship booking.' }
const draftKey = 'sponsor-inquiry-draft:sponsor'
let container: HTMLDivElement
let root: Root
const fetchMock = vi.fn()
const response = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
const field = (name: string) => container.querySelector(`[name="${name}"]`) as HTMLInputElement
async function mount() {
  await act(async () => { root.render(<SponsorInquiryForm sourcePage="sponsor" />) })
}
async function submit() {
  await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
}
function fill() { for (const [key, value] of Object.entries(values)) field(key).value = value }
function retained() { for (const [key, value] of Object.entries(values)) expect(field(key).value).toBe(value) }

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  sessionStorage.clear()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await mount()
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals(); vi.restoreAllMocks()
})

describe('sponsor inquiry recovery', () => {
  it('clears the submitted draft only after explicit success', async () => {
    fetchMock.mockResolvedValue(response(200, { success: true, stored: true }))
    fill(); await submit()
    expect(container.querySelector('form')).toBeNull()
    expect(container.textContent).toContain('your inquiry has been saved')
    expect(sessionStorage.getItem(draftKey)).toBeNull()
  })
  it.each([
    [503, { success: false, stored: false, error: 'Please retry shortly.' }],
    [503, { success: false, stored: true, error: 'Saved; notification failed. Please retry.' }],
    [429, { success: false, error: 'Please try again in an hour.' }],
    [200, { success: false }],
    [200, { success: 'true' }],
    [200, null],
    [500, { success: true }],
  ])('preserves every field and the retry draft for HTTP %s and %j', async (status, body) => {
    fetchMock.mockResolvedValue(response(status, body))
    fill(); await submit(); retained()
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/retry|try again/)
    expect(JSON.parse(sessionStorage.getItem(draftKey)!).data).toMatchObject(values)
  })
  it.each(['network', 'timeout', 'invalid JSON'])('preserves the draft for %s errors', async kind => {
    if (kind === 'invalid JSON') fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new Error('bad JSON') } })
    else fetchMock.mockRejectedValue(new Error(kind))
    fill(); await submit(); retained()
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('details are still here')
  })
  it('restores after remount, retries with the same reference, then clears on success', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connection dropped'))
    fill(); await submit()
    const first = JSON.parse(fetchMock.mock.calls[0][1].body)
    await act(async () => root.unmount())
    root = createRoot(container)
    await mount(); retained()
    fetchMock.mockResolvedValueOnce(response(200, { success: true, stored: true }))
    await submit()
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).inquiryId).toBe(first.inquiryId)
    expect(sessionStorage.getItem(draftKey)).toBeNull()
  })
  it('uses a new reference when the visitor edits the failed inquiry', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    fill(); await submit()
    field('message').value += ' New timing.'
    await submit()
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).inquiryId).not.toBe(JSON.parse(fetchMock.mock.calls[0][1].body).inquiryId)
  })
  it('keeps in-memory details and allows retry when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    fetchMock.mockRejectedValue(new Error('offline'))
    fill(); await submit(); retained()
    expect(container.querySelector('button')?.disabled).toBe(false)
  })
  it('disables inputs and submit while waiting, then enables them on failure', async () => {
    let finish!: (value: unknown) => void
    fetchMock.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    fill(); await submit()
    expect(container.querySelector('fieldset')?.disabled).toBe(true)
    expect(container.querySelector('button')?.disabled).toBe(true)
    await act(async () => finish(response(503, { success: false })))
    retained()
    expect(container.querySelector('fieldset')?.disabled).toBe(false)
  })
})
