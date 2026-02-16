'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimePetOptions {
  petId: string
  onActivityChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onVaccinationChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onHealthRecordChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onCareEventChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onCollaboratorChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  enabled?: boolean
}

export function useRealtimePet({
  petId,
  onActivityChange,
  onVaccinationChange,
  onHealthRecordChange,
  onCareEventChange,
  onCollaboratorChange,
  enabled = true,
}: UseRealtimePetOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || !petId) {
      cleanup()
      return
    }

    const supabase = createClient()

    // Create a channel for this pet
    const channel = supabase.channel(`pet:${petId}`)

    // Subscribe to activity log changes
    if (onActivityChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_log',
          filter: `pet_id=eq.${petId}`,
        },
        onActivityChange
      )
    }

    // Subscribe to vaccination changes
    if (onVaccinationChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vaccination_records',
          filter: `pet_id=eq.${petId}`,
        },
        onVaccinationChange
      )
    }

    // Subscribe to health record changes
    if (onHealthRecordChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_records',
          filter: `pet_id=eq.${petId}`,
        },
        onHealthRecordChange
      )
    }

    // Subscribe to care event changes
    if (onCareEventChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_events',
          filter: `pet_id=eq.${petId}`,
        },
        onCareEventChange
      )
    }

    // Subscribe to collaborator changes
    if (onCollaboratorChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_collaborators',
          filter: `pet_id=eq.${petId}`,
        },
        onCollaboratorChange
      )
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to realtime updates for pet ${petId}`)
      }
    })

    channelRef.current = channel

    return cleanup
  }, [
    petId,
    enabled,
    onActivityChange,
    onVaccinationChange,
    onHealthRecordChange,
    onCareEventChange,
    onCollaboratorChange,
    cleanup,
  ])

  return {
    unsubscribe: cleanup,
  }
}

// Hook for subscribing to all pets (for dashboard/multi-pet views)
interface UseRealtimeAllPetsOptions {
  petIds: string[]
  onAnyChange?: (petId: string, table: string, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  enabled?: boolean
}

export function useRealtimeAllPets({
  petIds,
  onAnyChange,
  enabled = true,
}: UseRealtimeAllPetsOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || petIds.length === 0 || !onAnyChange) {
      cleanup()
      return
    }

    const supabase = createClient()
    const channel = supabase.channel('all-pets')

    const tables = [
      'activity_log',
      'vaccination_records',
      'health_records',
      'care_events',
      'pet_collaborators',
    ]

    for (const table of tables) {
      for (const petId of petIds) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `pet_id=eq.${petId}`,
          },
          (payload) => onAnyChange(petId, table, payload)
        )
      }
    }

    channel.subscribe()
    channelRef.current = channel

    return cleanup
  }, [petIds, onAnyChange, enabled, cleanup])

  return {
    unsubscribe: cleanup,
  }
}

// Hook specifically for live activity feed
interface UseRealtimeActivityOptions {
  petId?: string
  onNewActivity?: (activity: Record<string, unknown>) => void
  enabled?: boolean
}

export function useRealtimeActivity({
  petId,
  onNewActivity,
  enabled = true,
}: UseRealtimeActivityOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || !onNewActivity) {
      cleanup()
      return
    }

    const supabase = createClient()
    const channelName = petId ? `activity:${petId}` : 'activity:all'
    const channel = supabase.channel(channelName)

    const config: {
      event: 'INSERT'
      schema: 'public'
      table: 'activity_log'
      filter?: string
    } = {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_log',
    }

    if (petId) {
      config.filter = `pet_id=eq.${petId}`
    }

    channel.on('postgres_changes', config, (payload) => {
      if (payload.new) {
        onNewActivity(payload.new)
      }
    })

    channel.subscribe()
    channelRef.current = channel

    return cleanup
  }, [petId, onNewActivity, enabled, cleanup])

  return {
    unsubscribe: cleanup,
  }
}
