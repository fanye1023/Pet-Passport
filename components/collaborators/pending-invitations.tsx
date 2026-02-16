'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { cancelInvitation, getInviteUrl } from '@/lib/collaborators'
import type { PetInvitation } from '@/lib/types/pet'
import { Mail, Copy, X, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface PendingInvitationsProps {
  invitations: PetInvitation[]
  onUpdate: () => void
}

export function PendingInvitations({ invitations, onUpdate }: PendingInvitationsProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (invitations.length === 0) {
    return null
  }

  const handleCancel = async () => {
    if (!cancelingId) return

    setIsLoading(true)
    const success = await cancelInvitation(cancelingId)

    if (success) {
      toast.success('Invitation cancelled')
      onUpdate()
    } else {
      toast.error('Failed to cancel invitation')
    }

    setIsLoading(false)
    setCancelingId(null)
  }

  const handleCopyLink = async (invitation: PetInvitation) => {
    const url = getInviteUrl(invitation.token)
    await navigator.clipboard.writeText(url)
    setCopiedId(invitation.id)
    toast.success('Link copied')

    setTimeout(() => setCopiedId(null), 2000)
  }

  const invitationToCancel = invitations.find(i => i.id === cancelingId)

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending Invitations
        </h3>

        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="font-medium">{invitation.email}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RoleBadge role={invitation.role} size="sm" showIcon={false} />
                  <span>
                    Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyLink(invitation)}
                title="Copy invitation link"
              >
                {copiedId === invitation.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCancelingId(invitation.id)}
                className="text-destructive hover:text-destructive"
                title="Cancel invitation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!cancelingId} onOpenChange={(open) => !open && setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation for{' '}
              <strong>{invitationToCancel?.email}</strong>? The invite link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Invitation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
