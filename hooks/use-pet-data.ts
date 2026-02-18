'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Pet, Vaccination, CareEvent } from '@/lib/types/pet'

// Query keys for consistent cache management
export const queryKeys = {
  pets: ['pets'] as const,
  pet: (id: string) => ['pet', id] as const,
  petSectionCounts: (id: string) => ['pet-section-counts', id] as const,
  vaccinations: (petId: string) => ['vaccinations', petId] as const,
  healthRecords: (petId: string) => ['health-records', petId] as const,
  careEvents: (petId: string) => ['care-events', petId] as const,
  foods: (petId: string) => ['foods', petId] as const,
  routines: (petId: string) => ['routines', petId] as const,
  emergencyContacts: (petId: string) => ['emergency-contacts', petId] as const,
  insurance: (petId: string) => ['insurance', petId] as const,
  vets: (petId: string) => ['vets', petId] as const,
  activities: (petIds?: string[]) => ['activities', petIds] as const,
}

// Fetch all pets for current user
export function usePets() {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.pets,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Pet[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch a single pet
export function usePet(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.pet(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (error) throw error
      return data as Pet
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch all section counts for a pet using RPC
export function usePetSectionCounts(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.petSectionCounts(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_pet_section_counts', { p_pet_id: petId })
        .single()

      if (error) throw error
      return data as {
        vaccination_records: number
        vaccination_docs: number
        health_records: number
        health_docs: number
        insurance: number
        vets: number
        emergency_contacts: number
        routines: number
        foods: number
        care_events: number
        care_instructions: number
        behavioral_notes: number
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!petId,
  })
}

// Fetch vaccinations for a pet
export function useVaccinations(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.vaccinations(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaccination_records')
        .select('*')
        .eq('pet_id', petId)
        .order('administered_date', { ascending: false })

      if (error) throw error
      return data as Vaccination[]
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch care events for a pet
export function useCareEvents(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.careEvents(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_events')
        .select('*')
        .eq('pet_id', petId)
        .order('event_date', { ascending: false })

      if (error) throw error
      return data as CareEvent[]
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch foods and routines together (commonly needed together)
export function useFoodsAndRoutines(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['foods-and-routines', petId],
    queryFn: async () => {
      const [foodsResult, routinesResult] = await Promise.all([
        supabase
          .from('food_preferences')
          .select('*')
          .eq('pet_id', petId)
          .order('created_at', { ascending: false }),
        supabase
          .from('daily_routines')
          .select('*')
          .eq('pet_id', petId)
          .order('time_of_day', { ascending: true }),
      ])

      if (foodsResult.error) throw foodsResult.error
      if (routinesResult.error) throw routinesResult.error

      return {
        foods: foodsResult.data,
        routines: routinesResult.data,
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch emergency contacts
export function useEmergencyContacts(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.emergencyContacts(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch insurance
export function useInsurance(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.insurance(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_insurance')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Fetch vets
export function useVets(petId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.vets(petId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veterinarians')
        .select('*')
        .eq('pet_id', petId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  })
}

// Hook to invalidate pet-related queries after mutations
export function useInvalidatePetQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pet(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateVaccinations: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaccinations(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateHealthRecords: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.healthRecords(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateCareEvents: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.careEvents(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateFoods: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foods(petId) })
      queryClient.invalidateQueries({ queryKey: ['foods-and-routines', petId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateRoutines: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines(petId) })
      queryClient.invalidateQueries({ queryKey: ['foods-and-routines', petId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateEmergencyContacts: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyContacts(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateInsurance: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateVets: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vets(petId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.petSectionCounts(petId) })
    },
    invalidateActivities: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  }
}
