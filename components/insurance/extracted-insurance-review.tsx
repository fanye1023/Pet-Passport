'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Shield, Sparkles, AlertCircle, Check, X } from 'lucide-react'

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

interface ExtractedInsuranceReviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  insurance: ExtractedInsurance | null
  onConfirm: (insurance: ExtractedInsurance) => void
  saving: boolean
}

export function ExtractedInsuranceReview({
  open,
  onOpenChange,
  insurance: initialInsurance,
  onConfirm,
  saving
}: ExtractedInsuranceReviewProps) {
  const [insurance, setInsurance] = useState<ExtractedInsurance | null>(null)

  // Reset state when dialog opens with new data
  useEffect(() => {
    if (open && initialInsurance) {
      setInsurance({ ...initialInsurance })
    }
    if (!open) {
      setInsurance(null)
    }
  }, [open, initialInsurance])

  const handleChange = (field: keyof ExtractedInsurance, value: string | string[] | null) => {
    if (!insurance) return
    setInsurance(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleConfirm = () => {
    if (insurance) {
      onConfirm(insurance)
    }
  }

  const hasData = initialInsurance !== null

  // Count how many fields have data
  const fieldCount = insurance ? Object.values(insurance).filter(v =>
    v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Extracted Insurance Data
          </DialogTitle>
          <DialogDescription>
            {hasData
              ? `Found ${fieldCount} fields. Review and edit the extracted information before saving.`
              : 'No insurance data could be extracted from this document.'}
          </DialogDescription>
        </DialogHeader>

        {!hasData ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              The PDF may be scanned, image-based, or in an unsupported format.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You can still save the document and add details manually.
            </p>
          </div>
        ) : insurance && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 py-4 pr-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Policy Information</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Provider Name</Label>
                  <Input
                    value={insurance.provider_name || ''}
                    onChange={(e) => handleChange('provider_name', e.target.value)}
                    placeholder="e.g., Healthy Paws"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Policy Number</Label>
                  <Input
                    value={insurance.policy_number || ''}
                    onChange={(e) => handleChange('policy_number', e.target.value)}
                    placeholder="e.g., POL-12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Coverage Type</Label>
                  <Input
                    value={insurance.coverage_type || ''}
                    onChange={(e) => handleChange('coverage_type', e.target.value)}
                    placeholder="e.g., Accident & Illness"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reimbursement Rate</Label>
                  <Input
                    value={insurance.reimbursement_rate || ''}
                    onChange={(e) => handleChange('reimbursement_rate', e.target.value)}
                    placeholder="e.g., 80%"
                  />
                </div>
              </div>
            </div>

            {/* Coverage Period */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Coverage Period</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={insurance.start_date || ''}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={insurance.end_date || ''}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Financial Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Annual Deductible</Label>
                  <Input
                    value={insurance.deductible || ''}
                    onChange={(e) => handleChange('deductible', e.target.value)}
                    placeholder="e.g., $250"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Annual Limit</Label>
                  <Input
                    value={insurance.annual_limit || ''}
                    onChange={(e) => handleChange('annual_limit', e.target.value)}
                    placeholder="e.g., $10,000 or Unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input
                    value={insurance.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="e.g., 1-800-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={insurance.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="e.g., claims@insurance.com"
                  />
                </div>
              </div>
            </div>

            {/* Coverage Details */}
            {(insurance.covered_services?.length || insurance.preventative_care?.length || insurance.excluded_services?.length) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Coverage Details</h3>

                {insurance.covered_services && insurance.covered_services.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      Covered Services
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance.covered_services.map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {insurance.preventative_care && insurance.preventative_care.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3 text-sky-500" />
                      Preventative Care
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance.preventative_care.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-sky-500/10 text-sky-700 dark:text-sky-400">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {insurance.excluded_services && insurance.excluded_services.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <X className="h-3 w-3 text-red-500" />
                      Exclusions
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance.excluded_services.map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-red-500/10 text-red-700 dark:text-red-400">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Waiting Periods */}
            {insurance.waiting_periods && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Waiting Periods</Label>
                <Textarea
                  value={insurance.waiting_periods}
                  onChange={(e) => handleChange('waiting_periods', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            )}

            {/* Notes */}
            {insurance.notes && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                <Textarea
                  value={insurance.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {hasData ? 'Skip' : 'Close'}
          </Button>
          {hasData && (
            <Button
              onClick={handleConfirm}
              disabled={saving || !insurance?.provider_name}
            >
              {saving ? 'Saving...' : 'Save Insurance Info'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
