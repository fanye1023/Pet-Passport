'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Syringe, Trash2, Pencil, FileText, ExternalLink, Upload, Loader2, Sparkles } from 'lucide-react'
import { Vaccination, PetDocument } from '@/lib/types/pet'
import { DocumentUpload } from '@/components/pets/document-upload'
import { ExtractedDataReview } from '@/components/vaccines/extracted-data-review'
import { ExtractionProgress } from '@/components/vaccines/extraction-progress'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'
import { sanitizeFileName, openPdfWithSignedUrl, isDateExpired, isDateExpiringSoon } from '@/lib/utils'

interface ExtractedVaccine {
  vaccine_name: string
  administered_date: string | null
  expiration_date: string | null
  veterinarian: string | null
  notes: string | null
  selected?: boolean
}

interface ExtractedReminder {
  title: string
  due_date: string
  event_type: 'vet_appointment' | 'medication'
  notes: string | null
  selected?: boolean
}

export default function VaccinationsPage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [documents, setDocuments] = useState<PetDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingVax, setEditingVax] = useState<Vaccination | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form state for vaccination records
  const [vaccineName, setVaccineName] = useState('')
  const [administeredDate, setAdministeredDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [veterinarian, setVeterinarian] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [notes, setNotes] = useState('')

  // Form state for standalone documents
  const [docName, setDocName] = useState('')
  const [docNotes, setDocNotes] = useState('')
  const [docUrl, setDocUrl] = useState('')

  // Extraction state
  const [extracting, setExtracting] = useState(false)
  const [extractionStage, setExtractionStage] = useState<'uploading' | 'analyzing' | 'complete' | 'error'>('uploading')
  const [extractionError, setExtractionError] = useState<string | undefined>()
  const [extractedVaccines, setExtractedVaccines] = useState<ExtractedVaccine[]>([])
  const [extractedReminders, setExtractedReminders] = useState<ExtractedReminder[]>([])
  const [extractedClinicName, setExtractedClinicName] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [savingExtracted, setSavingExtracted] = useState(false)

  useEffect(() => {
    loadData()
  }, [petId])

  const loadData = async () => {
    const [vaxResult, docsResult] = await Promise.all([
      supabase
        .from('vaccination_records')
        .select('*')
        .eq('pet_id', petId)
        .order('administered_date', { ascending: false }),
      supabase
        .from('pet_documents')
        .select('*')
        .eq('pet_id', petId)
        .eq('category', 'vaccination')
        .order('uploaded_at', { ascending: false })
    ])

    setVaccinations(vaxResult.data || [])
    setDocuments(docsResult.data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setEditingVax(null)
    setVaccineName('')
    setAdministeredDate('')
    setExpirationDate('')
    setVeterinarian('')
    setDocumentUrl('')
    setNotes('')
  }

  const resetDocForm = () => {
    setDocName('')
    setDocNotes('')
    setDocUrl('')
  }

  const openEditDialog = (vax: Vaccination) => {
    setEditingVax(vax)
    setVaccineName(vax.vaccine_name)
    setAdministeredDate(vax.administered_date)
    setExpirationDate(vax.expiration_date || '')
    setVeterinarian(vax.veterinarian || '')
    setDocumentUrl(vax.document_url || '')
    setNotes(vax.notes || '')
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleDocDialogChange = (open: boolean) => {
    setDocDialogOpen(open)
    if (!open) {
      resetDocForm()
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const vaxData = {
      vaccine_name: vaccineName,
      administered_date: administeredDate,
      expiration_date: expirationDate || null,
      veterinarian: veterinarian || null,
      document_url: documentUrl || null,
      notes: notes || null,
    }

    let error
    if (editingVax) {
      const result = await supabase
        .from('vaccination_records')
        .update(vaxData)
        .eq('id', editingVax.id)
      error = result.error
    } else {
      const result = await supabase.from('vaccination_records').insert({
        pet_id: petId,
        ...vaxData,
      })
      error = result.error
    }

    if (error) {
      toast.error('Failed to save', { description: error.message })
      setSaving(false)
      return
    }

    resetForm()
    setDialogOpen(false)
    setSaving(false)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vaccination record?')) return
    const { error } = await supabase.from('vaccination_records').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete', { description: error.message })
      return
    }
    toast.success('Vaccination deleted')
    loadData()
  }

  const handleUploadDocument = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    // Reset extraction state
    setExtractionError(undefined)
    setExtractionStage('uploading')
    setExtracting(true)
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const safeName = sanitizeFileName(file.name)
      const fileName = `${user.id}/${petId}/vaccinations/${Date.now()}-${safeName}`

      const { data, error } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(data.path)

      setDocUrl(publicUrl)
      setDocName(file.name.replace('.pdf', ''))
      setUploading(false)

      // Move to analyzing stage
      setExtractionStage('analyzing')

      try {
        // Get signed URL for the PDF (works even for private buckets)
        const { data: signedUrlData } = await supabase.storage
          .from('pet-documents')
          .createSignedUrl(data.path, 300) // 5 minute expiry

        const pdfUrl = signedUrlData?.signedUrl || publicUrl

        const extractResponse = await fetch('/api/extract-vaccine-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfUrl })
        })

        const extractedData = await extractResponse.json()

        if (extractedData.error && extractedData.vaccines?.length === 0) {
          // Show error in progress dialog briefly, then open doc dialog
          setExtractionStage('error')
          setExtractionError(extractedData.error)
          setTimeout(() => {
            setExtracting(false)
            setDocDialogOpen(true)
          }, 2000)
        } else if (extractedData.vaccines?.length > 0 || extractedData.reminders?.length > 0) {
          setExtractionStage('complete')
          setExtractedVaccines(extractedData.vaccines || [])
          setExtractedReminders(extractedData.reminders || [])
          setExtractedClinicName(extractedData.clinic_name)
          toast.success('Data extracted!', {
            description: `Found ${extractedData.vaccines?.length || 0} vaccines and ${extractedData.reminders?.length || 0} reminders`
          })
          // Brief delay to show completion, then open review
          setTimeout(() => {
            setExtracting(false)
            setReviewDialogOpen(true)
          }, 800)
        } else {
          setExtractionStage('error')
          setExtractionError('No vaccination data found in this document.')
          setTimeout(() => {
            setExtracting(false)
            setDocDialogOpen(true)
          }, 2000)
        }
      } catch (extractError) {
        console.error('Extraction error:', extractError)
        setExtractionStage('error')
        setExtractionError('Failed to analyze PDF. You can still save the document.')
        setTimeout(() => {
          setExtracting(false)
          setDocDialogOpen(true)
        }, 2000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document')
      setUploading(false)
      setExtracting(false)
    }

    // Reset the input so the same file can be uploaded again
    e.target.value = ''
  }, [supabase, petId])

  const handleSaveDocument = async () => {
    if (!docUrl || !docName) return

    setSaving(true)

    const { error } = await supabase.from('pet_documents').insert({
      pet_id: petId,
      category: 'vaccination',
      name: docName,
      document_url: docUrl,
      notes: docNotes || null,
    })

    if (error) {
      toast.error('Failed to save document', { description: error.message })
      setSaving(false)
      return
    }

    resetDocForm()
    setDocDialogOpen(false)
    setSaving(false)
    loadData()
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    const { error } = await supabase.from('pet_documents').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete document', { description: error.message })
      return
    }
    toast.success('Document deleted')
    loadData()
  }

  const handleSaveExtractedData = async (
    vaccines: ExtractedVaccine[],
    reminders: ExtractedReminder[]
  ) => {
    setSavingExtracted(true)

    try {
      // Save the document first
      if (docUrl && docName) {
        await supabase.from('pet_documents').insert({
          pet_id: petId,
          category: 'vaccination',
          name: docName,
          document_url: docUrl,
          notes: null,
        })
      }

      // Save vaccination records
      if (vaccines.length > 0) {
        const vaccineRecords = vaccines.map(v => ({
          pet_id: petId,
          vaccine_name: v.vaccine_name,
          administered_date: v.administered_date,
          expiration_date: v.expiration_date,
          veterinarian: v.veterinarian,
          document_url: docUrl,
          notes: v.notes,
        }))

        const { error: vaccineError } = await supabase
          .from('vaccination_records')
          .insert(vaccineRecords)

        if (vaccineError) {
          console.error('Error saving vaccines:', vaccineError)
          toast.error('Failed to save some vaccination records')
        }
      }

      // Save reminders to care_events calendar
      if (reminders.length > 0) {
        const calendarEvents = reminders.map(r => ({
          pet_id: petId,
          event_type: r.event_type,
          title: r.title,
          description: `Auto-extracted from vaccination document: ${docName}`,
          event_date: r.due_date,
          is_recurring: false,
          notes: r.notes,
        }))

        const { error: reminderError } = await supabase
          .from('care_events')
          .insert(calendarEvents)

        if (reminderError) {
          console.error('Error saving reminders:', reminderError)
          toast.error('Failed to save some calendar reminders')
        }
      }

      toast.success('Data saved successfully!', {
        description: `${vaccines.length} vaccinations and ${reminders.length} calendar events created`
      })

      // Reset state
      setReviewDialogOpen(false)
      setExtractedVaccines([])
      setExtractedReminders([])
      setExtractedClinicName(null)
      resetDocForm()
      loadData()
    } catch (error) {
      console.error('Error saving extracted data:', error)
      toast.error('Failed to save data')
    } finally {
      setSavingExtracted(false)
    }
  }

  // Use utility functions that handle timezone issues correctly
  const isExpired = (date: string | null) => isDateExpired(date)
  const isExpiringSoon = (date: string | null) => isDateExpiringSoon(date, 30)

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vaccination Records</h2>
          <p className="text-sm text-muted-foreground">
            Track your pet&apos;s vaccinations
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Upload a PDF and AI will automatically extract vaccine data and reminders
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            id="doc-upload"
            accept="application/pdf"
            onChange={handleUploadDocument}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('doc-upload')?.click()}
            disabled={uploading || extracting}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : extracting ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVax ? 'Edit Vaccination Record' : 'Add Vaccination Record'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Vaccine Name *</Label>
                  <Input
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="e.g., Rabies, DHPP"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Administered *</Label>
                    <Input
                      type="date"
                      value={administeredDate}
                      onChange={(e) => setAdministeredDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      min={administeredDate || undefined}
                    />
                    {expirationDate && administeredDate && expirationDate < administeredDate && (
                      <p className="text-xs text-destructive">Expiration date must be after administered date</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Veterinarian</Label>
                  <Input
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attach Certificate (PDF)</Label>
                  <DocumentUpload
                    value={documentUrl}
                    onChange={setDocumentUrl}
                    petId={petId}
                    folder="vaccinations"
                    label="Upload Certificate"
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
                  disabled={saving || !vaccineName || !administeredDate || (!!expirationDate && !!administeredDate && expirationDate < administeredDate)}
                  className="w-full"
                >
                  {saving ? 'Saving...' : editingVax ? 'Save Changes' : 'Add Vaccination'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Extraction progress dialog */}
      <ExtractionProgress
        open={extracting}
        stage={extractionStage}
        error={extractionError}
      />

      {/* Extracted data review dialog */}
      <ExtractedDataReview
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        vaccines={extractedVaccines}
        reminders={extractedReminders}
        clinicName={extractedClinicName}
        onConfirm={handleSaveExtractedData}
        saving={savingExtracted}
      />

      {/* Document name dialog */}
      <Dialog open={docDialogOpen} onOpenChange={handleDocDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Vaccination Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g., 2024 Vaccination Records"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                placeholder="Any notes about this document..."
              />
            </div>
            <Button
              onClick={handleSaveDocument}
              disabled={saving || !docName}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Document'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* Uploaded Documents Section */}
          {documents.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Uploaded Documents</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                            {doc.notes && (
                              <p className="text-xs text-muted-foreground">{doc.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPdfWithSignedUrl(doc.document_url)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Individual Vaccination Records */}
          <div>
            <h3 className="text-lg font-medium mb-3">Individual Records</h3>
            {vaccinations.length === 0 ? (
              <EmptyState
                variant="vaccinations"
                title="No vaccination records yet"
                description="Add individual vaccines or upload a PDF of your records"
              />
            ) : (
              <div className="space-y-3 animate-stagger">
                {vaccinations.map((vax) => (
                  <Card key={vax.id} className="card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{vax.vaccine_name}</CardTitle>
                          <CardDescription>
                            Administered: {new Date(vax.administered_date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {vax.expiration_date && (
                            <Badge
                              variant={
                                isExpired(vax.expiration_date)
                                  ? 'destructive'
                                  : isExpiringSoon(vax.expiration_date)
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {isExpired(vax.expiration_date)
                                ? 'Expired'
                                : `Expires ${new Date(vax.expiration_date).toLocaleDateString()}`}
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(vax)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(vax.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {vax.veterinarian && (
                        <p className="text-sm text-muted-foreground">
                          Vet: {vax.veterinarian}
                        </p>
                      )}
                      {vax.notes && (
                        <p className="text-sm text-muted-foreground">
                          {vax.notes}
                        </p>
                      )}
                      {vax.document_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPdfWithSignedUrl(vax.document_url!)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Certificate
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
