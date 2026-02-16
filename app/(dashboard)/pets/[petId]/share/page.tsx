'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateShareToken, getShareUrl } from '@/lib/share'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Share2, Trash2, Copy, Check, Eye, ExternalLink, Lock } from 'lucide-react'
import { ShareLink, Pet } from '@/lib/types/pet'
import { ShareQRCode } from '@/components/share/qr-code'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

const visibilityOptions = [
  { key: 'show_vaccinations', label: 'Vaccinations' },
  { key: 'show_health_records', label: 'Health Records' },
  { key: 'show_insurance', label: 'Insurance' },
  { key: 'show_vet_info', label: 'Veterinarians' },
  { key: 'show_emergency_contacts', label: 'Emergency Contacts' },
  { key: 'show_food', label: 'Food & Diet' },
  { key: 'show_routines', label: 'Daily Routine' },
  { key: 'show_care_instructions', label: 'Care Instructions' },
  { key: 'show_behavioral_notes', label: 'Behavioral Notes' },
]

export default function SharePage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [links, setLinks] = useState<ShareLink[]>([])
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [linkName, setLinkName] = useState('')
  const [expiresIn, setExpiresIn] = useState('never')
  const [customDays, setCustomDays] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    show_vaccinations: true,
    show_health_records: true,
    show_insurance: true,
    show_vet_info: true,
    show_emergency_contacts: true,
    show_food: true,
    show_routines: true,
    show_care_instructions: true,
    show_behavioral_notes: true,
  })

  useEffect(() => {
    loadLinks()
  }, [petId])

  const loadLinks = async () => {
    const [linksResult, petResult] = await Promise.all([
      supabase
        .from('share_links')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false }),
      supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()
    ])

    setLinks(linksResult.data || [])
    setPet(petResult.data)
    setLoading(false)
  }

  const handleCreate = async () => {
    setSaving(true)

    const token = generateShareToken()
    let expiresAt: string | null = null

    const days = expiresIn === 'custom' ? parseInt(customDays) : expiresIn !== 'never' ? parseInt(expiresIn) : 0
    if (days > 0) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      expiresAt = date.toISOString()
    }

    const { data: inserted, error } = await supabase.from('share_links').insert({
      pet_id: petId,
      token,
      name: linkName || null,
      expires_at: expiresAt,
      ...visibility,
    }).select().single()

    if (error) {
      toast.error('Failed to create share link')
      setSaving(false)
      return
    }

    // Set PIN if provided
    if (pin && inserted) {
      await supabase.rpc('set_share_pin', { link_id: inserted.id, pin })
    }

    setLinkName('')
    setExpiresIn('never')
    setPin('')
    setConfirmPin('')
    setVisibility({
      show_vaccinations: true,
      show_health_records: true,
      show_insurance: true,
      show_vet_info: true,
      show_emergency_contacts: true,
      show_food: true,
      show_routines: true,
      show_care_instructions: true,
      show_behavioral_notes: true,
    })
    setDialogOpen(false)
    setSaving(false)
    loadLinks()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('share_links').delete().eq('id', id)
    loadLinks()
  }

  const handleToggleActive = async (link: ShareLink) => {
    await supabase
      .from('share_links')
      .update({ is_active: !link.is_active })
      .eq('id', link.id)
    loadLinks()
  }

  const copyLink = async (token: string, id: string) => {
    const url = getShareUrl(token)
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const toggleVisibility = (key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getVisibleSections = (link: ShareLink) => {
    return visibilityOptions
      .filter((opt) => link[opt.key as keyof ShareLink])
      .map((opt) => opt.label)
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Share Links</h2>
          <p className="text-sm text-muted-foreground">
            Create links to share with sitters and walkers
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Share Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Link Name (optional)</Label>
                <Input
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., For dog walker"
                />
              </div>
              <div className="space-y-2">
                <Label>Expires</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="7">In 7 days</SelectItem>
                    <SelectItem value="30">In 30 days</SelectItem>
                    <SelectItem value="90">In 90 days</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {expiresIn === 'custom' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Number of days"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>What can they see?</Label>
                <div className="space-y-2">
                  {visibilityOptions.map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibility[opt.key]}
                        onChange={() => toggleVisibility(opt.key)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>PIN Protection (optional)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="4-6 digit PIN"
                />
                {pin.length > 0 && (
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm PIN"
                  />
                )}
                {pin.length > 0 && pin.length < 4 && (
                  <p className="text-xs text-destructive">PIN must be at least 4 digits</p>
                )}
                {pin.length >= 4 && confirmPin.length > 0 && pin !== confirmPin && (
                  <p className="text-xs text-destructive">PINs do not match</p>
                )}
              </div>
              <Button
                onClick={handleCreate}
                disabled={
                  saving ||
                  (expiresIn === 'custom' && (!customDays || parseInt(customDays) < 1)) ||
                  (pin.length > 0 && (pin.length < 4 || pin !== confirmPin))
                }
                className="w-full"
              >
                {saving ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </div>
      ) : links.length === 0 ? (
        <EmptyState
          variant="share"
          title="No share links yet"
          description="Create a link to share your pet's info with dog walkers, pet sitters, or anyone who needs it."
        />
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id} className={!link.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {link.name || 'Unnamed Link'}
                      {link.pin_hash && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          PIN Protected
                        </Badge>
                      )}
                      {!link.is_active && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                      {link.expires_at && isExpired(link.expires_at) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Eye className="h-3 w-3" />
                      {link.view_count} view{link.view_count !== 1 ? 's' : ''}
                      {link.last_viewed_at && (
                        <span>
                          • Last viewed{' '}
                          {new Date(link.last_viewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {getVisibleSections(link).map((section) => (
                    <Badge key={section} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>

                {link.expires_at && !isExpired(link.expires_at) && (
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(link.expires_at).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(link.token, link.id)}
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <ShareQRCode
                    url={getShareUrl(link.token)}
                    petName={pet?.name || 'Pet'}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getShareUrl(link.token), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(link)}
                  >
                    {link.is_active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
