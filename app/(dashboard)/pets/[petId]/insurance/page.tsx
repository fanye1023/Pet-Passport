'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Pencil, FileText, ExternalLink, Sparkles, Check, X, DollarSign, Calendar, Phone, Mail, Heart } from 'lucide-react'
import { PetInsurance } from '@/lib/types/pet'
import { DocumentUpload } from '@/components/pets/document-upload'
import { InsuranceExtractionProgress } from '@/components/insurance/insurance-extraction-progress'
import { ExtractedInsuranceReview } from '@/components/insurance/extracted-insurance-review'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

interface ExtractedInsurance {
  provider_name: string | null
  policy_number: string | null
  coverage_type: string | null
  start_date: string | null
  end_date: string | null
  contact_phone: string | null
  contact_email: string | null
  deductible: string | null
  annual_limit: string | null
  reimbursement_rate: string | null
  covered_services: string[] | null
  excluded_services: string[] | null
  preventative_care: string[] | null
  waiting_periods: string | null
  notes: string | null
}

export default function InsurancePage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [insurance, setInsurance] = useState<PetInsurance | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Basic fields
  const [providerName, setProviderName] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [coverageType, setCoverageType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')

  // Additional coverage fields
  const [deductible, setDeductible] = useState('')
  const [annualLimit, setAnnualLimit] = useState('')
  const [reimbursementRate, setReimbursementRate] = useState('')
  const [coveredServices, setCoveredServices] = useState<string[]>([])
  const [excludedServices, setExcludedServices] = useState<string[]>([])
  const [preventativeCare, setPreventativeCare] = useState<string[]>([])
  const [waitingPeriods, setWaitingPeriods] = useState('')
  const [notes, setNotes] = useState('')

  // Extraction state
  const [extractionStage, setExtractionStage] = useState<'uploading' | 'analyzing' | 'complete'>('uploading')
  const [showProgress, setShowProgress] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedInsurance | null>(null)

  useEffect(() => {
    loadInsurance()
  }, [petId])

  const loadInsurance = async () => {
    const { data } = await supabase
      .from('pet_insurance')
      .select('*')
      .eq('pet_id', petId)
      .single()

    if (data) {
      setInsurance(data)
      setProviderName(data.provider_name || '')
      setPolicyNumber(data.policy_number || '')
      setCoverageType(data.coverage_type || '')
      setStartDate(data.start_date || '')
      setEndDate(data.end_date || '')
      setContactPhone(data.contact_phone || '')
      setContactEmail(data.contact_email || '')
      setDocumentUrl(data.document_url || '')
      setDeductible(data.deductible || '')
      setAnnualLimit(data.annual_limit || '')
      setReimbursementRate(data.reimbursement_rate || '')
      setCoveredServices(data.covered_services || [])
      setExcludedServices(data.excluded_services || [])
      setPreventativeCare(data.preventative_care || [])
      setWaitingPeriods(data.waiting_periods || '')
      setNotes(data.notes || '')
    }
    setLoading(false)
  }

  const handleDocumentUpload = async (url: string) => {
    setDocumentUrl(url)

    if (url) {
      setExtractionStage('uploading')
      setShowProgress(true)

      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setExtractionStage('analyzing')

        const response = await fetch('/api/extract-insurance-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfUrl: url }),
        })

        const result = await response.json()

        setExtractionStage('complete')
        await new Promise(resolve => setTimeout(resolve, 500))
        setShowProgress(false)

        if (result.error) {
          toast.error('Extraction failed', { description: result.error })
          return
        }

        if (result.insurance) {
          setExtractedData(result.insurance)
          setShowReview(true)
          toast.success('Insurance data extracted', {
            description: 'Review the extracted information below'
          })
        } else {
          toast.info('No data found', {
            description: 'Could not extract insurance data from this PDF'
          })
        }
      } catch (error) {
        console.error('Extraction error:', error)
        setShowProgress(false)
        toast.error('Extraction failed', {
          description: 'An error occurred while processing the document'
        })
      }
    }
  }

  const handleExtractedDataConfirm = async (data: ExtractedInsurance) => {
    setShowReview(false)
    setSaving(true)

    // Build insurance data from extracted data
    const insuranceData = {
      pet_id: petId,
      provider_name: data.provider_name || 'Unknown Provider',
      policy_number: data.policy_number || null,
      coverage_type: data.coverage_type || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      contact_phone: data.contact_phone || null,
      contact_email: data.contact_email || null,
      document_url: documentUrl || null,
      deductible: data.deductible || null,
      annual_limit: data.annual_limit || null,
      reimbursement_rate: data.reimbursement_rate || null,
      covered_services: data.covered_services || null,
      excluded_services: data.excluded_services || null,
      preventative_care: data.preventative_care || null,
      waiting_periods: data.waiting_periods || null,
      notes: data.notes || null,
    }

    let error
    if (insurance) {
      const result = await supabase
        .from('pet_insurance')
        .update(insuranceData)
        .eq('id', insurance.id)
      error = result.error
    } else {
      const result = await supabase.from('pet_insurance').insert(insuranceData)
      error = result.error
    }

    setSaving(false)

    if (error) {
      console.error('Error saving insurance:', error)
      toast.error('Error saving', { description: error.message })
      return
    }

    toast.success('Insurance saved!')
    loadInsurance()
  }

  const handleSave = async () => {
    setSaving(true)

    const insuranceData = {
      pet_id: petId,
      provider_name: providerName,
      policy_number: policyNumber || null,
      coverage_type: coverageType || null,
      start_date: startDate || null,
      end_date: endDate || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      document_url: documentUrl || null,
      deductible: deductible || null,
      annual_limit: annualLimit || null,
      reimbursement_rate: reimbursementRate || null,
      covered_services: coveredServices.length > 0 ? coveredServices : null,
      excluded_services: excludedServices.length > 0 ? excludedServices : null,
      preventative_care: preventativeCare.length > 0 ? preventativeCare : null,
      waiting_periods: waitingPeriods || null,
      notes: notes || null,
    }

    let error
    if (insurance) {
      const result = await supabase
        .from('pet_insurance')
        .update(insuranceData)
        .eq('id', insurance.id)
      error = result.error
    } else {
      const result = await supabase.from('pet_insurance').insert(insuranceData)
      error = result.error
    }

    if (error) {
      console.error('Error saving insurance:', error)
      toast.error('Error saving', { description: error.message })
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(false)
    toast.success('Insurance saved')
    loadInsurance()
  }

  const handleDelete = async () => {
    if (!insurance) return
    if (!confirm('Are you sure you want to delete this insurance information?')) return

    await supabase.from('pet_insurance').delete().eq('id', insurance.id)
    setInsurance(null)
    setProviderName('')
    setPolicyNumber('')
    setCoverageType('')
    setStartDate('')
    setEndDate('')
    setContactPhone('')
    setContactEmail('')
    setDocumentUrl('')
    setDeductible('')
    setAnnualLimit('')
    setReimbursementRate('')
    setCoveredServices([])
    setExcludedServices([])
    setPreventativeCare([])
    setWaitingPeriods('')
    setNotes('')
    toast.success('Insurance deleted')
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pet Insurance</h2>
          <p className="text-sm text-muted-foreground">
            Insurance policy information
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Upload a PDF and AI will automatically extract policy details
          </p>
        </div>
        {insurance && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {!insurance && !editing ? (
        <EmptyState
          variant="insurance"
          title="No insurance information"
          description="Upload a policy document and we'll automatically extract the details using AI"
          action={
            <div className="flex flex-col items-center gap-3">
              <DocumentUpload
                value=""
                onChange={handleDocumentUpload}
                petId={petId}
                folder="insurance"
                label="Upload Policy PDF"
              />
              <span className="text-xs text-muted-foreground">or</span>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Enter Manually
              </Button>
            </div>
          }
        />
      ) : editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Insurance Details
              {extractedData && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Extracted
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider Name *</Label>
                <Input
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g., Healthy Paws"
                />
              </div>
              <div className="space-y-2">
                <Label>Policy Number</Label>
                <Input
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="e.g., POL-12345"
                />
              </div>
              <div className="space-y-2">
                <Label>Coverage Type</Label>
                <Input
                  value={coverageType}
                  onChange={(e) => setCoverageType(e.target.value)}
                  placeholder="e.g., Accident & Illness"
                />
              </div>
              <div className="space-y-2">
                <Label>Reimbursement Rate</Label>
                <Input
                  value={reimbursementRate}
                  onChange={(e) => setReimbursementRate(e.target.value)}
                  placeholder="e.g., 80%"
                />
              </div>
            </div>

            <Separator />

            {/* Financial Details */}
            <div>
              <h3 className="text-sm font-medium mb-3">Financial Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Annual Deductible</Label>
                  <Input
                    value={deductible}
                    onChange={(e) => setDeductible(e.target.value)}
                    placeholder="e.g., $250"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Limit</Label>
                  <Input
                    value={annualLimit}
                    onChange={(e) => setAnnualLimit(e.target.value)}
                    placeholder="e.g., $10,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g., 1-800-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g., claims@insurance.com"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Waiting Periods & Notes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Waiting Periods</Label>
                <Textarea
                  value={waitingPeriods}
                  onChange={(e) => setWaitingPeriods(e.target.value)}
                  placeholder="e.g., 14 days for illness, 6 months for orthopedic"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label>Policy Document (PDF)</Label>
              <DocumentUpload
                value={documentUrl}
                onChange={handleDocumentUpload}
                petId={petId}
                folder="insurance"
                label="Upload Policy Document"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Upload a PDF to auto-extract policy details
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving || !providerName}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              {insurance && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Main Policy Card */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {insurance!.provider_name}
              </CardTitle>
              {insurance!.coverage_type && (
                <CardDescription>{insurance!.coverage_type}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Policy Badge & Dates */}
              <div className="flex flex-wrap items-center gap-2">
                {insurance!.policy_number && (
                  <Badge variant="outline" className="font-mono">
                    Policy #{insurance!.policy_number}
                  </Badge>
                )}
                {insurance!.reimbursement_rate && (
                  <Badge variant="secondary">
                    {insurance!.reimbursement_rate} Reimbursement
                  </Badge>
                )}
              </div>

              {/* Financial Details */}
              {(insurance!.deductible || insurance!.annual_limit) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {insurance!.deductible && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deductible</p>
                        <p className="font-medium">{insurance!.deductible}</p>
                      </div>
                    </div>
                  )}
                  {insurance!.annual_limit && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Limit</p>
                        <p className="font-medium">{insurance!.annual_limit}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coverage Period */}
              {(insurance!.start_date || insurance!.end_date) && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Coverage Period:</span>
                  {insurance!.start_date &&
                    new Date(insurance!.start_date).toLocaleDateString()}{' '}
                  {insurance!.end_date &&
                    `- ${new Date(insurance!.end_date).toLocaleDateString()}`}
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {insurance!.contact_phone && (
                  <a
                    href={`tel:${insurance!.contact_phone}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {insurance!.contact_phone}
                  </a>
                )}
                {insurance!.contact_email && (
                  <a
                    href={`mailto:${insurance!.contact_email}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {insurance!.contact_email}
                  </a>
                )}
              </div>

              {/* Document Link */}
              {insurance!.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(insurance!.document_url!, '_blank')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Policy Document
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Coverage Details Card */}
          {(insurance!.covered_services?.length || insurance!.excluded_services?.length || insurance!.preventative_care?.length || insurance!.waiting_periods) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coverage Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Covered Services */}
                {insurance!.covered_services && insurance!.covered_services.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Check className="h-4 w-4 text-green-500" />
                      What&apos;s Covered
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance!.covered_services.map((service, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preventative Care */}
                {insurance!.preventative_care && insurance!.preventative_care.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4 text-sky-500" />
                      Preventative Care
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance!.preventative_care.map((item, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluded Services */}
                {insurance!.excluded_services && insurance!.excluded_services.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <X className="h-4 w-4 text-red-500" />
                      Exclusions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance!.excluded_services.map((service, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waiting Periods */}
                {insurance!.waiting_periods && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Waiting Periods</p>
                    <p className="text-sm text-muted-foreground">{insurance!.waiting_periods}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes Card */}
          {insurance!.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insurance!.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Extraction Progress Dialog */}
      <InsuranceExtractionProgress
        open={showProgress}
        stage={extractionStage}
      />

      {/* Extracted Data Review Dialog */}
      <ExtractedInsuranceReview
        open={showReview}
        onOpenChange={setShowReview}
        insurance={extractedData}
        onConfirm={handleExtractedDataConfirm}
        saving={false}
      />
    </div>
  )
}
