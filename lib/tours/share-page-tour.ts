import { TourStep } from "@/lib/types/tour"

export const SHARE_PAGE_TOUR_ID = "share-page-tour"

export const sharePageTourSteps: TourStep[] = [
  {
    id: "create-link",
    target: '[data-tour="create-link-button"]',
    title: "Create Share Links",
    content:
      "Click here to create a new share link. Each link gives someone access to view your pet's information.",
    placement: "bottom",
  },
  {
    id: "visibility",
    target: '[data-tour="visibility-section"]',
    title: "Control What's Shared",
    content:
      "Select which sections of your pet's profile are visible through this link. Uncheck anything you want to keep private.",
    placement: "top",
  },
  {
    id: "pin-protection",
    target: '[data-tour="pin-section"]',
    title: "Add PIN Protection",
    content:
      "Optionally add a PIN code. Anyone with the link will need to enter this code to view your pet's information.",
    placement: "top",
  },
]
