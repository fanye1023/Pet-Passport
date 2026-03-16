import { createBrowserClient } from '@supabase/ssr'

// Singleton client for browser - ensures consistent auth state
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side render: create a basic client
    // Note: This should rarely be called; server components should use lib/supabase/server
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!supabaseClient) {
    // Use default cookie handling from @supabase/ssr
    // It automatically handles reading/writing cookies with proper attributes
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return supabaseClient
}
