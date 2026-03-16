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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      setEmail(user.email || null)

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Silently handle - no subscription is normal for free users
      }

      if (data) {
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setSubscription({ ...data, tier: 'free' })
        } else {
          setSubscription(data)
        }
      }
    } catch {
      // Silently handle errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Prevent multiple fetches (e.g., from StrictMode or re-renders)
    if (hasFetched.current) {
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
