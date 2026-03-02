import { TourStep } from "@/lib/types/tour"

export const COLLABORATORS_TOUR_ID = "collaborators-tour"

export const collaboratorsTourSteps: TourStep[] = [
  {
    id: "invite-button",
    target: '[data-tour="invite-button"]',
    title: "Invite Collaborators",
    content:
      "Add family members or caregivers who need ongoing access to view or edit your pet's profile.",
    placement: "bottom",
  },
  {
    id: "role-info",
    target: '[data-tour="role-info"]',
    title: "Your Access Level",
    content:
      "Your role determines what you can do. Owners have full control, editors can modify data, and viewers can only read.",
    placement: "bottom",
  },
]
