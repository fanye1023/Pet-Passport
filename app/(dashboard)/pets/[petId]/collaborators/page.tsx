'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCollaborators, getPendingInvitations } from '@/lib/collaborators'
import { useCollaboratorRole } from '@/hooks/use-collaborator-role'
import { useSubscription } from '@/hooks/use-subscription'
import { CollaboratorList } from '@/components/collaborators/collaborator-list'
import { PendingInvitations } from '@/components/collaborators/pending-invitations'
import { InviteForm } from '@/components/collaborators/invite-form'
import { RoleBadge } from '@/components/collaborators/role-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UpgradePrompt } from '@/components/ui/upgrade-prompt'
import { Button } from '@/components/ui/button'
import type { PetCollaborator, PetInvitation, Pet } from '@/lib/types/pet'
import { Users, Info, Crown } from 'lucide-react'

export default function CollaboratorsPage({
  params
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = use(params)
  const [pet, setPet] = useState<Pet | null>(null)
  const [collaborators, setCollaborators] = useState<PetCollaborator[]>([])
  const [invitations, setInvitations] = useState<PetInvitation[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const { role, isOwner, canManageCollaborators } = useCollaboratorRole(petId)
  const { checkLimit } = useSubscription()

  const fetchData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)

    // Get pet info
    const { data: petData } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single()

    setPet(petData)

    // Get collaborators and invitations
    const [collabData, inviteData] = await Promise.all([
      getCollaborators(petId),
      canManageCollaborators ? getPendingInvitations(petId) : Promise.resolve([])
    ])

    setCollaborators(collabData)
    setInvitations(inviteData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [petId, canManageCollaborators])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!pet) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Pet not found or you dont have access.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Collaborators
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage who has access to {pet.name}&apos;s profile
          </p>
        </div>

        {canManageCollaborators && (
          (() => {
            const collabLimit = checkLimit('maxCollaborators', collaborators.length)
            if (!collabLimit.allowed) {
              return (
                <>
                  <Button onClick={() => setShowUpgradePrompt(true)}>
                    <Crown className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                  <UpgradePrompt
                    open={showUpgradePrompt}
                    onOpenChange={setShowUpgradePrompt}
                    feature="collaborators"
                    currentUsage={collaborators.length}
                    limit={typeof collabLimit.limit === 'number' ? collabLimit.limit : undefined}
                  />
                </>
              )
            }
            return (
              <InviteForm
                petId={petId}
                petName={pet.name}
                onInviteSent={fetchData}
              />
            )
          })()
        )}
      </div>

      {role && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            Your role: <RoleBadge role={role} size="sm" />
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {canManageCollaborators && invitations.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <PendingInvitations
                invitations={invitations}
                onUpdate={fetchData}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Collaborators</CardTitle>
            <CardDescription>
              People with access to view or edit {pet.name}&apos;s information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollaboratorList
              collaborators={collaborators}
              currentUserId={currentUserId || ''}
              isOwner={isOwner}
              onUpdate={fetchData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
