import { TourStep } from "@/lib/types/tour"

export const CARE_TOUR_ID = "care-tour"

export const careTourSteps: TourStep[] = [
  {
    id: "food-tab",
    target: '[data-tour="food-tab"]',
    title: "Food Preferences",
    content:
      "Track your pet's food brands, portion sizes, and feeding schedule. Quick links let you reorder from Amazon, Chewy, and more.",
    placement: "bottom",
  },
  {
    id: "routine-tab",
    target: '[data-tour="routine-tab"]',
    title: "Daily Routines",
    content:
      "Set up walks, playtime, medication schedules, and other recurring activities.",
    placement: "bottom",
  },
  {
    id: "add-food",
    target: '[data-tour="add-food-button"]',
    title: "Add Food Items",
    content:
      "Add your pet's food with brand autocomplete. We'll show shopping links and create a meal schedule.",
    placement: "bottom",
  },
]
