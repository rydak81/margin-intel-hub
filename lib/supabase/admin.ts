import { createClient } from '@supabase/supabase-js'

const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_SUPABASE_SERVICE_KEY = 'placeholder-service-role-key'
let hasWarnedMissingAdminEnv = false

export function hasAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Admin Supabase client using service role key.
 * This bypasses RLS and should only be used in server-side API routes.
 * Never expose this client to the client-side.
 */
export function createAdminClient() {
  const hasConfig = hasAdminConfig()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_SUPABASE_SERVICE_KEY

  if (!hasConfig && !hasWarnedMissingAdminEnv) {
    console.warn('[supabase/admin] Missing Supabase environment variables. Using inert fallback client.')
    hasWarnedMissingAdminEnv = true
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
