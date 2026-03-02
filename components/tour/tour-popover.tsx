"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TourStep } from "@/lib/types/tour"
import { cn } from "@/lib/utils"

interface TourPopoverProps {
  step: TourStep
  currentIndex: number
  totalSteps: number
  targetRect: DOMRect | null
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onClose: () => void
  onGoToStep: (index: number) => void
  onDismissPermanently: () => void
}

export function TourPopover({
  step,
  currentIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onClose,
  onGoToStep,
  onDismissPermanently,
}: TourPopoverProps) {
  if (!targetRect) return null

  const placement = step.placement || "bottom"
  const padding = step.spotlightPadding || 8
  const popoverWidth = 320
  const popoverOffset = 12

  // Calculate position based on placement (using viewport coordinates since popover is fixed)
  const getPosition = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const popoverHeight = 220 // Approximate height (slightly larger for new elements)

    let top = 0
    let left = 0

    switch (placement) {
      case "top":
        top = targetRect.top - padding - popoverOffset - popoverHeight
        left = targetRect.left + targetRect.width / 2 - popoverWidth / 2
        break
      case "bottom":
        top = targetRect.bottom + padding + popoverOffset
        left = targetRect.left + targetRect.width / 2 - popoverWidth / 2
        break
      case "left":
        top = targetRect.top + targetRect.height / 2 - popoverHeight / 2
        left = targetRect.left - padding - popoverWidth - popoverOffset
        break
      case "right":
        top = targetRect.top + targetRect.height / 2 - popoverHeight / 2
        left = targetRect.right + padding + popoverOffset
        break
    }

    // Keep within viewport bounds
    left = Math.max(16, Math.min(left, viewportWidth - popoverWidth - 16))
    top = Math.max(16, Math.min(top, viewportHeight - popoverHeight - 16))

    return { top, left }
  }

  const position = getPosition()

  const transformOrigin = {
    top: "bottom center",
    bottom: "top center",
    left: "right center",
    right: "left center",
  }[placement]

  return (
    <div
      className={cn(
        "fixed z-[9999] w-80 bg-popover text-popover-foreground rounded-lg border shadow-lg p-4",
        "animate-in fade-in-0 zoom-in-95"
      )}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin,
      }}
    >
      {/* Progress dots - clickable */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoToStep(i)}
            className={cn(
              "p-1 rounded-full transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "group"
            )}
            aria-label={`Go to step ${i + 1}`}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentIndex
                  ? "bg-primary"
                  : "bg-muted group-hover:bg-muted-foreground/50"
              )}
            />
          </button>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>

      {/* Content */}
      <div className="pr-6">
        <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground">{step.content}</p>

        {/* Interactive step hint */}
        {step.interactive && (
          <p className="text-xs text-primary mt-2 font-medium">
            Click to try it out
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Skip
        </Button>
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <Button variant="outline" size="sm" onClick={onPrev}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={onNext}>
            {currentIndex === totalSteps - 1 ? "Done" : "Next"}
          </Button>
        </div>
      </div>

      {/* Don't show again + keyboard hint */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed">
        <button
          onClick={onDismissPermanently}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Don&apos;t show again
        </button>
        <span className="text-[10px] text-muted-foreground/60">←→ navigate · Esc close</span>
      </div>
    </div>
  )
}
