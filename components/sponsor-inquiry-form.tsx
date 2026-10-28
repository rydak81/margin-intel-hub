'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SPONSOR_PAYMENT_NOTE } from '@/lib/sponsor-offers'
import { HONEYPOT_FIELD, SPONSOR_LIMITS, SPONSOR_OFFERS, type SponsorSourcePage } from '@/lib/sponsor-inquiry'

type Status = 'idle' | 'sending' | 'success' | 'error'

const field = 'mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40'

/** Sponsor inquiry form. Posts to /api/sponsor-inquiry. Designed for a dark panel. */
export function SponsorInquiryForm({ sourcePage, defaultOffer = '' }: { sourcePage: SponsorSourcePage; defaultOffer?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const attempt = useRef<{ inquiryId: string; payload: string } | null>(null)
  const draftKey = `sponsor-inquiry-draft:${sourcePage}`

  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) || 'null')
      if (!draft || typeof draft.inquiryId !== 'string' || !draft.data) return
      for (const name of ['name', 'email', 'company', 'offer', 'message']) {
        const input = formRef.current?.elements.namedItem(name)
        if (input && 'value' in input && typeof draft.data[name] === 'string') input.value = draft.data[name]
      }
      attempt.current = { inquiryId: draft.inquiryId, payload: JSON.stringify(draft.data) }
    } catch { /* Storage may be disabled; the form still keeps values in memory. */ }
  }, [draftKey])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const data = { ...Object.fromEntries(new FormData(form).entries()), sourcePage }
    const payload = JSON.stringify(data)
    setStatus('sending')
    setError('')
    try {
      if (!attempt.current || attempt.current.payload !== payload) {
        attempt.current = { inquiryId: crypto.randomUUID(), payload }
      }
      const inquiryId = attempt.current.inquiryId
      // Keep a tab-scoped retry copy, including its deduplication reference.
      try { sessionStorage.setItem(draftKey, JSON.stringify({ inquiryId, data })) } catch { /* Optional recovery. */ }
      const res = await fetch('/api/sponsor-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, inquiryId }),
        signal: AbortSignal.timeout(45000),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json?.success === true) {
        try { sessionStorage.removeItem(draftKey) } catch { /* Optional recovery. */ }
        attempt.current = null
        setStatus('success')
        form.reset()
        return
      }
      setError(typeof json?.error === 'string' ? json.error : 'We could not confirm your inquiry. Your details are still here; please try again.')
      setStatus('error')
    } catch {
      setError('We could not confirm your inquiry. Your details are still here. Check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-100">
        <p className="font-semibold">Thanks, your inquiry has been saved.</p>
        <p className="mt-1 text-sm">We&apos;ll reply to the email address you gave us with available dates. Payment is by invoice or payment link after your inquiry (PayPal is also possible).</p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-6 grid gap-4 text-left sm:grid-cols-2" aria-label="Sponsor inquiry form" aria-busy={status === 'sending'}>
      <fieldset disabled={status === 'sending'} className="contents">
      <label className="block text-sm font-medium text-slate-200">Name
        <input name="name" required maxLength={SPONSOR_LIMITS.name} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-200">Work email
        <input name="email" type="email" required maxLength={SPONSOR_LIMITS.email} autoComplete="email" className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-200">Company
        <input name="company" required maxLength={SPONSOR_LIMITS.company} autoComplete="organization" className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-200">What are you interested in?
        <select name="offer" required defaultValue={defaultOffer} className={field}>
          <option value="" disabled>Choose one</option>
          {SPONSOR_OFFERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-200 sm:col-span-2">Message
        <textarea name="message" required minLength={SPONSOR_LIMITS.messageMin} maxLength={SPONSOR_LIMITS.message} rows={5} placeholder="Your product, the audience you want to reach and your timing." className={field} />
      </label>
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Leave this field empty<input name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'sending'} className="inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : 'Send inquiry →'}
        </button>
        <p className="mt-3 text-sm text-slate-400">{SPONSOR_PAYMENT_NOTE}</p>
        {status === 'error' ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
      </fieldset>
    </form>
  )
}
