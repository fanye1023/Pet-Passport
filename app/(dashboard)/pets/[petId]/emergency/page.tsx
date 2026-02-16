'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { Plus, Trash2, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { EmergencyContact } from '@/lib/types/pet'
import { useCrud } from '@/hooks/use-crud'
import { EmptyState } from '@/components/ui/empty-state'

export default function EmergencyPage() {
  const params = useParams()
  const petId = params.petId as string

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const crud = useCrud<EmergencyContact>({
    table: 'emergency_contacts',
    petId,
    toastLabels: {
      created: 'Contact added',
      updated: 'Contact updated',
      deleted: 'Contact deleted',
    },
  })

  // Re-assign onSuccess after load is available
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
  }

  const openEditDialog = (contact: EmergencyContact) => {
    setName(contact.name)
    setRelationship(contact.relationship || '')
    setPhone(contact.phone)
    setEmail(contact.email || '')
    setAddress(contact.address || '')
    setNotes(contact.notes || '')
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
      },
      resetForm,
    )
    if (success) loadContacts()
  }

  const handleDelete = async (id: string) => {
    const success = await crud.remove(id, 'Are you sure you want to delete this emergency contact?')
    if (success) loadContacts()
  }

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
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., Neighbor, Family, Friend"
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
          description="Add people to contact in case of an emergency"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 animate-stagger">
          {crud.items.map((contact) => (
            <Card key={contact.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{contact.name}</CardTitle>
                    {contact.relationship && (
                      <CardDescription>
                        <Badge variant="secondary" className="mt-1">
                          {contact.relationship}
                        </Badge>
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(contact.id)}
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
                    {contact.address}
                  </p>
                )}
                {contact.notes && (
                  <p className="text-sm text-muted-foreground pt-2">
                    {contact.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
