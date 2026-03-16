import { createBrowserClient } from '@supabase/ssr'

// Singleton client for browser - ensures consistent auth state
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null
let clientInitialized = false

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create fresh client
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!supabaseClient) {
    console.log('[Supabase Client] Creating singleton browser client')
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    clientInitialized = true
  }

  return supabaseClient
}

// Helper to check if client has been initialized
export function isClientInitialized() {
  return clientInitialized
}
