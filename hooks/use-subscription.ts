'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  SubscriptionTier,
  UserSubscription,
  FREE_TIER_LIMITS,
  PREMIUM_FEATURES
} from '@/lib/types/pet'

interface UseSubscriptionReturn {
  tier: SubscriptionTier
  isPremium: boolean
  isLoading: boolean
  subscription: UserSubscription | null
  email: string | null
  limits: typeof FREE_TIER_LIMITS | typeof PREMIUM_FEATURES
  checkLimit: (feature: keyof typeof FREE_TIER_LIMITS, currentCount: number) => {
    allowed: boolean
    remaining: number
    limit: number | boolean
  }
  refresh: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchSubscription = useCallback(async () => {
    const supabase = createClient()
    try {
      // Use getUser() which is more reliable than getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // Debug logging - check browser console
      console.log('[useSubscription] getUser result:', { user: user?.id, email: user?.email, error: userError?.message })

      if (!user) {
        console.log('[useSubscription] No user found, setting isLoading to false')
        setIsLoading(false)
        return
      }

      // Capture email from the user object
      setEmail(user.email || null)

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('[useSubscription] subscription query result:', { data, error: error?.message })

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
      }

      if (data) {
        console.log('[useSubscription] Setting subscription tier:', data.tier)
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setSubscription({ ...data, tier: 'free' })
        } else {
          setSubscription(data)
        }
      } else {
        console.log('[useSubscription] No subscription data found')
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Prevent multiple fetches (e.g., from StrictMode or re-renders)
    if (hasFetched.current) {
      console.log('[useSubscription] Skipping fetch - already fetched')
      return
    }
    hasFetched.current = true
    fetchSubscription()
  }, [fetchSubscription])

  const tier: SubscriptionTier = subscription?.tier || 'free'
  const isPremium = tier === 'premium'
  const limits = isPremium ? PREMIUM_FEATURES : FREE_TIER_LIMITS

  const checkLimit = useCallback((
    feature: keyof typeof FREE_TIER_LIMITS,
    currentCount: number
  ) => {
    const limit = limits[feature]

    if (typeof limit === 'boolean') {
      return {
        allowed: limit,
        remaining: limit ? Infinity : 0,
        limit,
      }
    }

    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentCount)
    return {
      allowed: currentCount < limit,
      remaining,
      limit,
    }
  }, [limits])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSubscription()
  }, [fetchSubscription])

  return {
    tier,
    isPremium,
    isLoading,
    subscription,
    email,
    limits,
    checkLimit,
    refresh,
  }
}
