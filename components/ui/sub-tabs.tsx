'use client'

import * as React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SubTabItem {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SubTabsProps {
  tabs: SubTabItem[]
  className?: string
}

export function SubTabs({ tabs, className }: SubTabsProps) {
  const [showIndicator, setShowIndicator] = React.useState(true)

  // Hide the animated indicator after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowIndicator(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 border-b",
        className
      )}
    >
      <div
        className={cn(
          "inline-flex rounded-xl bg-muted/80 p-1.5 shadow-sm border",
          showIndicator && "animate-subtle-pulse"
        )}
      >
        <TabsList className="bg-transparent h-auto p-0 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "px-4 py-2.5 text-sm font-medium rounded-lg gap-2",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  )
}
