"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, LogOut, Save, Sparkles } from "lucide-react"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ACCOUNT_PLATFORM_OPTIONS,
  ACCOUNT_TOPIC_OPTIONS,
  DIGEST_MODE_OPTIONS,
  type DigestMode,
} from "@/lib/account-preferences"
import { useAuthAccount } from "@/hooks/use-auth-account"
import { AuthPanel } from "@/components/auth-panel"

interface FormState {
  display_name: string
  role: string
  company: string
  bio: string
  title: string
  linkedin_url: string
  preferred_platforms: string[]
  preferred_topics: string[]
  digest_mode: DigestMode
}

const EMPTY_STATE: FormState = {
  display_name: "",
  role: "brand_seller",
  company: "",
  bio: "",
  title: "",
  linkedin_url: "",
  preferred_platforms: [],
  preferred_topics: [],
  digest_mode: "operator_plus_personal",
}

export function AccountPageClient() {
  const { supabase, user, currentUser, loading, metadata, refresh, signOut } = useAuthAccount()
  const [form, setForm] = useState<FormState>(EMPTY_STATE)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return

    setForm({
      display_name: currentUser?.display_name || metadata.display_name || "",
      role: currentUser?.role || metadata.role || "brand_seller",
      company: currentUser?.company || metadata.company || "",
      bio: currentUser?.bio || metadata.bio || "",
      title: metadata.title || "",
      linkedin_url: metadata.linkedin_url || "",
      preferred_platforms: metadata.preferred_platforms || [],
      preferred_topics: metadata.preferred_topics || [],
      digest_mode: metadata.digest_mode || "operator_plus_personal",
    })
  }, [user, currentUser, metadata])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!user?.email) return

    setIsSaving(true)
    setSaved(false)
    setError("")

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: form.display_name,
          role: form.role,
          company: form.company,
          bio: form.bio,
          title: form.title,
          linkedin_url: form.linkedin_url,
          preferred_platforms: form.preferred_platforms,
          preferred_topics: form.preferred_topics,
          digest_mode: form.digest_mode,
        },
      })

      if (authError) throw authError

      if (currentUser) {
        const { error: profileError } = await supabase
          .from("community_users")
          .update({
            display_name: form.display_name,
            role: form.role,
            company: form.company || null,
            bio: form.bio || null,
          })
          .eq("id", currentUser.id)

        if (profileError) throw profileError
      } else {
        const { error: insertError } = await supabase.from("community_users").insert({
          display_name: form.display_name,
          email: user.email,
          role: form.role,
          company: form.company || null,
          bio: form.bio || null,
        })

        if (insertError) throw insertError
      }

      await refresh()
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save account settings")
    } finally {
      setIsSaving(false)
    }
  }

  function toggleSelection(field: "preferred_platforms" | "preferred_topics", value: string) {
    setForm((previous) => {
      const currentValues = previous[field]
      return {
        ...previous,
        [field]: currentValues.includes(value)
          ? currentValues.filter((entry) => entry !== value)
          : [...currentValues, value],
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
        <PremiumSiteHeader active="community" deskLabel="Account" backHref="/" backLabel="Home" />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
            <CardContent className="p-6 md:p-8">
              <AuthPanel
                redirectTo="/account"
                title="Sign in to personalize MarketplaceBeta"
                description="Create an account to unlock community participation, saved preferences, and personalized digest recommendations."
              />
            </CardContent>
          </Card>
        </main>
        <PremiumSiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="community" deskLabel="Account" backHref="/" backLabel="Home" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_48%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(15,23,42,0.74)_48%,rgba(30,41,59,0.82))] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span className="text-muted-foreground">
                  Personalized operator workspace
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Your MarketplaceBeta account
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Set your role, marketplaces, and content preferences so the site and future digest recommendations can feel more relevant to the way you work.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/60 bg-white/70 dark:border-white/10 dark:bg-slate-950/40">
                <Link href="/community">Open community</Link>
              </Button>
              <Button variant="ghost" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input id="display_name" value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                    <SelectTrigger id="role">
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
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input id="linkedin_url" value={form.linkedin_url} onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="min-h-[120px]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Preferred marketplaces</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ACCOUNT_PLATFORM_OPTIONS.map((platform) => (
                      <Badge
                        key={platform}
                        variant={form.preferred_platforms.includes(platform) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSelection("preferred_platforms", platform)}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Topics you care about</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ACCOUNT_TOPIC_OPTIONS.map((topic) => (
                      <Badge
                        key={topic}
                        variant={form.preferred_topics.includes(topic) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSelection("preferred_topics", topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digest_mode">Digest mode</Label>
                  <Select value={form.digest_mode} onValueChange={(value: DigestMode) => setForm({ ...form, digest_mode: value })}>
                    <SelectTrigger id="digest_mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIGEST_MODE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}

            {saved ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
                Account preferences saved. MarketplaceBeta can now use them for future personalization and digest tuning.
              </div>
            ) : null}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save preferences
            </Button>
          </form>

          <aside className="space-y-6">
            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle className="text-base">What this unlocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Use one account for community participation, posting, and saved marketplace preferences.</p>
                <p>Future personalized feeds and digests can prioritize the platforms and topics you select here.</p>
                <p>Your account also becomes the foundation for watchlists, follows, saved stories, and tailored partner recommendations.</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                  Recommended next step
                </p>
                <h3 className="mt-2 text-lg font-bold">Join the operator network</h3>
                <p className="mt-3 text-sm leading-7 text-primary-foreground/80">
                  Once your profile looks right, participate in community threads and help shape future Operator Pulse coverage.
                </p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/community">Open community</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
