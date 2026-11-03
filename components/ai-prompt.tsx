'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function AiPrompt({ text }: { text: string }) {
  const [status, setStatus] = useState('')
  async function copy() {
    try { await navigator.clipboard.writeText(text); setStatus('Copied. Replace the placeholders with approved, redacted inputs.') }
    catch { setStatus('Copy is unavailable. Select the prompt text below and copy it manually.') }
  }
  return <div className="my-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4"><span className="text-sm font-bold text-cyan-200">A starting prompt</span><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold hover:bg-slate-800">{status.startsWith('Copied') ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}Copy prompt</button></div><pre className="whitespace-pre-wrap break-words p-5 font-sans text-base leading-8">{text}</pre><p role="status" className="px-5 pb-4 text-sm text-cyan-200">{status}</p></div>
}
