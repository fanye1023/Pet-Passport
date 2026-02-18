'use client'

import { ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { PawPrint, Loader2 } from 'lucide-react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh?: () => Promise<void>
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const router = useRouter()

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      // Default behavior: refresh the page data
      router.refresh()
      // Small delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }, [onRefresh, router])

  const { pullDistance, isRefreshing, progress, isThresholdReached } = usePullToRefresh({
    onRefresh: handleRefresh,
  })

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50 overflow-hidden"
        style={{
          top: -60,
          height: pullDistance,
          opacity: Math.min(progress * 1.5, 1),
        }}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 transition-transform ${
            isThresholdReached ? 'scale-110' : ''
          }`}
          style={{
            transform: `rotate(${progress * 360}deg) scale(${0.5 + progress * 0.5})`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <PawPrint
              className={`h-5 w-5 transition-colors ${
                isThresholdReached ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
          )}
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
