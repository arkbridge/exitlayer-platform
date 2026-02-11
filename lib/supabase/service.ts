import { createClient } from '@supabase/supabase-js'

/**
 * Service role Supabase client for server-side operations
 * that don't require user authentication (e.g., anonymous audit sessions).
 *
 * ONLY use in API routes / server components. Never expose to client.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
