"use client"

import { useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { TourAnalyticsEvent } from "@/lib/types/tour"

export function useTourAnalytics() {
  const supabase = createClient()
  const sessionIdRef = useRef<string | null>(null)

  const generateSessionId = useCallback(() => {
    sessionIdRef.current = crypto.randomUUID()
    return sessionIdRef.current
  }, [])

  const getSessionId = useCallback(() => {
    return sessionIdRef.current
  }, [])

  const trackEvent = useCallback(
    async (event: TourAnalyticsEvent) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("tour_analytics").insert({
        user_id: user.id,
        tour_id: event.tourId,
        step_id: event.stepId,
        step_index: event.stepIndex,
        action: event.action,
        time_on_step_ms: event.timeOnStepMs || null,
        session_id: event.sessionId,
      })
    },
    [supabase]
  )

  const trackStepView = useCallback(
    async (tourId: string, stepId: string, stepIndex: number) => {
      const sessionId = getSessionId()
      if (!sessionId) return

      await trackEvent({
        tourId,
        stepId,
        stepIndex,
        action: "view",
        sessionId,
      })
    },
    [trackEvent, getSessionId]
  )

  const trackNavigation = useCallback(
    async (
      tourId: string,
      stepId: string,
      stepIndex: number,
      action: "next" | "prev" | "skip" | "complete" | "click_target",
      timeOnStepMs?: number
    ) => {
      const sessionId = getSessionId()
      if (!sessionId) return

      await trackEvent({
        tourId,
        stepId,
        stepIndex,
        action,
        timeOnStepMs,
        sessionId,
      })
    },
    [trackEvent, getSessionId]
  )

  const updateLastStepViewed = useCallback(
    async (tourId: string, stepIndex: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from("feature_tours")
        .upsert(
          {
            user_id: user.id,
            tour_id: tourId,
            last_step_viewed: stepIndex,
          },
          { onConflict: "user_id,tour_id" }
        )
    },
    [supabase]
  )

  const incrementViewCount = useCallback(
    async (tourId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // First try to get existing record
      const { data: existing } = await supabase
        .from("feature_tours")
        .select("view_count")
        .eq("user_id", user.id)
        .eq("tour_id", tourId)
        .single()

      const newViewCount = (existing?.view_count || 0) + 1

      await supabase.from("feature_tours").upsert(
        {
          user_id: user.id,
          tour_id: tourId,
          view_count: newViewCount,
        },
        { onConflict: "user_id,tour_id" }
      )
    },
    [supabase]
  )

  return {
    generateSessionId,
    getSessionId,
    trackStepView,
    trackNavigation,
    updateLastStepViewed,
    incrementViewCount,
  }
}
