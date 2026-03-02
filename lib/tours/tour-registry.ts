import { TourConfig, TourStep } from "@/lib/types/tour"
import {
  OVERVIEW_TOUR_ID,
  overviewTourSteps,
  overviewTourConfig,
} from "./overview-tour"
import {
  HEALTH_RECORDS_TOUR_ID,
  healthRecordsTourSteps,
  healthRecordsTourConfig,
} from "./health-records-tour"
import {
  DAILY_CARE_TOUR_ID,
  dailyCareTourSteps,
  dailyCareTourConfig,
} from "./daily-care-tour"
import {
  FINANCIAL_TOUR_ID,
  financialTourSteps,
  financialTourConfig,
} from "./financial-tour"
import {
  SHARING_TOUR_ID,
  sharingTourSteps,
  sharingTourConfig,
} from "./sharing-tour"

export interface TourRegistryEntry {
  tourId: string
  steps: TourStep[]
  label: string
  // Which step indices are relevant for this specific route
  relevantStepIndices?: number[]
}

// Helper to convert TourConfig to TourRegistryEntry
function toRegistryEntry(
  config: TourConfig,
  steps: TourStep[],
  relevantStepIndices?: number[]
): TourRegistryEntry {
  return {
    tourId: config.id,
    steps,
    label: config.label || config.id,
    relevantStepIndices,
  }
}

// Map route patterns to their associated tours
// Uses path patterns that match Next.js dynamic routes
const routeToTourMap: Record<string, TourRegistryEntry[]> = {
  // Vet page - first step of overview tour
  "/pets/[petId]/vet": [
    toRegistryEntry(overviewTourConfig, overviewTourSteps, [0]),
  ],

  // Emergency page - second step of overview tour
  "/pets/[petId]/emergency": [
    toRegistryEntry(overviewTourConfig, overviewTourSteps, [1]),
  ],

  // Health page - health records tour
  "/pets/[petId]/health": [
    toRegistryEntry(healthRecordsTourConfig, healthRecordsTourSteps, [0, 1]),
  ],

  // Vaccinations page - health records tour (upload + add only, no tab step)
  "/pets/[petId]/vaccinations": [
    toRegistryEntry(healthRecordsTourConfig, healthRecordsTourSteps, [0, 1]),
  ],

  // Care page - daily care tour
  "/pets/[petId]/care": [
    toRegistryEntry(dailyCareTourConfig, dailyCareTourSteps),
  ],

  // Insurance page - financial tour (insurance focus)
  "/pets/[petId]/insurance": [
    toRegistryEntry(financialTourConfig, financialTourSteps, [0, 1]),
  ],

  // Expenses page - financial tour (expenses focus)
  "/pets/[petId]/expenses": [
    toRegistryEntry(financialTourConfig, financialTourSteps, [2, 3, 4]),
  ],

  // Share page - sharing tour (links focus)
  "/pets/[petId]/share": [
    toRegistryEntry(sharingTourConfig, sharingTourSteps, [0, 1, 2]),
  ],

  // Collaborators page - sharing tour (collaborators focus)
  "/pets/[petId]/collaborators": [
    toRegistryEntry(sharingTourConfig, sharingTourSteps, [3, 4]),
  ],
}

// All available tour configs for the help menu
export const allTourConfigs: TourConfig[] = [
  overviewTourConfig,
  healthRecordsTourConfig,
  dailyCareTourConfig,
  financialTourConfig,
  sharingTourConfig,
]

// Convert actual pathname (with petId) to pattern
function pathnameToPattern(pathname: string): string {
  // Replace UUID-like segments with [petId]
  return pathname.replace(
    /\/pets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i,
    "/pets/[petId]/"
  )
}

// Get tours available for a specific route
export function getToursForRoute(pathname: string): TourRegistryEntry[] {
  const pattern = pathnameToPattern(pathname)
  return routeToTourMap[pattern] || []
}

// Get a specific tour by ID
export function getTourById(
  tourId: string
): { tourId: string; steps: TourStep[]; label: string } | null {
  const config = allTourConfigs.find((c) => c.id === tourId)
  if (!config) return null

  return {
    tourId: config.id,
    steps: config.steps,
    label: config.label || config.id,
  }
}

// Get steps for a tour, optionally filtered to relevant indices
export function getTourStepsForRoute(
  pathname: string,
  tourId: string
): TourStep[] {
  const tours = getToursForRoute(pathname)
  const entry = tours.find((t) => t.tourId === tourId)

  if (!entry) return []

  if (entry.relevantStepIndices) {
    return entry.relevantStepIndices.map((i) => entry.steps[i]).filter(Boolean)
  }

  return entry.steps
}

// Export tour IDs for external use
export {
  OVERVIEW_TOUR_ID,
  HEALTH_RECORDS_TOUR_ID,
  DAILY_CARE_TOUR_ID,
  FINANCIAL_TOUR_ID,
  SHARING_TOUR_ID,
}

// Export step arrays for backwards compatibility
export {
  overviewTourSteps,
  healthRecordsTourSteps,
  dailyCareTourSteps,
  financialTourSteps,
  sharingTourSteps,
}
