import { TourStep } from "@/lib/types/tour"

export const INSURANCE_TOUR_ID = "insurance-tour"

export const insuranceTourSteps: TourStep[] = [
  {
    id: "upload-policy",
    target: '[data-tour="upload-policy-button"]',
    title: "Upload Your Policy",
    content:
      "Upload your insurance policy PDF and AI will extract provider info, coverage details, deductibles, and more.",
    placement: "bottom",
  },
  {
    id: "enter-manual",
    target: '[data-tour="enter-manual-button"]',
    title: "Enter Manually",
    content:
      "Don't have a PDF handy? You can enter your policy details manually.",
    placement: "bottom",
  },
]
