'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Mail, MapPin, Pencil, Phone, Star, User, Users, Home, Dog, Stethoscope } from 'lucide-react'
import { EmergencyContact, EmergencyContactType } from '@/lib/types/pet'
import { useCrud } from '@/hooks/use-crud'
import { EmptyState } from '@/components/ui/empty-state'

const CONTACT_TYPES: { value: EmergencyContactType; label: string; icon: typeof User }[] = [
  { value: 'owner', label: 'Owner', icon: User },
  { value: 'family', label: 'Family', icon: Users },
  { value: 'friend', label: 'Friend', icon: Users },
  { value: 'neighbor', label: 'Neighbor', icon: Home },
  { value: 'pet_sitter', label: 'Pet Sitter', icon: Dog },
  { value: 'veterinarian', label: 'Veterinarian', icon: Stethoscope },
  { value: 'other', label: 'Other', icon: User },
]

const getContactTypeLabel = (type: EmergencyContactType) => {
  return CONTACT_TYPES.find(t => t.value === type)?.label || 'Other'
}

const getContactTypeIcon = (type: EmergencyContactType) => {
  return CONTACT_TYPES.find(t => t.value === type)?.icon || User
}

const getContactTypeBadgeColor = (type: EmergencyContactType) => {
  switch (type) {
    case 'owner':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'family':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
    case 'friend':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    case 'neighbor':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
    case 'pet_sitter':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    case 'veterinarian':
      return 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20'
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
  }
}

export default function EmergencyPage() {
  const params = useParams()
  const petId = params.petId as string

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [contactType, setContactType] = useState<EmergencyContactType>('other')
  const [isPrimary, setIsPrimary] = useState(false)

  const crud = useCrud<EmergencyContact>({
    table: 'emergency_contacts',
    petId,
    toastLabels: {
      created: 'Contact added',
      updated: 'Contact updated',
      deleted: 'Contact deleted',
    },
  })

  // Sort contacts: owners first, then primary, then by type, then by name
  const sortedContacts = [...crud.items].sort((a, b) => {
    // Owners first
    if (a.contact_type === 'owner' && b.contact_type !== 'owner') return -1
    if (b.contact_type === 'owner' && a.contact_type !== 'owner') return 1
    // Primary contacts next
    if (a.is_primary && !b.is_primary) return -1
    if (b.is_primary && !a.is_primary) return 1
    // Then alphabetically by name
    return a.name.localeCompare(b.name)
  })

  const loadContacts = () => crud.load((q: any) => q.order('created_at', { ascending: true }))

  useEffect(() => {
    loadContacts()
  }, [petId])

  const resetForm = () => {
    setName('')
    setRelationship('')
    setPhone('')
    setEmail('')
    setAddress('')
    setNotes('')
    setContactType('other')
    setIsPrimary(false)
  }

  const openEditDialog = (contact: EmergencyContact) => {
    setName(contact.name)
    setRelationship(contact.relationship || '')
    setPhone(contact.phone)
    setEmail(contact.email || '')
    setAddress(contact.address || '')
    setNotes(contact.notes || '')
    setContactType(contact.contact_type || 'other')
    setIsPrimary(contact.is_primary || false)
    crud.openEdit(contact)
  }

  const handleSave = async () => {
    const success = await crud.save(
      {
        name,
        relationship: relationship || null,
        phone,
        email: email || null,
        address: address || null,
        notes: notes || null,
        contact_type: contactType,
        is_primary: isPrimary,
      },
      resetForm,
    )
    if (success) loadContacts()
  }

  const handleDelete = async (id: string) => {
    const success = await crud.remove(id, 'Are you sure you want to delete this emergency contact?')
    if (success) loadContacts()
  }

  // Group contacts by type for display
  const ownerContacts = sortedContacts.filter(c => c.contact_type === 'owner')
  const otherContacts = sortedContacts.filter(c => c.contact_type !== 'owner')

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <p className="text-sm text-muted-foreground">
            People to contact in case of emergency
          </p>
        </div>

        <Dialog open={crud.dialogOpen} onOpenChange={(open) => crud.handleDialogChange(open, resetForm)}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.editingItem ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Type *</Label>
                  <Select value={contactType} onValueChange={(v) => setContactType(v as EmergencyContactType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map((type) => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Relationship (optional)</Label>
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., Mom, Roommate, Regular walker"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone *</Label>
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
                    placeholder="john@example.com"
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
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked === true)}
                />
                <label
                  htmlFor="is-primary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Primary contact (call first in emergencies)
                </label>
              </div>
              <Button
                onClick={handleSave}
                disabled={crud.saving || !name || !phone}
                className="w-full"
              >
                {crud.saving ? 'Saving...' : crud.editingItem ? 'Save Changes' : 'Add Contact'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {crud.loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : crud.items.length === 0 ? (
        <EmptyState
          variant="emergency"
          title="No emergency contacts added yet"
          description="Add the pet owner and other people to contact in case of an emergency"
        />
      ) : (
        <div className="space-y-6">
          {/* Owner Section */}
          {ownerContacts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {ownerContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Contacts Section */}
          {otherContacts.length > 0 && (
            <div>
              {ownerContacts.length > 0 && (
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Other Contacts
                </h3>
              )}
              <div className="grid gap-4 md:grid-cols-2 animate-stagger">
                {otherContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: EmergencyContact
  onEdit: (contact: EmergencyContact) => void
  onDelete: (id: string) => void
}) {
  const TypeIcon = getContactTypeIcon(contact.contact_type || 'other')

  return (
    <Card className={`card-hover ${contact.contact_type === 'owner' ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getContactTypeBadgeColor(contact.contact_type || 'other')}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {contact.name}
                {contact.is_primary && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getContactTypeBadgeColor(contact.contact_type || 'other')}>
                  {getContactTypeLabel(contact.contact_type || 'other')}
                </Badge>
                {contact.relationship && (
                  <span className="text-xs text-muted-foreground">
                    {contact.relationship}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(contact)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(contact.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm flex items-center gap-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
            {contact.phone}
          </a>
        </p>
        {contact.email && (
          <p className="text-sm flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
              {contact.email}
            </a>
          </p>
        )}
        {contact.address && (
          <p className="text-sm flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {contact.address}
            </a>
          </p>
        )}
        {contact.notes && (
          <p className="text-sm text-muted-foreground pt-2">
            {contact.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
