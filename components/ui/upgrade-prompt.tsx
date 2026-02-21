'use client'

import { Crown, Check, X } from 'lucide-react'
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
              $4.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-xs text-muted-foreground">or $49/year (save 18%)</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Coming soon! We'll notify you when premium is available.
          </p>
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
            Get unlimited access with Premium
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          onClick={onUpgrade}
        >
          Upgrade
        </Button>
      </div>
    </div>
  )
}
