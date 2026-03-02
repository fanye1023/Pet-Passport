"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface HelpTooltipProps {
  content: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function HelpTooltip({ content, side = "top", className }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-[250px]">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
