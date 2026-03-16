'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

/**
 * This component listens for Supabase auth state changes and syncs
 * refreshed tokens to the server. This ensures that when tokens are
 * refreshed client-side, the server-side auth also has valid tokens.
 */
export function AuthSync() {
  const supabase = createClient()
  const isSyncing = useRef(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // Only sync on token refresh or sign in
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session) {
        // Prevent concurrent syncs
        if (isSyncing.current) {
          return
        }

        isSyncing.current = true

        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
            credentials: 'include',
          })
        } catch {
          // Silently handle sync errors
        } finally {
          isSyncing.current = false
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // This component doesn't render anything
  return null
}
