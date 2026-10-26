'use client'

import { useState, type FormEvent } from 'react'
import { HONEYPOT_FIELD, SPONSOR_LIMITS, SPONSOR_OFFERS, type SponsorSourcePage } from '@/lib/sponsor-inquiry'

type Status = 'idle' | 'sending' | 'success' | 'error'

const field = 'mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40'

/** Sponsor inquiry form. Posts to /api/sponsor-inquiry. Designed for a dark panel. */
export function SponsorInquiryForm({ sourcePage, defaultOffer = '' }: { sourcePage: SponsorSourcePage; defaultOffer?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/sponsor-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, sourcePage }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        setStatus('success')
        form.reset()
        return
      }
      setError(typeof json.error === 'string' ? json.error : 'Something went wrong. Please try again.')
      setStatus('error')
    } catch {
      setError('Could not send your message. Check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-100">
        <p className="font-semibold">Thanks, we got your message.</p>
        <p className="mt-1 text-sm">We&apos;ll reply to the email address you gave us with current audience details, dates and rates.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 text-left sm:grid-cols-2" aria-label="Sponsor inquiry form">
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
        {status === 'error' ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
    </form>
  )
}
