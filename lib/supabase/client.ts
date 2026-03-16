import { createBrowserClient } from '@supabase/ssr'

// Only create singleton on client-side
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Always create fresh on server (SSR) - will be discarded anyway
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // On client, use singleton
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return supabaseClient
}
