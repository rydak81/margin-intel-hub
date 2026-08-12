"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Lock, Loader2 } from "lucide-react"

const UNLOCK_KEY = "mb_fee_unlock"

/**
 * Roles mirror the `role` CHECK constraint on public.subscribers. Keep the
 * values in sync with scripts/001_create_subscribers.sql — the API rejects
 * anything outside that set.
 */
const ROLES: { value: string; label: string }[] = [
  { value: "brand_seller", label: "Brand or seller" },
  { value: "agency", label: "Agency or consultant" },
  { value: "saas_tech", label: "SaaS or tech" },
  { value: "service_provider", label: "Service provider" },
  { value: "investor", label: "Investor" },
  { value: "other", label: "Something else" },
]

export interface GateContext {
  /** Which page produced the lead, e.g. "fees/amazon/kitchen". */
  source: string
  /** Calculator inputs at unlock time — this is the lead enrichment payload. */
  marketplace?: string
  category?: string
  salePrice?: number
  unitCost?: number
  marginPct?: number
}

interface FeeUnlockGateProps {
  context: GateContext
  /** The deeper value being gated. Rendered in full once unlocked. */
  children: ReactNode
  headline?: string
  subhead?: string
}

function hasStoredUnlock(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "1"
  } catch {
    return false
  }
}

function storeUnlock() {
  try {
    window.localStorage.setItem(UNLOCK_KEY, "1")
  } catch {
    // Private browsing / storage disabled — unlock still holds for this render.
  }
}

export function FeeUnlockGate({
  context,
  children,
  headline = "See the full breakdown",
  subhead = "Every fee line, the same product priced across all five marketplaces, and your break-even price.",
}: FeeUnlockGateProps) {
  // Always render locked on the server so markup matches the first client paint;
  // the stored unlock is applied in an effect to avoid a hydration mismatch.
  const [unlocked, setUnlocked] = useState(false)
  const [step, setStep] = useState<"email" | "role">("email")
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasStoredUnlock()) setUnlocked(true)
  }, [])

  async function submitEmail(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.")
      return
    }

    setPending(true)
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: `fee-gate:${context.source}`,
          context,
        }),
      })
      const payload = await response.json().catch(() => null)

      // An existing subscriber has already paid the price of admission — unlock
      // rather than bouncing them off their own data.
      if (response.ok || payload?.error === "already_subscribed") {
        storeUnlock()
        setStep("role")
        return
      }

      setError(payload?.error ?? "Something went wrong. Try again.")
    } catch {
      setError("Network error. Try again.")
    } finally {
      setPending(false)
    }
  }

  async function submitRole(role: string) {
    setUnlocked(true)
    // Fire-and-forget: the unlock already happened, so a failed enrichment
    // write must never block the reader from their results.
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role,
          source: `fee-gate:${context.source}`,
          context,
          update: true,
        }),
      })
    } catch {
      // Intentionally swallowed.
    }
  }

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/45">
      {/* Teaser: the real content, clipped and faded, so the value is visibly
          present rather than described. */}
      <div aria-hidden className="pointer-events-none max-h-44 overflow-hidden opacity-40 blur-[3px]">
        {children}
      </div>
      <div className="absolute inset-x-0 top-24 h-24 bg-gradient-to-b from-transparent to-white dark:to-slate-950" />

      <div className="relative border-t border-slate-200 bg-white px-6 py-6 dark:border-white/10 dark:bg-slate-950">
        {step === "email" ? (
          <>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Free — no card</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{headline}</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {subhead}
            </p>

            <form onSubmit={submitEmail} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                aria-label="Email address"
                className="h-11 max-w-sm rounded-xl"
              />
              <Button type="submit" disabled={pending} className="h-11 rounded-xl px-6">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock the breakdown"}
              </Button>
            </form>

            {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              You&apos;ll also get the daily brief when these fees change. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">You&apos;re in</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
              One quick thing — what best describes you?
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              This tunes what we send. Skip it and we&apos;ll still show your results.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => submitRole(role.value)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-white/15 dark:text-slate-200 dark:hover:border-sky-400/60 dark:hover:bg-sky-400/10 dark:hover:text-sky-300"
                >
                  {role.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setUnlocked(true)}
              className="mt-4 text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip — just show my results
            </button>
          </>
        )}
      </div>
    </div>
  )
}
