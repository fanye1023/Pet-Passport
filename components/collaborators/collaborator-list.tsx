'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RoleBadge } from './role-badge'
import { removeCollaborator, updateCollaboratorRole, roleLabels, roleDescriptions } from '@/lib/collaborators'
import type { PetCollaborator, CollaboratorRole } from '@/lib/types/pet'
import { MoreVertical, UserMinus, ShieldCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

interface CollaboratorListProps {
  collaborators: PetCollaborator[]
  currentUserId: string
  isOwner: boolean
  onUpdate: () => void
}

export function CollaboratorList({
  collaborators,
  currentUserId,
  isOwner,
  onUpdate
}: CollaboratorListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRemove = async () => {
    if (!removingId) return

    setIsLoading(true)
    const success = await removeCollaborator(removingId)

    if (success) {
      toast.success('Collaborator removed')
      onUpdate()
    } else {
      toast.error('Failed to remove collaborator')
    }

    setIsLoading(false)
    setRemovingId(null)
  }

  const handleRoleChange = async (collaboratorId: string, newRole: CollaboratorRole) => {
    setIsLoading(true)
    const success = await updateCollaboratorRole(collaboratorId, newRole)

    if (success) {
      toast.success('Role updated')
      onUpdate()
    } else {
      toast.error('Failed to update role')
    }

    setIsLoading(false)
  }

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const collaboratorToRemove = collaborators.find(c => c.id === removingId)

  return (
    <>
      <div className="space-y-3">
        {collaborators.map((collaborator) => {
          const isCurrentUser = collaborator.user_id === currentUserId
          const canModify = isOwner && !isCurrentUser && collaborator.role !== 'owner'
          const profile = collaborator.user_profile

          return (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(profile?.display_name || null)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {profile?.display_name || 'Unknown User'}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <RoleBadge role={collaborator.role} size="sm" />
                </div>
              </div>

              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(collaborator.id, 'editor')}
                      disabled={collaborator.role === 'editor'}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Make Editor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(collaborator.id, 'viewer')}
                      disabled={collaborator.role === 'viewer'}
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setRemovingId(collaborator.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}

        {collaborators.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No collaborators yet. Invite someone to share access to this pet.
          </div>
        )}
      </div>

      <AlertDialog open={!!removingId} onOpenChange={(open) => !open && setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{collaboratorToRemove?.user_profile?.display_name || 'this user'}</strong>{' '}
              from this pet? They will no longer have access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
