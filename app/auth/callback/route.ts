import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const saveToken = searchParams.get('saveToken')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // If saveToken is provided (from OAuth signup via share link), save it
      if (saveToken) {
        await supabase.rpc('save_share_link', {
          p_share_token: saveToken,
        })
        // Redirect to saved pets page after saving
        return NextResponse.redirect(`${origin}/saved`)
      }

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
        return NextResponse.redirect(`${origin}/invite/${pendingInvitation.token}`)
      }

      // Check if this is a new user (no pets yet)
      if (next === '/dashboard') {
        const { count } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', data.user.id)

        // If no pets, redirect to create first pet
        if (count === 0) {
          return NextResponse.redirect(`${origin}/onboarding/new`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page if code exchange fails
  return NextResponse.redirect(`${origin}/login`)
}
