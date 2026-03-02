import { TourStep } from "@/lib/types/tour"

export const VACCINATIONS_TOUR_ID = "vaccinations-tour"

export const vaccinationsTourSteps: TourStep[] = [
  {
    id: "upload-pdf",
    target: '[data-tour="upload-pdf-button"]',
    title: "AI-Powered PDF Upload",
    content:
      "Upload vaccination certificates and our AI will automatically extract vaccine names, dates, and create reminders.",
    placement: "bottom",
  },
  {
    id: "add-manual",
    target: '[data-tour="add-record-button"]',
    title: "Add Records Manually",
    content:
      "Prefer to enter records yourself? Click here to add individual vaccination records.",
    placement: "bottom",
  },
]
