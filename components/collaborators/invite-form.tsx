'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createInvitation, getInviteUrl, roleDescriptions } from '@/lib/collaborators'
import type { CollaboratorRole, PetInvitation } from '@/lib/types/pet'
import { UserPlus, Copy, Check, Link } from 'lucide-react'
import { toast } from 'sonner'

interface InviteFormProps {
  petId: string
  petName: string
  onInviteSent: () => void
}

export function InviteForm({ petId, petName, onInviteSent }: InviteFormProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<CollaboratorRole>('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [invitation, setInvitation] = useState<PetInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    const result = await createInvitation(petId, email.trim(), role)

    if (result.success && result.invitation) {
      setInvitation(result.invitation)
      toast.success('Invitation created')
      onInviteSent()
    } else {
      toast.error(result.error || 'Failed to create invitation')
    }

    setIsLoading(false)
  }

  const handleCopyLink = async () => {
    if (!invitation) return

    const url = getInviteUrl(invitation.token)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard')

    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setOpen(false)
    // Reset form after animation
    setTimeout(() => {
      setEmail('')
      setRole('viewer')
      setInvitation(null)
      setCopied(false)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Collaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on {petName}s profile.
          </DialogDescription>
        </DialogHeader>

        {!invitation ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="collaborator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as CollaboratorRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Editor</span>
                      <span className="text-xs text-muted-foreground">
                        {roleDescriptions.editor}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Viewer</span>
                      <span className="text-xs text-muted-foreground">
                        {roleDescriptions.viewer}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Invitation'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
                <Check className="h-5 w-5" />
                <span className="font-medium">Invitation Created</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Share this link with <strong>{invitation.email}</strong> to give them access.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getInviteUrl(invitation.token)}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link expires in 7 days.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
