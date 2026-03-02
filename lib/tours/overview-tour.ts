import { TourStep, TourConfig } from "@/lib/types/tour"

export const OVERVIEW_TOUR_ID = "overview-tour"

export const overviewTourSteps: TourStep[] = [
  {
    id: "add-vet",
    target: '[data-tour="add-vet-button"]',
    title: "Add Your Vet",
    content:
      "Search for clinics by name and we'll auto-fill address and phone. You can also add specialist vets.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "add-vet",
  },
  {
    id: "add-contact",
    target: '[data-tour="add-contact-button"]',
    title: "Emergency Contacts",
    content:
      "Add the pet owner, family members, vets, and anyone else to contact in an emergency.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "add-emergency-contact",
  },
]

export const overviewTourConfig: TourConfig = {
  id: OVERVIEW_TOUR_ID,
  steps: overviewTourSteps,
  label: "Pet Basics Guide",
}

// Re-export individual tour IDs for backwards compatibility
export const VET_TOUR_ID = OVERVIEW_TOUR_ID
export const EMERGENCY_TOUR_ID = OVERVIEW_TOUR_ID
