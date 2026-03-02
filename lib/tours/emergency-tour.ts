import { TourStep } from "@/lib/types/tour"

export const EMERGENCY_TOUR_ID = "emergency-tour"

export const emergencyTourSteps: TourStep[] = [
  {
    id: "add-contact",
    target: '[data-tour="add-contact-button"]',
    title: "Add Emergency Contacts",
    content:
      "Add the pet owner, family members, vets, and anyone else to contact in an emergency.",
    placement: "bottom",
  },
]
