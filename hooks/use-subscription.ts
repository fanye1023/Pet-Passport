'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  limits: typeof FREE_TIER_LIMITS | typeof PREMIUM_FEATURES
  checkLimit: (feature: keyof typeof FREE_TIER_LIMITS, currentCount: number) => {
    allowed: boolean
    remaining: number
    limit: number | boolean
  }
  refresh: () => Promise<void>
}

// Create a single supabase client instance for this module
const supabase = createClient()

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscriptionForUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine (free tier)
        console.error('Error fetching subscription:', error)
      }

      if (data) {
        // Check if subscription is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setSubscription({ ...data, tier: 'free' })
        } else {
          setSubscription(data)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Get initial session (reads from storage, fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchSubscriptionForUser(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true)
          fetchSubscriptionForUser(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [fetchSubscriptionForUser])

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
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchSubscriptionForUser(session.user.id)
    } else {
      setIsLoading(false)
    }
  }, [fetchSubscriptionForUser])

  return {
    tier,
    isPremium,
    isLoading,
    subscription,
    limits,
    checkLimit,
    refresh,
  }
}
