import { createBrowserClient } from '@supabase/ssr'

// Singleton client for browser - ensures consistent auth state
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// Cookie options that match what the server sets
// This ensures client-side token refreshes don't break server-side auth
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

// Parse all cookies from document.cookie string
function parseCookies(): { name: string; value: string }[] {
  if (typeof document === 'undefined') return []

  return document.cookie.split(';').map(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=')
    return {
      name: name || '',
      value: valueParts.join('=') ? decodeURIComponent(valueParts.join('=')) : '',
    }
  }).filter(c => c.name)
}

// Default max age for auth cookies (7 days in seconds)
// This ensures cookies persist even if Supabase doesn't provide maxAge
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7

// Set a cookie with consistent options
function setCookie(name: string, value: string, maxAge?: number) {
  // Use provided maxAge, or default to 7 days for auth cookies
  const effectiveMaxAge = maxAge ?? (name.includes('sb-') || name.includes('auth') ? DEFAULT_MAX_AGE : undefined)

  let cookie = `${name}=${encodeURIComponent(value)}; path=${cookieOptions.path}; SameSite=${cookieOptions.sameSite}`
  if (cookieOptions.secure) {
    cookie += '; Secure'
  }
  if (effectiveMaxAge !== undefined) {
    cookie += `; Max-Age=${effectiveMaxAge}`
  }
  document.cookie = cookie
  console.log('[Supabase Client] Cookie set:', name, 'maxAge:', effectiveMaxAge)
}

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
    // Use explicit cookie options with getAll/setAll (recommended by @supabase/ssr)
    // This prevents cookie attribute mismatches when tokens are refreshed client-side
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = parseCookies()
            // Debug: log auth cookies being read
            const authCookies = cookies.filter(c =>
              c.name.includes('sb-') || c.name.includes('auth')
            )
            if (authCookies.length > 0) {
              console.log('[Supabase Client] getAll auth cookies:', authCookies.map(c => ({
                name: c.name,
                length: c.value.length
              })))
            }
            return cookies
          },
          setAll(cookiesToSet) {
            console.log('[Supabase Client] setAll called with:', cookiesToSet.map(c => ({
              name: c.name,
              length: c.value.length,
              maxAge: c.options?.maxAge
            })))

            // First, clear any existing auth cookies to prevent stale chunks
            // This handles the case where token size changes and leaves orphan chunks
            const existingCookies = parseCookies()
            const cookieNamesToSet = new Set(cookiesToSet.map(c => c.name))

            for (const existing of existingCookies) {
              // If it's an auth cookie that's NOT in the new set, clear it
              // This removes orphan chunks when token size changes
              if ((existing.name.includes('sb-') || existing.name.includes('auth')) &&
                  !cookieNamesToSet.has(existing.name)) {
                // Check if it's a chunk of a cookie we're setting (e.g., sb-xxx.0 when setting sb-xxx.1)
                const baseName = existing.name.replace(/\.\d+$/, '')
                const isChunkOfSettingCookie = cookiesToSet.some(c =>
                  c.name.startsWith(baseName) || baseName.startsWith(c.name.replace(/\.\d+$/, ''))
                )
                if (isChunkOfSettingCookie) {
                  console.log('[Supabase Client] Clearing orphan chunk:', existing.name)
                  document.cookie = `${existing.name}=; path=${cookieOptions.path}; Max-Age=0`
                }
              }
            }

            for (const { name, value, options } of cookiesToSet) {
              setCookie(name, value, options?.maxAge)
            }
          },
        },
      }
    )
  }

  return supabaseClient
}
