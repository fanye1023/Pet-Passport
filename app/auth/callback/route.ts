import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const saveToken = searchParams.get('saveToken')

  if (code) {
    const cookieStore = await cookies()

    // Create response first so we can set cookies on it
    let redirectUrl = `${origin}${next}`

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
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If saveToken is provided (from OAuth signup via share link), save it
      if (saveToken) {
        await supabase.rpc('save_share_link', {
          p_share_token: saveToken,
        })
        redirectUrl = `${origin}/saved`
      } else {
        // Check if user has any pending invitations
        const { data: pendingInvitation } = await supabase
          .from('pet_invitations')
          .select('token')
          .ilike('email', data.user.email || '')
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .single()

        // If there's a pending invitation and no specific next URL, redirect to invite page
        if (pendingInvitation && next === '/dashboard') {
          redirectUrl = `${origin}/invite/${pendingInvitation.token}`
        } else if (next === '/dashboard') {
          // Check if this is a new user (no pets yet)
          const { count } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.user.id)

          // If no pets, redirect to create first pet
          if (count === 0) {
            redirectUrl = `${origin}/onboarding/new`
          }
        }
      }

      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return to login page if code exchange fails
  return NextResponse.redirect(`${origin}/login`)
}
