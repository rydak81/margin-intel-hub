"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export interface CommunityAccountProfile {
  id: string
  display_name: string
  email: string
  role: "brand_seller" | "agency" | "saas_tech" | "service_provider" | "investor"
  company?: string
  bio?: string
  joined_at: string
  reputation_score: number
  post_count: number
  is_verified: boolean
  is_admin: boolean
}

async function ensureCommunityProfile(user: User, supabase: ReturnType<typeof createClient>) {
  if (!user.email) return null

  const { data: existingByEmail, error } = await supabase
    .from("community_users")
    .select("*")
    .eq("email", user.email)
    .maybeSingle()

  if (error) {
    console.error("[auth] Failed to load community profile:", error)
    return null
  }

  if (existingByEmail) {
    return existingByEmail as CommunityAccountProfile
  }

  const metadata = user.user_metadata || {}
  const displayName =
    metadata.display_name ||
    user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase())

  const { data: inserted, error: insertError } = await supabase
    .from("community_users")
    .insert({
      display_name: displayName,
      email: user.email,
      role: metadata.role || "brand_seller",
      company: metadata.company || null,
      bio: metadata.bio || null,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[auth] Failed to bootstrap community profile:", insertError)
    return null
  }

  return inserted as CommunityAccountProfile
}

export function useAuthAccount() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CommunityAccountProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.auth.getUser()
      const authUser = data.user ?? null
      setUser(authUser)

      if (!authUser) {
        setProfile(null)
        return
      }

      const communityProfile = await ensureCommunityProfile(authUser, supabase)
      setProfile(communityProfile)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void refresh()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh()
    })

    return () => subscription.unsubscribe()
  }, [refresh, supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [supabase])

  return {
    supabase,
    user,
    currentUser: profile,
    loading,
    refresh,
    signOut,
    metadata: (user?.user_metadata || {}) as Record<string, any>,
  }
}
