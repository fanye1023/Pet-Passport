"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import { TourStep, TourState, TourContextValue } from "@/lib/types/tour"
import { SpotlightOverlay } from "./spotlight-overlay"
import { TourPopover } from "./tour-popover"
import { useTourAnalytics } from "@/hooks/use-tour-analytics"

const initialState: TourState = {
  isActive: false,
  isPaused: false,
  tourId: null,
  steps: [],
  currentStepIndex: 0,
  targetRect: null,
  sessionId: null,
  stepStartTime: null,
}

const TourContext = createContext<TourContextValue | null>(null)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error("useTour must be used within a TourProvider")
  }
  return context
}

interface TourProviderProps {
  children: ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const [state, setState] = useState<TourState>(initialState)
  // Track dismissed/completed tours in this session for immediate cross-page sync
  const dismissedToursRef = useRef<Set<string>>(new Set())
  const supabase = createClient()
  const {
    generateSessionId,
    trackStepView,
    trackNavigation,
    updateLastStepViewed,
    incrementViewCount,
  } = useTourAnalytics()
  const stepStartTimeRef = useRef<number>(0)

  // Update target rect when step changes
  const updateTargetRect = useCallback(() => {
    if (!state.isActive || state.steps.length === 0) {
      setState((prev) => ({ ...prev, targetRect: null }))
      return
    }

    const currentStep = state.steps[state.currentStepIndex]
    if (!currentStep) return

    const element = document.querySelector(currentStep.target)
    if (element) {
      // Scroll element into view first, then get rect
      element.scrollIntoView({ behavior: "smooth", block: "center" })

      // Small delay to let scroll complete before measuring
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        setState((prev) => ({ ...prev, targetRect: rect }))
      }, 300)
    } else {
      setState((prev) => ({ ...prev, targetRect: null }))
    }
  }, [state.isActive, state.steps, state.currentStepIndex])

  // Lock body scroll while tour is active (but not when paused)
  useEffect(() => {
    if (!state.isActive || state.isPaused) {
      // Ensure scroll is restored when tour is not active or is paused
      document.body.style.overflow = ""
      return
    }

    document.body.style.overflow = "hidden"

    return () => {
      // Always restore to default (scrollable)
      document.body.style.overflow = ""
    }
  }, [state.isActive, state.isPaused])

  useEffect(() => {
    updateTargetRect()

    const handleResize = () => updateTargetRect()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [updateTargetRect])

  // Track step views and record start time
  useEffect(() => {
    if (state.isActive && state.tourId && state.steps.length > 0) {
      const currentStep = state.steps[state.currentStepIndex]
      if (currentStep) {
        stepStartTimeRef.current = Date.now()
        trackStepView(state.tourId, currentStep.id, state.currentStepIndex)
        updateLastStepViewed(state.tourId, state.currentStepIndex)
      }
    }
  }, [state.isActive, state.tourId, state.currentStepIndex, state.steps, trackStepView, updateLastStepViewed])

  const saveTourProgress = async (
    tourId: string,
    completed: boolean,
    neverShowAgain: boolean = false
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("feature_tours").upsert(
      {
        user_id: user.id,
        tour_id: tourId,
        completed_at: completed ? new Date().toISOString() : null,
        dismissed_at: !completed ? new Date().toISOString() : null,
        never_show_again: neverShowAgain,
      },
      { onConflict: "user_id,tour_id" }
    )
  }

  const startTour = useCallback(
    (tourId: string, steps: TourStep[]) => {
      // Don't start if this tour was already dismissed/completed in this session
      if (dismissedToursRef.current.has(tourId)) {
        return
      }

      const sessionId = generateSessionId()
      incrementViewCount(tourId)
      setState({
        isActive: true,
        isPaused: false,
        tourId,
        steps,
        currentStepIndex: 0,
        targetRect: null,
        sessionId,
        stepStartTime: Date.now(),
      })
    },
    [generateSessionId, incrementViewCount]
  )

  const restartTour = useCallback(
    (tourId: string, steps: TourStep[]) => {
      // Clear from in-memory dismissed set
      dismissedToursRef.current.delete(tourId)

      // Clear any previous completion/dismissal in database
      const clearProgress = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        await supabase
          .from("feature_tours")
          .update({
            completed_at: null,
            dismissed_at: null,
            last_step_viewed: 0,
            never_show_again: false,
          })
          .eq("user_id", user.id)
          .eq("tour_id", tourId)
      }

      clearProgress()

      // Start the tour (need to call setState directly since startTour would check dismissedToursRef)
      const sessionId = generateSessionId()
      incrementViewCount(tourId)
      setState({
        isActive: true,
        isPaused: false,
        tourId,
        steps,
        currentStepIndex: 0,
        targetRect: null,
        sessionId,
        stepStartTime: Date.now(),
      })
    },
    [supabase, generateSessionId, incrementViewCount]
  )

  const endTour = useCallback(
    (dismissed = false, neverShowAgain = false) => {
      if (state.tourId) {
        const currentStep = state.steps[state.currentStepIndex]
        const timeOnStep = Date.now() - stepStartTimeRef.current

        if (currentStep) {
          trackNavigation(
            state.tourId,
            currentStep.id,
            state.currentStepIndex,
            dismissed ? "skip" : "complete",
            timeOnStep
          )
        }

        // Mark as dismissed/completed in memory for immediate cross-page sync
        dismissedToursRef.current.add(state.tourId)

        saveTourProgress(state.tourId, !dismissed, neverShowAgain)
      }
      setState(initialState)
    },
    [state.tourId, state.steps, state.currentStepIndex, trackNavigation]
  )

  const isTourDismissedOrCompleted = useCallback((tourId: string) => {
    return dismissedToursRef.current.has(tourId)
  }, [])

  const nextStep = useCallback(() => {
    const currentStep = state.steps[state.currentStepIndex]
    const timeOnStep = Date.now() - stepStartTimeRef.current

    if (state.tourId && currentStep) {
      trackNavigation(
        state.tourId,
        currentStep.id,
        state.currentStepIndex,
        "next",
        timeOnStep
      )
    }

    if (state.currentStepIndex >= state.steps.length - 1) {
      endTour(false, false)
    } else {
      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }))
    }
  }, [state.currentStepIndex, state.steps, state.tourId, endTour, trackNavigation])

  const prevStep = useCallback(() => {
    const currentStep = state.steps[state.currentStepIndex]
    const timeOnStep = Date.now() - stepStartTimeRef.current

    if (state.tourId && currentStep) {
      trackNavigation(
        state.tourId,
        currentStep.id,
        state.currentStepIndex,
        "prev",
        timeOnStep
      )
    }

    if (state.currentStepIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
      }))
    }
  }, [state.currentStepIndex, state.steps, state.tourId, trackNavigation])

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.steps.length) return

      const currentStep = state.steps[state.currentStepIndex]
      const timeOnStep = Date.now() - stepStartTimeRef.current

      if (state.tourId && currentStep) {
        // Track as navigation to specific step
        trackNavigation(
          state.tourId,
          currentStep.id,
          state.currentStepIndex,
          index > state.currentStepIndex ? "next" : "prev",
          timeOnStep
        )
      }

      setState((prev) => ({
        ...prev,
        currentStepIndex: index,
      }))
    },
    [state.steps.length, state.currentStepIndex, state.tourId, trackNavigation]
  )

  const skipTour = useCallback(() => {
    endTour(true, false)
  }, [endTour])

  const dismissPermanently = useCallback(() => {
    endTour(true, true)
  }, [endTour])

  const pauseTour = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }))
  }, [])

  const resumeTour = useCallback(() => {
    // Resume and advance to next step
    if (state.currentStepIndex >= state.steps.length - 1) {
      // Last step - end the tour
      endTour(false)
    } else {
      setState((prev) => ({
        ...prev,
        isPaused: false,
        currentStepIndex: prev.currentStepIndex + 1,
      }))
    }
  }, [state.currentStepIndex, state.steps.length, endTour])

  // Handle interactive steps - pause tour when user clicks the target
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    const currentStep = state.steps[state.currentStepIndex]
    if (!currentStep?.interactive) return

    const element = document.querySelector(currentStep.target)
    if (!element) return

    const handleClick = () => {
      const timeOnStep = Date.now() - stepStartTimeRef.current
      if (state.tourId) {
        trackNavigation(
          state.tourId,
          currentStep.id,
          state.currentStepIndex,
          "click_target",
          timeOnStep
        )
      }
      // Pause the tour so user can interact with the dialog/form
      pauseTour()
    }

    element.addEventListener("click", handleClick)
    return () => element.removeEventListener("click", handleClick)
  }, [state.isActive, state.isPaused, state.currentStepIndex, state.steps, state.tourId, pauseTour, trackNavigation])

  // Handle keyboard navigation
  useEffect(() => {
    if (!state.isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour()
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep()
      } else if (e.key === "ArrowLeft") {
        prevStep()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [state.isActive, skipTour, nextStep, prevStep])

  const currentStep = state.steps[state.currentStepIndex]

  return (
    <TourContext.Provider
      value={{
        state,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        goToStep,
        restartTour,
        dismissPermanently,
        resumeTour,
        isTourDismissedOrCompleted,
      }}
    >
      {children}
      {/* Paused state - show minimal resume button */}
      {state.isActive && state.isPaused && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={resumeTour}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <span>Continue Tour</span>
            <span className="text-xs opacity-75">
              ({state.currentStepIndex + 1}/{state.steps.length})
            </span>
          </button>
        </div>
      )}
      {/* Active tour - show full UI */}
      {state.isActive && !state.isPaused && currentStep && (
        <>
          <SpotlightOverlay
            targetRect={state.targetRect}
            padding={currentStep.spotlightPadding}
            onClickOutside={skipTour}
            allowClickThrough={currentStep.interactive}
          />
          <TourPopover
            step={currentStep}
            currentIndex={state.currentStepIndex}
            totalSteps={state.steps.length}
            targetRect={state.targetRect}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            onClose={skipTour}
            onGoToStep={goToStep}
            onDismissPermanently={dismissPermanently}
          />
        </>
      )}
    </TourContext.Provider>
  )
}
