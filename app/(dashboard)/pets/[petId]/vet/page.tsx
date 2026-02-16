'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Phone, Mail, MapPin, Pencil, Loader2 } from 'lucide-react'
import { Veterinarian } from '@/lib/types/pet'
import { toast } from 'sonner'
import { VetCardSkeleton } from '@/components/ui/skeletons'
import { VetMapPreview } from '@/components/vet/vet-map-preview'
import { EmptyState } from '@/components/ui/empty-state'

interface PlaceResult {
  place_id: string
  name: string
  address: string
}

export default function VetPage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [vets, setVets] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null)

  const [name, setName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')

  // Places search state
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadVets()
  }, [petId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for clinics when typing
  const handleClinicNameChange = (value: string) => {
    setClinicName(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only search if we have at least 3 characters
    if (value.length >= 3) {
      setSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/places/search?query=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (data.results) {
            setSearchResults(data.results)
            setShowDropdown(true)
          }
        } catch (error) {
          console.error('Error searching places:', error)
        } finally {
          setSearching(false)
        }
      }, 300) // Debounce 300ms
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  // Select a place and fetch its details
  const handleSelectPlace = async (place: PlaceResult) => {
    setClinicName(place.name)
    setAddress(place.address)
    setShowDropdown(false)
    setFetchingDetails(true)

    try {
      const response = await fetch(`/api/places/details?place_id=${place.place_id}`)
      const data = await response.json()
      if (data.phone) setPhone(data.phone)
      if (data.website) setEmail(data.website) // Using website as a fallback since email isn't available
    } catch (error) {
      console.error('Error fetching place details:', error)
    } finally {
      setFetchingDetails(false)
    }
  }

  const loadVets = async () => {
    const { data } = await supabase
      .from('veterinarians')
      .select('*')
      .eq('pet_id', petId)
      .order('is_primary', { ascending: false })

    setVets(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setEditingVet(null)
    setName('')
    setClinicName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setIsPrimary(false)
    setNotes('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const openEditDialog = (vet: Veterinarian) => {
    setEditingVet(vet)
    setName(vet.name || '')
    setClinicName(vet.clinic_name || '')
    setPhone(vet.phone || '')
    setEmail(vet.email || '')
    setAddress(vet.address || '')
    setIsPrimary(vet.is_primary)
    setNotes(vet.notes || '')
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleSave = async () => {
    setSaving(true)

    // If marking as primary, unmark others first
    if (isPrimary) {
      await supabase
        .from('veterinarians')
        .update({ is_primary: false })
        .eq('pet_id', petId)
    }

    const vetData = {
      name: name || null,
      clinic_name: clinicName,
      phone: phone || null,
      email: email || null,
      address: address || null,
      is_primary: isPrimary,
      notes: notes || null,
    }

    let error
    if (editingVet) {
      const result = await supabase
        .from('veterinarians')
        .update(vetData)
        .eq('id', editingVet.id)
      error = result.error
    } else {
      const result = await supabase.from('veterinarians').insert({
        pet_id: petId,
        ...vetData,
      })
      error = result.error
    }

    if (error) {
      console.error('Error saving veterinarian:', error)
      toast.error('Failed to save', { description: error.message })
      setSaving(false)
      return
    }

    toast.success(editingVet ? 'Veterinarian updated' : 'Veterinarian added', {
      description: clinicName
    })
    resetForm()
    setDialogOpen(false)
    setSaving(false)
    loadVets()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this veterinarian?')) return
    const { error } = await supabase.from('veterinarians').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete', { description: error.message })
      return
    }
    toast.success('Veterinarian deleted')
    loadVets()
  }

  const handleSetPrimary = async (id: string) => {
    await supabase
      .from('veterinarians')
      .update({ is_primary: false })
      .eq('pet_id', petId)

    await supabase
      .from('veterinarians')
      .update({ is_primary: true })
      .eq('id', id)

    loadVets()
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Veterinarians</h2>
          <p className="text-sm text-muted-foreground">
            Your pet&apos;s healthcare providers
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVet ? 'Edit Veterinarian' : 'Add Veterinarian'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Clinic Name *</Label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Input
                      value={clinicName}
                      onChange={(e) => handleClinicNameChange(e.target.value)}
                      placeholder="Search for a clinic..."
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    />
                    {(searching || fetchingDetails) && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((place) => (
                        <button
                          key={place.place_id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                          onClick={() => handleSelectPlace(place)}
                        >
                          <div className="font-medium text-sm">{place.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{place.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Type to search and auto-fill clinic details
                </p>
              </div>
              <div className="space-y-2">
                <Label>Vet Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Smith"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vet@clinic.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPrimary" className="font-normal">
                  Set as primary veterinarian
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !clinicName}
                className="w-full"
              >
                {saving ? 'Saving...' : editingVet ? 'Save Changes' : 'Add Veterinarian'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <VetCardSkeleton />
          <VetCardSkeleton />
        </div>
      ) : vets.length === 0 ? (
        <EmptyState
          variant="vet"
          title="No veterinarians added yet"
          description="Add your pet's healthcare providers to keep their info handy"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 animate-stagger">
          {vets.map((vet) => (
            <Card key={vet.id} className="card-hover glass-card border-black/10 dark:border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{vet.clinic_name}</CardTitle>
                      {vet.is_primary && <Badge>Primary</Badge>}
                    </div>
                    {vet.name && (
                      <CardDescription>{vet.name}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(vet)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`flex gap-4 ${vet.address ? 'flex-row' : ''}`}>
                  {/* Contact info */}
                  <div className="flex-1 space-y-2">
                    {vet.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${vet.phone}`} className="text-primary hover:underline">
                          {vet.phone}
                        </a>
                      </p>
                    )}
                    {vet.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${vet.email}`} className="text-primary hover:underline">
                          {vet.email}
                        </a>
                      </p>
                    )}
                    {vet.address && (
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-2">{vet.address}</span>
                      </p>
                    )}
                    {vet.notes && (
                      <p className="text-sm text-muted-foreground pt-2">
                        {vet.notes}
                      </p>
                    )}
                    {!vet.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(vet.id)}
                        className="mt-2"
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>

                  {/* Map preview */}
                  {vet.address && (
                    <div className="w-28 flex-shrink-0">
                      <VetMapPreview
                        address={vet.address}
                        clinicName={vet.clinic_name || undefined}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
