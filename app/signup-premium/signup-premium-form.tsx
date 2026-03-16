'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Mail, Eye, EyeOff, Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

type FlowStatus = 'idle' | 'creating-account' | 'syncing-session' | 'redirecting-to-checkout' | 'email-confirmation'

export function SignupPremiumForm() {
  const searchParams = useSearchParams()
  const oauthComplete = searchParams.get('oauth_complete') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle')
  const supabase = createClient()

  // Handle OAuth completion - redirect to checkout
  useEffect(() => {
    if (oauthComplete) {
      handleCheckoutRedirect()
    }
  }, [oauthComplete])

  const handleCheckoutRedirect = async () => {
    setFlowStatus('redirecting-to-checkout')
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redirect to checkout')
      setFlowStatus('idle')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setFlowStatus('creating-account')

    // 1. Create account with Supabase
    const { error: signupError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/signup-premium?oauth_complete=true`,
      },
    })

    if (signupError) {
      setError(signupError.message)
      setFlowStatus('idle')
      return
    }

    // Check if user was auto-confirmed (session exists)
    if (data.session) {
      // 2. Sync session to server
      setFlowStatus('syncing-session')
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
          credentials: 'include',
        })
        const sessionResult = await sessionResponse.json()
        if (!sessionResponse.ok) {
          console.error('[SignupPremium] Failed to sync session:', sessionResult.error)
        }
      } catch (err) {
        console.error('[SignupPremium] Failed to setup server session:', err)
      }

      // 3. Redirect to checkout
      await handleCheckoutRedirect()
    } else {
      // Email confirmation required - show check email message
      setFlowStatus('email-confirmation')
    }
  }

  const handleResendEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signup-premium?oauth_complete=true`,
      },
    })

    if (error) {
      toast.error('Failed to resend email. Please try again.')
    } else {
      toast.success('Confirmation email sent!')
    }
  }

  const getStatusMessage = () => {
    switch (flowStatus) {
      case 'creating-account':
        return 'Creating your account...'
      case 'syncing-session':
        return 'Setting up your session...'
      case 'redirecting-to-checkout':
        return 'Redirecting to payment...'
      default:
        return 'Create account & upgrade'
    }
  }

  const isLoading = flowStatus !== 'idle' && flowStatus !== 'email-confirmation'

  // Email confirmation view
  if (flowStatus === 'email-confirmation') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {/* Background decorations */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo href="/" size="lg" />
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 glass-subtle flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              We&apos;ve sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              After confirming your email, you&apos;ll be redirected to complete your premium upgrade.
            </p>

            {/* Help text */}
            <div className="mt-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              <p>Can&apos;t find it? Check your spam folder.</p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full glass border-white/30"
                onClick={handleResendEmail}
              >
                Resend confirmation email
              </Button>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo href="/" size="lg" />
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Upgrade to Premium</h1>
            <p className="text-muted-foreground mt-1">Create an account to unlock premium features</p>
          </div>

          {/* Premium badge */}
          <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary flex items-center gap-2 glass-subtle mb-4">
            <Crown className="h-4 w-4 shrink-0" />
            <span>You&apos;ll be redirected to complete payment after signup</span>
          </div>

          {/* OAuth Buttons - only shown when enabled */}
          {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' && (
            <div className="space-y-4 mb-4">
              <OAuthButtons premiumIntent />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive glass-subtle">
                {error}
                {error.toLowerCase().includes('already') && (
                  <Link href="/login" className="block mt-2 text-primary hover:underline">
                    Sign in instead
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="glass border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={isLoading}
                  className="glass border-white/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength =
                        (password.length >= 6 ? 1 : 0) +
                        (password.length >= 8 ? 1 : 0) +
                        (/[A-Z]/.test(password) && /[a-z]/.test(password) ? 1 : 0) +
                        (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) ? 1 : 0)
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength
                              ? strength <= 1 ? 'bg-red-500'
                                : strength <= 2 ? 'bg-yellow-500'
                                : strength <= 3 ? 'bg-green-400'
                                : 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {password.length < 6 ? 'Too short' :
                     password.length < 8 ? 'Add more characters for a stronger password' :
                     !(/[A-Z]/.test(password) && /[a-z]/.test(password)) ? 'Add uppercase and lowercase letters' :
                     !(/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) ? 'Add numbers or symbols' :
                     'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={isLoading}
                  className="glass border-white/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full shadow-lg"
              disabled={isLoading || (confirmPassword !== '' && password !== confirmPassword)}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {getStatusMessage()}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
