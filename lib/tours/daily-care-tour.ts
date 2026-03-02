import { TourStep, TourConfig } from "@/lib/types/tour"

export const DAILY_CARE_TOUR_ID = "daily-care-tour"

export const dailyCareTourSteps: TourStep[] = [
  {
    id: "food-tab",
    target: '[data-tour="food-tab"]',
    title: "Food Preferences",
    content:
      "Track your pet's food brands, portion sizes, and feeding schedule. Quick links let you reorder from Amazon, Chewy, and more.",
    placement: "bottom",
    interactive: true,
  },
  {
    id: "routine-tab",
    target: '[data-tour="routine-tab"]',
    title: "Daily Routines",
    content:
      "Set up walks, playtime, medication schedules, and other recurring activities.",
    placement: "bottom",
    interactive: true,
  },
  {
    id: "add-food",
    target: '[data-tour="add-food-button"]',
    title: "Add Food Items",
    content:
      "Add your pet's food with brand autocomplete. We'll show shopping links and create a meal schedule.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "add-food",
  },
]

export const dailyCareTourConfig: TourConfig = {
  id: DAILY_CARE_TOUR_ID,
  steps: dailyCareTourSteps,
  label: "Food & Routine Guide",
}

// Re-export for backwards compatibility
export const CARE_TOUR_ID = DAILY_CARE_TOUR_ID
