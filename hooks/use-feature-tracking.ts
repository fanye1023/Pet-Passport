"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useFeatureTracking() {
  const supabase = createClient()

  const trackFeature = useCallback(
    async (featureId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Check if feature already tracked
      const { data: existing } = await supabase
        .from("feature_usage")
        .select("use_count")
        .eq("user_id", user.id)
        .eq("feature_id", featureId)
        .single()

      if (existing) {
        // Increment use count
        await supabase
          .from("feature_usage")
          .update({ use_count: existing.use_count + 1 })
          .eq("user_id", user.id)
          .eq("feature_id", featureId)
      } else {
        // Create new record
        await supabase.from("feature_usage").insert({
          user_id: user.id,
          feature_id: featureId,
          use_count: 1,
        })
      }
    },
    [supabase]
  )

  const hasUsedFeature = useCallback(
    async (featureId: string): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { data } = await supabase
        .from("feature_usage")
        .select("use_count")
        .eq("user_id", user.id)
        .eq("feature_id", featureId)
        .single()

      return !!data && data.use_count > 0
    },
    [supabase]
  )

  const getFeatureUsage = useCallback(
    async (featureIds: string[]): Promise<Record<string, number>> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return {}

      const { data } = await supabase
        .from("feature_usage")
        .select("feature_id, use_count")
        .eq("user_id", user.id)
        .in("feature_id", featureIds)

      const usage: Record<string, number> = {}
      data?.forEach((record) => {
        usage[record.feature_id] = record.use_count
      })

      return usage
    },
    [supabase]
  )

  return {
    trackFeature,
    hasUsedFeature,
    getFeatureUsage,
  }
}
