'use client'

import { useState, useCallback } from 'react'
import { Syringe, FileText, PenLine, Loader2, X, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'
import { sanitizeFileName, openPdfWithSignedUrl } from '@/lib/utils'

interface StepVaccinationProps {
  petId: string
  petSpecies: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

const DOG_VACCINES = [
  { value: 'rabies', label: 'Rabies' },
  { value: 'dhpp', label: 'DHPP/DAPP (Distemper)' },
  { value: 'bordetella', label: 'Bordetella (Kennel Cough)' },
  { value: 'leptospirosis', label: 'Leptospirosis' },
  { value: 'lyme', label: 'Lyme Disease' },
  { value: 'canine_influenza', label: 'Canine Influenza' },
]

const CAT_VACCINES = [
  { value: 'rabies', label: 'Rabies' },
  { value: 'fvrcp', label: 'FVRCP (Feline Distemper)' },
  { value: 'felv', label: 'FeLV (Feline Leukemia)' },
  { value: 'fiv', label: 'FIV (Feline Immunodeficiency)' },
]

const OTHER_VACCINES = [
  { value: 'rabies', label: 'Rabies' },
  { value: 'other', label: 'Other Vaccine' },
]

type Mode = 'manual' | 'upload'

export function StepVaccination({ petId, petSpecies, onComplete, onSkip, onBack, isFirstStep }: StepVaccinationProps) {
  const [mode, setMode] = useState<Mode>('manual')

  // Manual entry state
  const [vaccineName, setVaccineName] = useState('')
  const [customName, setCustomName] = useState('')
  const [administeredDate, setAdministeredDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  // Upload state
  const [documentUrl, setDocumentUrl] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [uploading, setUploading] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const vaccines = petSpecies === 'dog'
    ? DOG_VACCINES
    : petSpecies === 'cat'
      ? CAT_VACCINES
      : OTHER_VACCINES

  const getVaccineLabel = () => {
    if (vaccineName === 'other') return customName
    return vaccines.find(v => v.value === vaccineName)?.label || vaccineName
  }

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

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

      setDocumentUrl(publicUrl)
      setDocumentName(file.name)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }, [supabase, petId])

  const handleSave = async () => {
    setIsLoading(true)

    if (mode === 'upload') {
      // Save as document
      const { error } = await supabase.from('pet_documents').insert({
        pet_id: petId,
        category: 'vaccination',
        name: documentName || 'Vaccination Records',
        document_url: documentUrl,
      })

      setIsLoading(false)
      if (!error) {
        onComplete()
      }
    } else {
      // Save as manual entry
      const finalName = vaccineName === 'other' ? customName : getVaccineLabel()

      const { error } = await supabase.from('vaccination_records').insert({
        pet_id: petId,
        vaccine_name: finalName,
        administered_date: administeredDate,
        expiration_date: expirationDate || null,
      })

      setIsLoading(false)
      if (!error) {
        onComplete()
      }
    }
  }

  const canProceedManual = (vaccineName && vaccineName !== 'other' && administeredDate) ||
                          (vaccineName === 'other' && customName.trim() && administeredDate)
  const canProceedUpload = !!documentUrl
  const canProceed = mode === 'upload' ? canProceedUpload : canProceedManual

  return (
    <OnboardingStep
      icon={Syringe}
      title="Add Vaccination Records"
      description="Record vaccinations or upload existing records"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={!!canProceed}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-3">
        {/* Mode Toggle */}
        <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="h-3.5 w-3.5" />
            Enter Manually
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Upload PDF
          </button>
        </div>

        {mode === 'manual' ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-sm">Vaccine *</Label>
              <Select value={vaccineName} onValueChange={setVaccineName}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select vaccine type" />
                </SelectTrigger>
                <SelectContent>
                  {vaccines.map((vaccine) => (
                    <SelectItem key={vaccine.value} value={vaccine.value}>
                      {vaccine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {vaccineName === 'other' && (
              <div className="space-y-1.5">
                <Label htmlFor="customName" className="text-sm">Vaccine Name *</Label>
                <Input
                  id="customName"
                  placeholder="Enter vaccine name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="adminDate" className="text-sm">Date Given *</Label>
                <Input
                  id="adminDate"
                  type="date"
                  value={administeredDate}
                  onChange={(e) => setAdministeredDate(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expDate" className="text-sm">Expires</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Upload vaccination records as PDF (vet certificates, etc.)
            </p>

            {documentUrl ? (
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{documentName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => openPdfWithSignedUrl(documentUrl)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setDocumentUrl('')
                    setDocumentName('')
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-5 text-center">
                <input
                  type="file"
                  id="vaccination-upload"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('vaccination-upload')?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose PDF File'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingStep>
  )
}
