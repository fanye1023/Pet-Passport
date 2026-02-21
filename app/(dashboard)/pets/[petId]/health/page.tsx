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
import { Plus, Trash2, Pencil, FileText, ExternalLink, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { HealthRecord, PetDocument } from '@/lib/types/pet'
import { DocumentUpload } from '@/components/pets/document-upload'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'
import { MedicationAffiliates } from '@/components/health/medication-affiliates'
import { sanitizeFileName, openPdfWithSignedUrl } from '@/lib/utils'

const recordTypes = [
  { value: 'checkup', label: 'Checkup' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'condition', label: 'Condition' },
]

export default function HealthRecordsPage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [records, setRecords] = useState<HealthRecord[]>([])
  const [documents, setDocuments] = useState<PetDocument[]>([])
  const [petName, setPetName] = useState('your pet')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractDialogOpen, setExtractDialogOpen] = useState(false)
  const [pendingDocUrl, setPendingDocUrl] = useState('')
  const [extractedData, setExtractedData] = useState<{
    records: Array<{
      record_type: string
      title: string
      description: string | null
      record_date: string | null
      veterinarian: string | null
    }>
    medications: Array<{
      name: string
      dosage: string | null
      frequency: string | null
      notes: string | null
    }>
    allergies: string[]
    chronic_conditions: string[]
    surgeries: Array<{
      name: string
      date: string | null
      notes: string | null
    }>
  } | null>(null)
  const [importingRecords, setImportingRecords] = useState(false)

  // Form state for health records
  const [recordType, setRecordType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [recordDate, setRecordDate] = useState('')
  const [veterinarian, setVeterinarian] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')

  // Form state for standalone documents
  const [docName, setDocName] = useState('')
  const [docNotes, setDocNotes] = useState('')
  const [docUrl, setDocUrl] = useState('')

  useEffect(() => {
    loadData()
  }, [petId])

  const loadData = async () => {
    const [recordsResult, docsResult, petResult] = await Promise.all([
      supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('record_date', { ascending: false }),
      supabase
        .from('pet_documents')
        .select('*')
        .eq('pet_id', petId)
        .eq('category', 'health')
        .order('uploaded_at', { ascending: false }),
      supabase
        .from('pets')
        .select('name')
        .eq('id', petId)
        .single()
    ])

    setRecords(recordsResult.data || [])
    setDocuments(docsResult.data || [])
    if (petResult.data) {
      setPetName(petResult.data.name)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setEditingRecord(null)
    setRecordType('')
    setTitle('')
    setDescription('')
    setRecordDate('')
    setVeterinarian('')
    setDocumentUrl('')
  }

  const resetDocForm = () => {
    setDocName('')
    setDocNotes('')
    setDocUrl('')
  }

  const openEditDialog = (record: HealthRecord) => {
    setEditingRecord(record)
    setRecordType(record.record_type)
    setTitle(record.title)
    setDescription(record.description || '')
    setRecordDate(record.record_date)
    setVeterinarian(record.veterinarian || '')
    setDocumentUrl(record.document_url || '')
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

    const recordData = {
      record_type: recordType,
      title,
      description: description || null,
      record_date: recordDate,
      veterinarian: veterinarian || null,
      document_url: documentUrl || null,
    }

    let error
    if (editingRecord) {
      const result = await supabase
        .from('health_records')
        .update(recordData)
        .eq('id', editingRecord.id)
      error = result.error
    } else {
      const result = await supabase.from('health_records').insert({
        pet_id: petId,
        ...recordData,
      })
      error = result.error
    }

    if (error) {
      console.error('Error saving health record:', error)
      toast.error('Failed to save', { description: error.message })
      setSaving(false)
      return
    }

    toast.success(editingRecord ? 'Record updated' : 'Record added')
    resetForm()
    setDialogOpen(false)
    setSaving(false)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return
    const { error } = await supabase.from('health_records').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete', { description: error.message })
      return
    }
    toast.success('Record deleted')
    loadData()
  }

  const handleUploadDocument = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const safeName = sanitizeFileName(file.name)
      const fileName = `${user.id}/${petId}/health/${Date.now()}-${safeName}`

      const { data, error } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(data.path)

      setDocUrl(publicUrl)
      setDocName(file.name.replace('.pdf', ''))
      setPendingDocUrl(publicUrl)
      setExtractDialogOpen(true)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }, [supabase, petId])

  const handleExtractData = async () => {
    if (!pendingDocUrl) return

    setExtracting(true)
    setExtractedData(null)

    try {
      // Get signed URL for the PDF (works even for private buckets)
      const urlPath = pendingDocUrl.split('/pet-documents/')[1]
      let pdfUrl = pendingDocUrl

      if (urlPath) {
        const { data: signedUrlData } = await supabase.storage
          .from('pet-documents')
          .createSignedUrl(urlPath, 300) // 5 minute expiry

        if (signedUrlData?.signedUrl) {
          pdfUrl = signedUrlData.signedUrl
        }
      }

      const response = await fetch('/api/extract-health-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl })
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      const hasData = data.records?.length > 0 ||
                      data.medications?.length > 0 ||
                      data.allergies?.length > 0 ||
                      data.chronic_conditions?.length > 0 ||
                      data.surgeries?.length > 0

      if (!hasData) {
        toast.info('No health data found in document')
        setExtractDialogOpen(false)
        setDocDialogOpen(true)
        return
      }

      setExtractedData(data)
      toast.success('Health data extracted successfully!')
    } catch (error) {
      console.error('Extraction error:', error)
      toast.error('Failed to extract data')
    } finally {
      setExtracting(false)
    }
  }

  const handleImportRecords = async () => {
    if (!extractedData) return

    setImportingRecords(true)

    try {
      // Import health records
      const recordsToInsert = extractedData.records.map(r => ({
        pet_id: petId,
        record_type: r.record_type,
        title: r.title,
        description: r.description,
        record_date: r.record_date || new Date().toISOString().split('T')[0],
        veterinarian: r.veterinarian,
        document_url: pendingDocUrl
      }))

      // Add surgeries as surgery records
      const surgeryRecords = extractedData.surgeries.map(s => ({
        pet_id: petId,
        record_type: 'surgery',
        title: s.name,
        description: s.notes,
        record_date: s.date || new Date().toISOString().split('T')[0],
        veterinarian: null,
        document_url: pendingDocUrl
      }))

      // Add allergies as allergy records
      const allergyRecords = extractedData.allergies.map(a => ({
        pet_id: petId,
        record_type: 'allergy',
        title: `Allergy: ${a}`,
        description: null,
        record_date: new Date().toISOString().split('T')[0],
        veterinarian: null,
        document_url: null
      }))

      // Add chronic conditions as condition records
      const conditionRecords = extractedData.chronic_conditions.map(c => ({
        pet_id: petId,
        record_type: 'condition',
        title: c,
        description: null,
        record_date: new Date().toISOString().split('T')[0],
        veterinarian: null,
        document_url: null
      }))

      // Add medications as treatment records
      const medicationRecords = extractedData.medications.map(m => ({
        pet_id: petId,
        record_type: 'treatment',
        title: `Medication: ${m.name}`,
        description: [
          m.dosage && `Dosage: ${m.dosage}`,
          m.frequency && `Frequency: ${m.frequency}`,
          m.notes
        ].filter(Boolean).join('\n') || null,
        record_date: new Date().toISOString().split('T')[0],
        veterinarian: null,
        document_url: null
      }))

      const allRecords = [
        ...recordsToInsert,
        ...surgeryRecords,
        ...allergyRecords,
        ...conditionRecords,
        ...medicationRecords
      ]

      if (allRecords.length > 0) {
        const { error } = await supabase.from('health_records').insert(allRecords)
        if (error) throw error
      }

      // Save the document
      await supabase.from('pet_documents').insert({
        pet_id: petId,
        category: 'health',
        name: docName || 'Health Document',
        document_url: pendingDocUrl,
        notes: 'AI-extracted health records'
      })

      toast.success(`Imported ${allRecords.length} health records!`)
      setExtractDialogOpen(false)
      setExtractedData(null)
      setPendingDocUrl('')
      resetDocForm()
      loadData()
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import records')
    } finally {
      setImportingRecords(false)
    }
  }

  const handleSkipExtraction = () => {
    setExtractDialogOpen(false)
    setExtractedData(null)
    setDocDialogOpen(true)
  }

  const handleSaveDocument = async () => {
    if (!docUrl || !docName) return

    setSaving(true)

    const { error } = await supabase.from('pet_documents').insert({
      pet_id: petId,
      category: 'health',
      name: docName,
      document_url: docUrl,
      notes: docNotes || null,
    })

    if (error) {
      console.error('Error saving document:', error)
      toast.error('Failed to save', { description: error.message })
      setSaving(false)
      return
    }

    toast.success('Document saved')
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

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Health Records</h2>
          <p className="text-sm text-muted-foreground">
            Medical history and health information
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            id="health-doc-upload"
            accept="application/pdf"
            onChange={handleUploadDocument}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('health-doc-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload PDF
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
                <DialogTitle>{editingRecord ? 'Edit Health Record' : 'Add Health Record'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Record Type *</Label>
                  <Select value={recordType} onValueChange={setRecordType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual Checkup"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
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
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about this record..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medical Document (PDF)</Label>
                  <DocumentUpload
                    value={documentUrl}
                    onChange={setDocumentUrl}
                    petId={petId}
                    folder="health-records"
                    label="Upload Document"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !recordType || !title || !recordDate}
                  className="w-full"
                >
                  {saving ? 'Saving...' : editingRecord ? 'Save Changes' : 'Add Record'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Extraction dialog */}
      <Dialog open={extractDialogOpen} onOpenChange={(open) => {
        if (!open && !extracting && !importingRecords) {
          setExtractDialogOpen(false)
          setExtractedData(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Health Record Extraction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!extractedData ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Would you like to use AI to automatically extract health records, medications, allergies, and more from this document?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExtractData}
                    disabled={extracting}
                    className="flex-1"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Health Data
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkipExtraction}
                    disabled={extracting}
                  >
                    Skip
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{extractedData.records.length}</p>
                      <p className="text-xs text-muted-foreground">Records</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{extractedData.medications.length}</p>
                      <p className="text-xs text-muted-foreground">Medications</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{extractedData.allergies.length}</p>
                      <p className="text-xs text-muted-foreground">Allergies</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{extractedData.surgeries.length}</p>
                      <p className="text-xs text-muted-foreground">Surgeries</p>
                    </div>
                  </div>

                  {/* Health Records */}
                  {extractedData.records.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Health Records</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {extractedData.records.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{r.title}</span>
                            <Badge variant="secondary" className="text-xs">{r.record_type}</Badge>
                            {r.record_date && <span className="text-muted-foreground">({r.record_date})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {extractedData.medications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Medications</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {extractedData.medications.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{m.name}</span>
                            {m.dosage && <span className="text-muted-foreground">• {m.dosage}</span>}
                            {m.frequency && <span className="text-muted-foreground">• {m.frequency}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {extractedData.allergies.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.allergies.map((a, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chronic Conditions */}
                  {extractedData.chronic_conditions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Chronic Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.chronic_conditions.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Surgeries */}
                  {extractedData.surgeries.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Surgeries</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {extractedData.surgeries.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{s.name}</span>
                            {s.date && <span className="text-muted-foreground">({s.date})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={handleImportRecords}
                    disabled={importingRecords}
                    className="flex-1"
                  >
                    {importingRecords ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Import All Records
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkipExtraction}
                    disabled={importingRecords}
                  >
                    Save Document Only
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document name dialog */}
      <Dialog open={docDialogOpen} onOpenChange={handleDocDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Health Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g., 2024 Health Records"
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
        <div className="space-y-3">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </div>
      ) : (
        <>
          {/* Uploaded Documents Section */}
          {documents.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Uploaded Documents</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="card-hover">
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

          {/* Individual Health Records */}
          <div>
            <h3 className="text-lg font-medium mb-3">Individual Records</h3>
            {records.length === 0 ? (
              <EmptyState
                variant="health"
                title="No health records yet"
                description="Add individual records or upload a PDF of your health documents"
              />
            ) : (
              <div className="space-y-3 animate-stagger">
                {records.map((record) => (
                  <Card key={record.id} className="card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{record.title}</CardTitle>
                            <Badge variant="secondary">{record.record_type}</Badge>
                          </div>
                          <CardDescription>
                            {new Date(record.record_date).toLocaleDateString()}
                            {record.veterinarian && ` • ${record.veterinarian}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {record.description && (
                        <p className="text-sm text-muted-foreground">
                          {record.description}
                        </p>
                      )}
                      {record.document_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPdfWithSignedUrl(record.document_url!)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Document
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Medication Affiliates */}
          <MedicationAffiliates petName={petName} />
        </>
      )}
    </div>
  )
}
