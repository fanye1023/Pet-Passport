'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { Bookmark, PawPrint, ExternalLink, Trash2, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

interface SavedLink {
  id: string
  custom_name: string
  saved_at: string
  last_accessed_at: string | null
  share_token: string
  is_active: boolean
  pet: {
    name: string
    species: string
    breed: string | null
    photo_url: string | null
  }
}

export default function SavedPetsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<SavedLink | null>(null)

  useEffect(() => {
    loadSavedLinks()
  }, [])

  const loadSavedLinks = async () => {
    const { data, error } = await supabase.rpc('get_saved_share_links')

    if (error) {
      console.error('Error loading saved links:', error)
      toast.error('Failed to load saved pets')
      setLoading(false)
      return
    }

    setSavedLinks(data || [])
    setLoading(false)
  }

  const handleRemove = async () => {
    if (!linkToDelete) return

    const { error } = await supabase.rpc('remove_saved_share_link', {
      p_saved_link_id: linkToDelete.id,
    })

    if (error) {
      toast.error('Failed to remove saved pet')
      return
    }

    setSavedLinks((prev) => prev.filter((link) => link.id !== linkToDelete.id))
    toast.success('Removed from saved pets')
    setDeleteDialogOpen(false)
    setLinkToDelete(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Pets</h1>
          <p className="text-muted-foreground">Pet profiles shared with you</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          Saved Pets
        </h1>
        <p className="text-muted-foreground">Pet profiles shared with you</p>
      </div>

      {savedLinks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No saved pets yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              When someone shares a pet profile with you, you can save it here for quick access.
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Open a share link and click "Save to Account" to add it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedLinks.map((link) => (
            <Card
              key={link.id}
              className={`card-hover relative ${!link.is_active ? 'opacity-60' : ''}`}
            >
              {!link.is_active && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Expired
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                    <AvatarImage src={link.pet.photo_url || undefined} alt={link.pet.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                      <PawPrint className="h-6 w-6 text-primary/60" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {link.custom_name || link.pet.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {link.pet.breed ? `${link.pet.breed} ` : ''}
                      {link.pet.species}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Saved {formatDate(link.saved_at)}
                </div>

                <div className="flex gap-2">
                  {link.is_active ? (
                    <Button asChild className="flex-1">
                      <Link href={`/share/${link.share_token}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="flex-1">
                      Link Expired
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setLinkToDelete(link)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Saved Pet?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {linkToDelete?.custom_name || linkToDelete?.pet.name} from your saved pets?
              You can always save it again if you have the share link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
