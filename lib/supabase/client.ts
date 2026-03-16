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
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Use default cookie handling but ensure proper settings
          getAll() {
            const cookies: { name: string; value: string }[] = []
            document.cookie.split(';').forEach(cookie => {
              const [name, ...valueParts] = cookie.trim().split('=')
              if (name) {
                cookies.push({ name, value: valueParts.join('=') })
              }
            })
            return cookies
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieStr = `${name}=${value}`
              if (options?.path) cookieStr += `; path=${options.path}`
              else cookieStr += '; path=/'
              if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`
              if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`
              else cookieStr += '; samesite=lax'
              // Only set secure in production (HTTPS)
              if (window.location.protocol === 'https:') {
                cookieStr += '; secure'
              }
              document.cookie = cookieStr
            })
          }
        }
      }
    )
  }

  return supabaseClient
}
