import { TourStep, TourConfig } from "@/lib/types/tour"

export const FINANCIAL_TOUR_ID = "financial-tour"

export const financialTourSteps: TourStep[] = [
  {
    id: "upload-policy",
    target: '[data-tour="upload-policy-button"]',
    title: "Upload Your Policy",
    content:
      "Upload your insurance policy PDF and AI will extract provider info, coverage details, deductibles, and more.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "upload-insurance-policy",
  },
  {
    id: "enter-manual",
    target: '[data-tour="enter-manual-button"]',
    title: "Enter Manually",
    content:
      "Don't have a PDF handy? You can enter your policy details manually.",
    placement: "bottom",
    interactive: true,
  },
  {
    id: "add-expense",
    target: '[data-tour="add-expense-button"]',
    title: "Track Expenses",
    content:
      "Log vet visits, medications, grooming, food, and other pet care costs.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "add-expense",
  },
  {
    id: "file-claim",
    target: '[data-tour="file-claim-button"]',
    title: "File Insurance Claims",
    content:
      "Create claims and link them to expenses. Track reimbursement status as claims are processed.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "file-claim",
  },
  {
    id: "summary-tab",
    target: '[data-tour="summary-tab"]',
    title: "View Summary",
    content:
      "See spending breakdowns and track how much you've been reimbursed by insurance.",
    placement: "bottom",
    interactive: true,
  },
]

export const financialTourConfig: TourConfig = {
  id: FINANCIAL_TOUR_ID,
  steps: financialTourSteps,
  label: "Insurance & Expenses Guide",
}

// Re-export for backwards compatibility
export const INSURANCE_TOUR_ID = FINANCIAL_TOUR_ID
export const EXPENSES_TOUR_ID = FINANCIAL_TOUR_ID
