"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TourStep } from "@/lib/types/tour"

interface UseFeatureTourResult {
  shouldShowTour: boolean
  isLoading: boolean
  markTourComplete: () => Promise<void>
  neverShowAgain: boolean
}

interface UseFeatureTourOptions {
  // Skip steps where the requiredFeature has been used
  checkFeatureUsage?: boolean
  // Delay tour for new users (within 24h of signup)
  delayForNewUsers?: boolean
  // Custom delay in hours (default: 24)
  newUserDelayHours?: number
}

export function useFeatureTour(
  tourId: string,
  options: UseFeatureTourOptions = {}
): UseFeatureTourResult {
  // Tour feature temporarily disabled - return early with disabled state
  // TODO: Remove this when tour feature is ready for production
  return {
    shouldShowTour: false,
    isLoading: false,
    markTourComplete: async () => {},
    neverShowAgain: false,
  }

  const {
    delayForNewUsers = true,
    newUserDelayHours = 24,
  } = options

  const [shouldShowTour, setShouldShowTour] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [neverShowAgain, setNeverShowAgain] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkTourStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Check if user is new (within delay period)
      if (delayForNewUsers && user.created_at) {
        const userCreatedAt = new Date(user.created_at)
        const delayMs = newUserDelayHours * 60 * 60 * 1000
        const delayExpires = new Date(userCreatedAt.getTime() + delayMs)

        if (new Date() < delayExpires) {
          // User is still in the new user period, don't show tours
          setShouldShowTour(false)
          setIsLoading(false)
          return
        }
      }

      const { data } = await supabase
        .from("feature_tours")
        .select("completed_at, dismissed_at, never_show_again")
        .eq("user_id", user.id)
        .eq("tour_id", tourId)
        .single()

      // Check if user has opted out of this tour
      if (data?.never_show_again) {
        setNeverShowAgain(true)
        setShouldShowTour(false)
        setIsLoading(false)
        return
      }

      // Show tour if no record exists (first time) or neither completed nor dismissed
      const shouldShow = !data || (!data.completed_at && !data.dismissed_at)
      setShouldShowTour(shouldShow)
      setIsLoading(false)
    }

    checkTourStatus()
  }, [tourId, supabase, delayForNewUsers, newUserDelayHours])

  const markTourComplete = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("feature_tours").upsert(
      {
        user_id: user.id,
        tour_id: tourId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tour_id" }
    )

    setShouldShowTour(false)
  }, [supabase, tourId])

  return { shouldShowTour, isLoading, markTourComplete, neverShowAgain }
}

// Helper to filter steps based on feature usage
export async function filterStepsByFeatureUsage(
  steps: TourStep[],
  supabase: ReturnType<typeof createClient>
): Promise<TourStep[]> {
  const stepsWithRequiredFeature = steps.filter((step) => step.requiredFeature)

  if (stepsWithRequiredFeature.length === 0) {
    return steps
  }

  const featureIds = stepsWithRequiredFeature.map(
    (step) => step.requiredFeature!
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return steps

  const { data: usedFeatures } = await supabase
    .from("feature_usage")
    .select("feature_id")
    .eq("user_id", user.id)
    .in("feature_id", featureIds)

  const usedFeatureIds = new Set(
    usedFeatures?.map((f) => f.feature_id) || []
  )

  // Filter out steps where the required feature has already been used
  return steps.filter(
    (step) => !step.requiredFeature || !usedFeatureIds.has(step.requiredFeature)
  )
}
