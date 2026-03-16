import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Consistent cookie options
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const cookieStore = await cookies()

  // Create response first so we can set cookies on it
  const response = NextResponse.redirect(`${origin}/login`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              ...cookieOptions,
            })
          })
        },
      },
    }
  )

  await supabase.auth.signOut()

  return response
}
