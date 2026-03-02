import { TourStep } from "@/lib/types/tour"

export const EXPENSES_TOUR_ID = "expenses-tour"

export const expensesTourSteps: TourStep[] = [
  {
    id: "add-expense",
    target: '[data-tour="add-expense-button"]',
    title: "Track Expenses",
    content:
      "Log vet visits, medications, grooming, food, and other pet care costs.",
    placement: "bottom",
  },
  {
    id: "file-claim",
    target: '[data-tour="file-claim-button"]',
    title: "File Insurance Claims",
    content:
      "Create claims and link them to expenses. Track reimbursement status as claims are processed.",
    placement: "bottom",
  },
  {
    id: "summary-tab",
    target: '[data-tour="summary-tab"]',
    title: "View Summary",
    content:
      "See spending breakdowns and track how much you've been reimbursed by insurance.",
    placement: "bottom",
  },
]
