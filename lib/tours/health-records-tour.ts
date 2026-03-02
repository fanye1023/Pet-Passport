import { TourStep, TourConfig } from "@/lib/types/tour"

export const HEALTH_RECORDS_TOUR_ID = "health-records-tour"

export const healthRecordsTourSteps: TourStep[] = [
  {
    id: "upload-pdf",
    target: '[data-tour="upload-pdf-button"]',
    title: "AI Health Record Extraction",
    content:
      "Upload vet records, lab results, or vaccination certificates. AI extracts conditions, medications, allergies, and more.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "upload-health-pdf",
  },
  {
    id: "add-record",
    target: '[data-tour="add-record-button"]',
    title: "Add Records Manually",
    content:
      "Add checkups, treatments, vaccinations, allergies, or conditions one at a time.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "add-health-record",
  },
  {
    id: "vaccinations-tab",
    target: '[data-tour="vaccinations-tab"]',
    title: "Vaccination Tracking",
    content:
      "Switch to the vaccinations tab to view and manage your pet's immunization history with due date reminders.",
    placement: "bottom",
    interactive: true,
  },
]

export const healthRecordsTourConfig: TourConfig = {
  id: HEALTH_RECORDS_TOUR_ID,
  steps: healthRecordsTourSteps,
  label: "Medical Records Guide",
}

// Re-export for backwards compatibility
export const HEALTH_TOUR_ID = HEALTH_RECORDS_TOUR_ID
export const VACCINATIONS_TOUR_ID = HEALTH_RECORDS_TOUR_ID
