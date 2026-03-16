import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Consistent cookie options across client and server
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function createClient() {
  const cookieStore = await cookies()

  // Debug: log auth-related cookies with their values (truncated for security)
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c =>
    c.name.includes('auth') || c.name.includes('sb-') || c.name.includes('supabase')
  )
  console.log('[Server Supabase] Auth cookies:', authCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valueLength: c.value?.length || 0
  })))

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Merge with explicit cookie options to ensure consistency
              cookieStore.set(name, value, {
                ...options,
                ...cookieOptions,
              })
            )
          } catch {
            // The setAll method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
