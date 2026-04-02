"use client"

import { useMemo, useState } from "react"
import { Loader2, Mail, Sparkles, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface AuthPanelProps {
  redirectTo?: string
  title?: string
  description?: string
  onSent?: () => void
}

export function AuthPanel({
  redirectTo = "/account",
  title = "Sign in to MarketplaceBeta",
  description = "Use a secure email magic link to access your account, preferences, and community profile.",
  onSent,
}: AuthPanelProps) {
  const supabase = useMemo(() => createClient(), [])
  const [mode, setMode] = useState<"signin" | "join">("signin")
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState("brand_seller")
  const [company, setCompany] = useState("")
  const [bio, setBio] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const origin = window.location.origin
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
          data: {
            display_name: displayName || undefined,
            role,
            company: company || undefined,
            bio: bio || undefined,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSent(true)
      onSent?.()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send sign-in link")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/82 p-6 text-center dark:border-white/10 dark:bg-slate-950/45">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-bold">Check your email</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We sent a secure sign-in link to <span className="font-semibold text-foreground">{email}</span>. Open it on this device to finish signing in.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      <div className="inline-flex rounded-full border border-white/70 bg-white/76 p-1 dark:border-white/10 dark:bg-slate-950/45">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "signin" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-muted-foreground"
          }`}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "join" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-muted-foreground"
          }`}
          onClick={() => setMode("join")}
        >
          Join the network
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        {mode === "join" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="auth-name">Display name</Label>
                <Input
                  id="auth-name"
                  placeholder="Ryan Dacus"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required={mode === "join"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="auth-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand_seller">Brand / Seller</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="saas_tech">SaaS / Tech</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-company">Company</Label>
              <Input
                id="auth-company"
                placeholder="Your company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-bio">Short bio</Label>
              <Textarea
                id="auth-bio"
                placeholder="What you do in the marketplace ecosystem"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === "join" ? <Sparkles className="mr-2 h-4 w-4" /> : <User2 className="mr-2 h-4 w-4" />}
          {mode === "join" ? "Send join link" : "Send sign-in link"}
        </Button>

        <p className="text-xs leading-6 text-muted-foreground">
          We use passwordless email login. Once you sign in, MarketplaceBeta can remember your operator profile, content preferences, and community participation.
        </p>
      </form>
    </div>
  )
}
