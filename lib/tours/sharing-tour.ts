import { TourStep, TourConfig } from "@/lib/types/tour"

export const SHARING_TOUR_ID = "sharing-tour"

export const sharingTourSteps: TourStep[] = [
  {
    id: "create-link",
    target: '[data-tour="create-link-button"]',
    title: "Create Share Links",
    content:
      "Click here to create a new share link. Each link gives someone access to view your pet's information.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "create-share-link",
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
  {
    id: "invite-button",
    target: '[data-tour="invite-button"]',
    title: "Invite Collaborators",
    content:
      "Add family members or caregivers who need ongoing access to view or edit your pet's profile.",
    placement: "bottom",
    interactive: true,
    requiredFeature: "invite-collaborator",
  },
  {
    id: "role-info",
    target: '[data-tour="role-info"]',
    title: "Access Levels",
    content:
      "Your role determines what you can do. Owners have full control, editors can modify data, and viewers can only read.",
    placement: "bottom",
  },
]

export const sharingTourConfig: TourConfig = {
  id: SHARING_TOUR_ID,
  steps: sharingTourSteps,
  label: "Sharing & Access Guide",
}

// Re-export for backwards compatibility
export const SHARE_PAGE_TOUR_ID = SHARING_TOUR_ID
export const COLLABORATORS_TOUR_ID = SHARING_TOUR_ID
