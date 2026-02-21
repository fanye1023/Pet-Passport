'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getInvitationPreview, acceptInvitation, roleLabels, roleDescriptions } from '@/lib/collaborators'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleBadge } from '@/components/collaborators/role-badge'
import type { InvitationPreview } from '@/lib/types/pet'
import { PawPrint, Check, X, LogIn, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function InvitePage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()
  const [preview, setPreview] = useState<InvitationPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Check if user is logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser({ id: user.id, email: user.email || '' })
      }

      // Load invitation preview
      const previewData = await getInvitationPreview(token)
      setPreview(previewData)
      setIsLoading(false)
    }

    loadData()
  }, [token])

  const handleAccept = async () => {
    if (!currentUser) {
      // Redirect to login with return URL
      router.push(`/login?next=/invite/${token}`)
      return
    }

    setIsAccepting(true)
    const result = await acceptInvitation(token)

    if (result.success && result.petId) {
      toast.success('Invitation accepted! You now have access to this pet.')
      router.push(`/pets/${result.petId}`)
    } else {
      toast.error(result.error || 'Failed to accept invitation')
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-teal-500/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!preview?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-teal-500/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {preview?.error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/">
              <Button variant="outline">
                <PawPrint className="h-4 w-4 mr-2" />
                Go to Pet ShareLink
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const pet = preview.pet!
  const inviter = preview.inviter!
  const emailMatch = currentUser?.email?.toLowerCase() === preview.email?.toLowerCase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-teal-500/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
              Pet ShareLink
            </span>
          </div>

          <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {pet.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <CardTitle>Youre Invited!</CardTitle>
          <CardDescription>
            <strong>{inviter.display_name}</strong> has invited you to collaborate on{' '}
            <strong>{pet.name}</strong>s profile
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pet</span>
              <span className="font-medium">{pet.name}</span>
            </div>
            {pet.breed && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Breed</span>
                <span>{pet.breed}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Species</span>
              <span className="capitalize">{pet.species}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Role</span>
              <RoleBadge role={preview.role!} size="sm" />
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            As a <strong>{roleLabels[preview.role!]}</strong>, you will be able to:{' '}
            {roleDescriptions[preview.role!].toLowerCase()}
          </p>

          {currentUser && !emailMatch && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3 text-sm">
              <p className="text-amber-800 dark:text-amber-200">
                This invitation was sent to <strong>{preview.email}</strong>, but youre logged in as{' '}
                <strong>{currentUser.email}</strong>.
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-300 text-xs">
                Log in with the invited email to accept.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {!currentUser ? (
            <>
              <Button onClick={handleAccept} className="w-full" size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Log in to Accept
              </Button>
              <Link href={`/signup?next=/invite/${token}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </>
          ) : emailMatch ? (
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full"
              size="lg"
            >
              {isAccepting ? (
                'Accepting...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
          ) : (
            <Link href={`/login?next=/invite/${token}`} className="w-full">
              <Button className="w-full" size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Log in with {preview.email}
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
