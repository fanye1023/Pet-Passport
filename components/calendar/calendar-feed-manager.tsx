'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Plus,
  Copy,
  Trash2,
  MoreVertical,
  Check,
  ExternalLink,
  Link2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { generateCalendarFeedToken, getCalendarFeedUrl } from '@/lib/calendar/ics-generator'

interface CalendarFeedToken {
  id: string
  user_id: string
  token: string
  name: string | null
  pet_id: string | null
  is_active: boolean
  created_at: string
  last_accessed_at: string | null
}

interface CalendarFeedManagerProps {
  petId?: string  // If provided, creates pet-specific feeds
  petName?: string
}

export function CalendarFeedManager({ petId, petName }: CalendarFeedManagerProps) {
  const supabase = createClient()
  const [feeds, setFeeds] = useState<CalendarFeedToken[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedName, setFeedName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadFeeds = useCallback(async () => {
    let query = supabase
      .from('calendar_feed_tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (petId) {
      // Get feeds specific to this pet OR general feeds (pet_id is null)
      query = query.or(`pet_id.eq.${petId},pet_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading feeds:', error)
      toast.error('Failed to load calendar feeds')
    } else {
      setFeeds(data || [])
    }
    setLoading(false)
  }, [supabase, petId])

  useEffect(() => {
    loadFeeds()
  }, [loadFeeds])

  const handleCreateFeed = async () => {
    setSaving(true)

    const token = generateCalendarFeedToken()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Not authenticated')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('calendar_feed_tokens').insert({
      user_id: user.id,
      token,
      name: feedName || (petId ? `${petName || 'Pet'} Calendar` : 'All Pets Calendar'),
      pet_id: petId || null,
    })

    if (error) {
      console.error('Error creating feed:', error)
      toast.error('Failed to create calendar feed')
    } else {
      toast.success('Calendar feed created')
      setFeedName('')
      setDialogOpen(false)
      loadFeeds()
    }
    setSaving(false)
  }

  const handleDeleteFeed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calendar feed? Anyone using this URL will no longer be able to access your calendar.')) {
      return
    }

    const { error } = await supabase
      .from('calendar_feed_tokens')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting feed:', error)
      toast.error('Failed to delete calendar feed')
    } else {
      toast.success('Calendar feed deleted')
      loadFeeds()
    }
  }

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const { error } = await supabase
      .from('calendar_feed_tokens')
      .update({ is_active: !currentlyActive })
      .eq('id', id)

    if (error) {
      console.error('Error updating feed:', error)
      toast.error('Failed to update calendar feed')
    } else {
      toast.success(currentlyActive ? 'Calendar feed deactivated' : 'Calendar feed activated')
      loadFeeds()
    }
  }

  const copyToClipboard = async (token: string, id: string) => {
    const url = getCalendarFeedUrl(token)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success('Calendar URL copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const openInNewTab = (token: string) => {
    const url = getCalendarFeedUrl(token)
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Sync
            </CardTitle>
            <CardDescription>
              Subscribe to your pet&apos;s care events in Google Calendar, Apple Calendar, or Outlook
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Feed
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Calendar Feed</DialogTitle>
                <DialogDescription>
                  Create a subscribable calendar URL that syncs your pet care events to any calendar app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Feed Name (optional)</Label>
                  <Input
                    value={feedName}
                    onChange={(e) => setFeedName(e.target.value)}
                    placeholder={petId ? `${petName || 'Pet'} Calendar` : 'All Pets Calendar'}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will appear in your calendar app
                  </p>
                </div>
                {petId && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-medium">Pet-specific feed</p>
                    <p className="text-muted-foreground">
                      This feed will only include events for {petName || 'this pet'}.
                    </p>
                  </div>
                )}
                {!petId && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-medium">All pets feed</p>
                    <p className="text-muted-foreground">
                      This feed will include events for all pets you have access to.
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleCreateFeed}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Creating...' : 'Create Feed'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {feeds.length === 0 ? (
          <div className="text-center py-6">
            <Link2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No calendar feeds yet. Create one to sync your pet care events.
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Feed
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {feed.name || (feed.pet_id ? 'Pet Calendar' : 'All Pets')}
                      </p>
                      {!feed.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                      {feed.pet_id && petId === feed.pet_id && (
                        <Badge variant="outline" className="text-xs">
                          This pet
                        </Badge>
                      )}
                      {!feed.pet_id && (
                        <Badge variant="outline" className="text-xs">
                          All pets
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(feed.created_at).toLocaleDateString()}
                      {feed.last_accessed_at && (
                        <> • Last synced {new Date(feed.last_accessed_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(feed.token, feed.id)}
                  >
                    {copiedId === feed.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyToClipboard(feed.token, feed.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openInNewTab(feed.token)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Browser
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(feed.id, feed.is_active)}>
                        {feed.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>How to use:</strong> Copy the feed URL and add it to your calendar app as a subscription.
            In Google Calendar, go to Settings → Add calendar → From URL. In Apple Calendar, go to
            File → New Calendar Subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
