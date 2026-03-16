import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookiesSet: string[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            console.log('[/api/auth/session] setAll called with:', cookiesToSet.map(c => ({
              name: c.name,
              valueLength: c.value.length,
              options: c.options
            })))
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesSet.push(name)
              const finalOptions = {
                ...options,
                // Ensure proper cookie attributes for cross-request persistence
                path: '/',
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
              }
              console.log('[/api/auth/session] Setting cookie:', name, 'with options:', finalOptions)
              cookieStore.set(name, value, finalOptions)
            })
          },
        },
      }
    )

    // Set the session using the tokens from the client
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('[/api/auth/session] Session setup error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[/api/auth/session] Session established, cookies set:', cookiesSet)

    return NextResponse.json({ success: true, user: data.user?.id })
  } catch (error) {
    console.error('[/api/auth/session] API error:', error)
    return NextResponse.json({ error: 'Failed to setup session' }, { status: 500 })
  }
}
