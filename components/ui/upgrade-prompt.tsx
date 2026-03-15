'use client'

import { useState } from 'react'
import { Crown, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradePromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
  currentUsage?: number
  limit?: number
}

const premiumBenefits = [
  'Unlimited pets',
  'Unlimited share links',
  'Unlimited collaborators',
  'Calendar sync (Google, Apple, Outlook)',
  'SMS reminders for appointments',
  'Priority support',
]

export function UpgradePrompt({
  open,
  onOpenChange,
  feature,
  currentUsage,
  limit,
}: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center mb-2">
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center">
            {currentUsage !== undefined && limit !== undefined ? (
              <>You've reached the free limit of {limit} {feature}. Upgrade to add more.</>
            ) : (
              <>{feature} is a premium feature. Upgrade to unlock it.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-3">Premium includes:</p>
            <ul className="space-y-2">
              {premiumBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">
              $7.99<span className="text-sm font-normal text-muted-foreground"> one-time</span>
            </p>
            <p className="text-xs text-muted-foreground">Lifetime access - pay once, enjoy forever</p>
          </div>

          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Redirecting...' : 'Upgrade Now'}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Inline upgrade banner for soft prompts
interface UpgradeBannerProps {
  feature: string
  onUpgrade?: () => void
  className?: string
}

export function UpgradeBanner({ feature, onUpgrade, className }: UpgradeBannerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      }
    } catch {
      // Silently fail for banner - user can try again
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Upgrade for {feature}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get unlimited access with Premium - $7.99 one-time
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
        </Button>
      </div>
    </div>
  )
}
