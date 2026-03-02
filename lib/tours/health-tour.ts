import { TourStep } from "@/lib/types/tour"

export const HEALTH_TOUR_ID = "health-tour"

export const healthTourSteps: TourStep[] = [
  {
    id: "upload-pdf",
    target: '[data-tour="upload-pdf-button"]',
    title: "AI Health Record Extraction",
    content:
      "Upload vet records, lab results, or medical summaries. AI extracts conditions, medications, allergies, and more.",
    placement: "bottom",
  },
  {
    id: "add-manual",
    target: '[data-tour="add-record-button"]',
    title: "Add Records Manually",
    content:
      "Add checkups, treatments, allergies, or conditions one at a time.",
    placement: "bottom",
  },
]
