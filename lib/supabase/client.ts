import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = []
          if (typeof document === 'undefined') return cookies

          document.cookie.split(';').forEach(cookie => {
            const [name, ...valueParts] = cookie.trim().split('=')
            if (name) {
              cookies.push({
                name,
                value: decodeURIComponent(valueParts.join('='))
              })
            }
          })
          return cookies
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return

          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${encodeURIComponent(value)}`

            // Set expiration (default 1 year for auth cookies)
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            } else {
              // Default to 1 year
              cookieString += `; Max-Age=31536000`
            }

            cookieString += `; Path=${options?.path || '/'}`
            cookieString += `; SameSite=${options?.sameSite || 'Lax'}`

            if (options?.secure !== false && window.location.protocol === 'https:') {
              cookieString += `; Secure`
            }

            document.cookie = cookieString
          })
        },
      },
    }
  )
}
