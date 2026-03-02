export interface TourStep {
  id: string
  target: string // CSS selector like '[data-tour="create-link"]'
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  spotlightPadding?: number
  interactive?: boolean // If true, clicking target advances to next step
  requiredFeature?: string // Feature ID that must not be used for this step to show
}

export interface TourConfig {
  id: string
  steps: TourStep[]
  label?: string // Human-readable name for help menu
}

export interface TourState {
  isActive: boolean
  isPaused: boolean // True when user clicked interactive element, hides overlay
  tourId: string | null
  steps: TourStep[]
  currentStepIndex: number
  targetRect: DOMRect | null
  sessionId: string | null
  stepStartTime: number | null
}

export interface TourContextValue {
  state: TourState
  startTour: (tourId: string, steps: TourStep[]) => void
  endTour: (dismissed?: boolean, neverShowAgain?: boolean) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  goToStep: (index: number) => void
  restartTour: (tourId: string, steps: TourStep[]) => void
  dismissPermanently: () => void
  resumeTour: () => void // Resume from paused state and advance to next step
  // Check if a tour was dismissed/completed in this session (for immediate cross-page sync)
  isTourDismissedOrCompleted: (tourId: string) => boolean
}

export interface TourAnalyticsEvent {
  tourId: string
  stepId: string
  stepIndex: number
  action: 'view' | 'next' | 'prev' | 'skip' | 'complete' | 'click_target'
  timeOnStepMs?: number
  sessionId: string
}

export interface FeatureUsage {
  featureId: string
  firstUsedAt: Date
  useCount: number
}
