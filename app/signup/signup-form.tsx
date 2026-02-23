'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Mail, Eye, EyeOff, Bookmark, Check } from 'lucide-react'
import { toast } from 'sonner'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const saveToken = searchParams.get('saveToken')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if user was auto-confirmed (session exists)
      if (data.session) {
        // If saveToken is provided, save the share link to user's account
        if (saveToken) {
          const { data: saveData } = await supabase.rpc('save_share_link', {
            p_share_token: saveToken,
          })
          if (saveData?.success) {
            toast.success(`${saveData.pet_name} saved to your account!`)
          }
          // Redirect to the share page or saved pets
          router.push(returnTo || '/saved')
        } else {
          // User is logged in - redirect to create first pet
          router.push('/onboarding/new')
        }
      } else {
        // Email confirmation required - show check email message
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      toast.error('Failed to resend email. Please try again.')
    } else {
      toast.success('Confirmation email sent!')
    }
  }

  if (success) {
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
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend confirmation email'}
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
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground mt-1">Enter your email to get started</p>
          </div>

          <div className="space-y-4">
            {saveToken && (
              <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary flex items-center gap-2 glass-subtle">
                <Bookmark className="h-4 w-4 shrink-0" />
                <span>Create an account to save this pet profile</span>
              </div>
            )}

            {/* OAuth Buttons */}
            <OAuthButtons returnTo={returnTo || undefined} saveToken={saveToken || undefined} />

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

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive glass-subtle">
                {error}
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

            <Button type="submit" className="w-full shadow-lg" disabled={loading || (confirmPassword !== '' && password !== confirmPassword)}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={saveToken ? `/login?returnTo=${returnTo || ''}&saveToken=${saveToken}` : '/login'}
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
