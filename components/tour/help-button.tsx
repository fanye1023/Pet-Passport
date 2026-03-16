"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { HelpCircle, RotateCcw, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTour } from "./tour-provider"
import { getToursForRoute, getTourStepsForRoute } from "@/lib/tours/tour-registry"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface TourStatus {
  tourId: string
  completed: boolean
  dismissed: boolean
}

export function HelpButton() {
  const pathname = usePathname()
  const { restartTour, state } = useTour()
  const [tourStatuses, setTourStatuses] = useState<Record<string, TourStatus>>(
    {}
  )
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Get tours available for current route
  const availableTours = getToursForRoute(pathname)

  // Fetch tour completion statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      if (availableTours.length === 0) {
        setIsLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const tourIds = availableTours.map((t) => t.tourId)

      const { data } = await supabase
        .from("feature_tours")
        .select("tour_id, completed_at, dismissed_at")
        .eq("user_id", user.id)
        .in("tour_id", tourIds)

      const statuses: Record<string, TourStatus> = {}
      data?.forEach((record: { tour_id: string; completed_at: string | null; dismissed_at: string | null }) => {
        statuses[record.tour_id] = {
          tourId: record.tour_id,
          completed: !!record.completed_at,
          dismissed: !!record.dismissed_at,
        }
      })

      setTourStatuses(statuses)
      setIsLoading(false)
    }

    fetchStatuses()
  }, [supabase, pathname, availableTours.length])

  const handleStartTour = (tourId: string) => {
    // Get filtered steps for the current route
    const steps = getTourStepsForRoute(pathname, tourId)
    if (steps.length > 0) {
      restartTour(tourId, steps)
    }
  }

  // No tours for this page - don't render
  if (availableTours.length === 0) {
    return null
  }

  // Check tour states
  const firstTour = availableTours[0]
  const firstTourStatus = tourStatuses[firstTour.tourId]
  const isFirstTourCompleted = firstTourStatus?.completed
  const isFirstTourDismissed = firstTourStatus?.dismissed
  const hasUnseenTour = !isFirstTourCompleted && !isFirstTourDismissed
  const isTourActive = state.isActive

  // Single tour logic
  if (availableTours.length === 1) {
    // If tour hasn't been seen yet, click directly starts it
    if (hasUnseenTour && !isLoading) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full relative",
                !isTourActive && "animate-pulse"
              )}
              aria-label="Start tour"
              onClick={() => handleStartTour(firstTour.tourId)}
            >
              <Play className="h-4 w-4" />
              {/* Indicator dot */}
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Take a quick tour</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    // Tour was completed or dismissed - show dropdown with restart option
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => handleStartTour(firstTour.tourId)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replay {firstTour.label}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Multiple tours - always show dropdown
  const uncompletedTours = availableTours.filter((t) => {
    const status = tourStatuses[t.tourId]
    return !status?.completed && !status?.dismissed
  })
  const completedTours = availableTours.filter((t) => {
    const status = tourStatuses[t.tourId]
    return status?.completed || status?.dismissed
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative"
          aria-label="Help and tours"
        >
          <HelpCircle className="h-5 w-5" />
          {/* Show dot if there are unseen tours */}
          {uncompletedTours.length > 0 && !isLoading && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {uncompletedTours.length > 0 && (
          <>
            {uncompletedTours.map((entry) => (
              <DropdownMenuItem
                key={entry.tourId}
                onClick={() => handleStartTour(entry.tourId)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>{entry.label}</span>
              </DropdownMenuItem>
            ))}
            {completedTours.length > 0 && <DropdownMenuSeparator />}
          </>
        )}
        {completedTours.map((entry) => (
          <DropdownMenuItem
            key={entry.tourId}
            onClick={() => handleStartTour(entry.tourId)}
            className="flex items-center gap-2 cursor-pointer text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replay {entry.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
