'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  SubscriptionTier,
  UserSubscription,
  FREE_TIER_LIMITS,
  PREMIUM_FEATURES
} from '@/lib/types/pet'

interface SubscriptionContextValue {
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
  // Cache for pets data to survive component remounts
  petsCache: { data: unknown[] | null; savedPets: unknown[] | null; fetched: boolean }
  setPetsCache: (data: unknown[], savedPets: unknown[]) => void
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)
  const [petsCache, setPetsCacheState] = useState<{ data: unknown[] | null; savedPets: unknown[] | null; fetched: boolean }>({ data: null, savedPets: null, fetched: false })

  const setPetsCache = useCallback((data: unknown[], savedPets: unknown[]) => {
    console.log('[SubscriptionProvider] Setting pets cache:', data.length, 'saved:', savedPets.length)
    setPetsCacheState({ data, savedPets, fetched: true })
  }, [])

  const fetchSubscription = useCallback(async () => {
    // Prevent duplicate fetches
    if (hasFetched.current) {
      console.log('[SubscriptionProvider] Skipping fetch - already fetched')
      return
    }
    hasFetched.current = true

    const supabase = createClient()
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      console.log('[SubscriptionProvider] getUser result:', {
        user: user?.id,
        email: user?.email,
        error: userError?.message
      })

      if (!user) {
        console.log('[SubscriptionProvider] No user found')
        setIsLoading(false)
        return
      }

      setEmail(user.email || null)

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('[SubscriptionProvider] subscription query result:', {
        tier: data?.tier,
        error: error?.message
      })

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
      }

      if (data) {
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
    hasFetched.current = false
    setIsLoading(true)
    await fetchSubscription()
  }, [fetchSubscription])

  return (
    <SubscriptionContext.Provider value={{
      tier,
      isPremium,
      isLoading,
      subscription,
      email,
      limits,
      checkLimit,
      refresh,
      petsCache,
      setPetsCache,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
