'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSubscription(null)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine (free tier)
        console.error('Error fetching subscription:', error)
      }

      // Check if subscription is expired
      if (data && data.expires_at && new Date(data.expires_at) < new Date()) {
        // Subscription expired, treat as free
        setSubscription({ ...data, tier: 'free' })
      } else {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
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

  return {
    tier,
    isPremium,
    isLoading,
    subscription,
    limits,
    checkLimit,
    refresh: fetchSubscription,
  }
}
