'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Shield, LogOut, Loader2, PawPrint, Crown, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { useCompanionOptional } from '@/components/ui/pet-companion'
import { UpgradeButton } from '@/components/pricing/upgrade-button'
import { useSubscription } from '@/hooks/use-subscription'

export default function SettingsPage() {
  const companion = useCompanionOptional()
  const [email, setEmail] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isBillingLoading, setIsBillingLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)

  // Use the same hook as dashboard
  const { isPremium, subscription, isLoading: isLoadingSubscription } = useSubscription()

  useEffect(() => {
    const fetchEmail = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
      setIsLoadingEmail(false)
    }
    fetchEmail()
  }, [])

  const handleViewBilling = useCallback(async () => {
    setIsBillingLoading(true)
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to open billing portal')
        setIsBillingLoading(false)
      }
    } catch {
      toast.error('Failed to open billing portal')
      setIsBillingLoading(false)
    }
  }, [])

  const handlePasswordReset = useCallback(async () => {
    if (!email) return
    setIsUpdating(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setIsUpdating(false)

    if (error) {
      toast.error('Failed to send reset email')
      return
    }

    toast.success('Password reset email sent! Check your inbox.')
  }, [email])

  const handleSignOut = useCallback(() => {
    window.location.href = '/logout'
  }, [])

  const isLoading = isLoadingEmail || isLoadingSubscription

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Subscription */}
      <Card className={isPremium ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-yellow-500/5' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className={`h-5 w-5 ${isPremium ? 'text-amber-500' : ''}`} />
            Subscription
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isPremium ? 'You have lifetime premium access' : 'Your current plan'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Lifetime Access</p>
                  <p className="text-sm text-muted-foreground">Thank you for your support!</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Your premium benefits:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Unlimited pet profiles</li>
                  <li>Unlimited share links</li>
                  <li>All features included</li>
                </ul>
              </div>
              <div className="flex items-center justify-between pt-2">
                {subscription?.started_at && (
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(subscription.started_at).toLocaleDateString()}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewBilling}
                  disabled={isBillingLoading}
                >
                  {isBillingLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Receipt
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Free Plan</p>
                <ul className="space-y-1">
                  <li>• 1 pet profile</li>
                  <li>• 3 share links</li>
                  <li>• All features included</li>
                </ul>
              </div>
              <Separator />
              <div>
                <p className="text-sm mb-3">Upgrade for unlimited pets and share links</p>
                <UpgradeButton className="w-full sm:w-auto" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <PawPrint className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Pet Companion</p>
                <p className="text-sm text-muted-foreground">
                  Show an animated pet mascot in the corner
                </p>
              </div>
            </div>
            <Switch
              checked={companion?.state.isVisible ?? false}
              onCheckedChange={() => companion?.toggle()}
              aria-label="Toggle pet companion"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Send a password reset link to your email
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
          <CardDescription>Sign out of your account on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
