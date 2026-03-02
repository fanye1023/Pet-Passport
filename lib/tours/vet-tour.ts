import { TourStep } from "@/lib/types/tour"

export const VET_TOUR_ID = "vet-tour"

export const vetTourSteps: TourStep[] = [
  {
    id: "add-vet",
    target: '[data-tour="add-vet-button"]',
    title: "Add Your Vet",
    content:
      "Search for clinics by name and we'll auto-fill address and phone. You can also add specialist vets.",
    placement: "bottom",
  },
]
