'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InsuranceClaim, ClaimStatus } from '@/lib/types/pet'
import { DocumentUpload } from '@/components/pets/document-upload'
import { claimStatusOptions } from './claim-status-badge'
import { toast } from 'sonner'

interface ClaimDialogProps {
  petId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  claim?: InsuranceClaim | null
  onSaved: () => void
}

export function ClaimDialog({
  petId,
  open,
  onOpenChange,
  claim,
  onSaved,
}: ClaimDialogProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [claimNumber, setClaimNumber] = useState('')
  const [status, setStatus] = useState<ClaimStatus>('not_submitted')
  const [claimedAmount, setClaimedAmount] = useState('')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [reimbursementAmount, setReimbursementAmount] = useState('')
  const [submittedDate, setSubmittedDate] = useState('')
  const [resolvedDate, setResolvedDate] = useState('')
  const [reimbursementDate, setReimbursementDate] = useState('')
  const [claimDocumentUrl, setClaimDocumentUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [denialReason, setDenialReason] = useState('')

  // Reset form when dialog opens/closes or claim changes
  useEffect(() => {
    if (open) {
      if (claim) {
        setTitle(claim.title)
        setDescription(claim.description || '')
        setClaimNumber(claim.claim_number || '')
        setStatus(claim.status)
        setClaimedAmount(claim.claimed_amount.toString())
        setApprovedAmount(claim.approved_amount?.toString() || '')
        setReimbursementAmount(claim.reimbursement_amount?.toString() || '')
        setSubmittedDate(claim.submitted_date || '')
        setResolvedDate(claim.resolved_date || '')
        setReimbursementDate(claim.reimbursement_date || '')
        setClaimDocumentUrl(claim.claim_document_url || '')
        setNotes(claim.notes || '')
        setDenialReason(claim.denial_reason || '')
      } else {
        // Reset for new claim
        setTitle('')
        setDescription('')
        setClaimNumber('')
        setStatus('not_submitted')
        setClaimedAmount('')
        setApprovedAmount('')
        setReimbursementAmount('')
        setSubmittedDate('')
        setResolvedDate('')
        setReimbursementDate('')
        setClaimDocumentUrl('')
        setNotes('')
        setDenialReason('')
      }
    }
  }, [open, claim])

  const handleSave = async () => {
    if (!title || !claimedAmount) {
      toast.error('Please fill in all required fields')
      return
    }

    const parsedClaimedAmount = parseFloat(claimedAmount)
    if (isNaN(parsedClaimedAmount) || parsedClaimedAmount <= 0) {
      toast.error('Please enter a valid claimed amount')
      return
    }

    setSaving(true)

    const claimData = {
      title,
      description: description || null,
      claim_number: claimNumber || null,
      status,
      claimed_amount: parsedClaimedAmount,
      approved_amount: approvedAmount ? parseFloat(approvedAmount) : null,
      reimbursement_amount: reimbursementAmount ? parseFloat(reimbursementAmount) : null,
      submitted_date: submittedDate || null,
      resolved_date: resolvedDate || null,
      reimbursement_date: reimbursementDate || null,
      claim_document_url: claimDocumentUrl || null,
      notes: notes || null,
      denial_reason: denialReason || null,
    }

    let error
    if (claim) {
      const result = await supabase
        .from('insurance_claims')
        .update(claimData)
        .eq('id', claim.id)
      error = result.error
    } else {
      const result = await supabase.from('insurance_claims').insert({
        pet_id: petId,
        ...claimData,
      })
      error = result.error
    }

    if (error) {
      console.error('Error saving claim:', error)
      toast.error('Failed to save claim', { description: error.message })
    } else {
      toast.success(claim ? 'Claim updated' : 'Claim filed')
      onOpenChange(false)
      onSaved()
    }
    setSaving(false)
  }

  // Auto-set dates based on status changes
  const handleStatusChange = (newStatus: ClaimStatus) => {
    setStatus(newStatus)
    const today = new Date().toISOString().split('T')[0]

    if (newStatus === 'submitted' && !submittedDate) {
      setSubmittedDate(today)
    }
    if ((newStatus === 'approved' || newStatus === 'denied') && !resolvedDate) {
      setResolvedDate(today)
    }
    if (newStatus === 'paid' && !reimbursementDate) {
      setReimbursementDate(today)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{claim ? 'Edit Claim' : 'File Insurance Claim'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Claim Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Emergency vet visit - Oct 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Claimed Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {claimStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Claim Number</Label>
            <Input
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
              placeholder="Insurance claim reference number"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of what the claim is for..."
              rows={2}
            />
          </div>

          {/* Date fields based on status */}
          <div className="grid grid-cols-2 gap-4">
            {(status !== 'not_submitted') && (
              <div className="space-y-2">
                <Label>Submitted Date</Label>
                <Input
                  type="date"
                  value={submittedDate}
                  onChange={(e) => setSubmittedDate(e.target.value)}
                />
              </div>
            )}

            {(status === 'approved' || status === 'denied' || status === 'paid') && (
              <div className="space-y-2">
                <Label>Resolved Date</Label>
                <Input
                  type="date"
                  value={resolvedDate}
                  onChange={(e) => setResolvedDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Approval/Reimbursement fields */}
          {(status === 'approved' || status === 'paid') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Approved Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              {status === 'paid' && (
                <div className="space-y-2">
                  <Label>Reimbursement Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={reimbursementAmount}
                      onChange={(e) => setReimbursementAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'paid' && (
            <div className="space-y-2">
              <Label>Reimbursement Date</Label>
              <Input
                type="date"
                value={reimbursementDate}
                onChange={(e) => setReimbursementDate(e.target.value)}
              />
            </div>
          )}

          {/* Denial reason */}
          {status === 'denied' && (
            <div className="space-y-2">
              <Label>Denial Reason</Label>
              <Textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Reason provided by insurance company..."
                rows={2}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Claim Document (PDF)</Label>
            <DocumentUpload
              value={claimDocumentUrl}
              onChange={setClaimDocumentUrl}
              petId={petId}
              folder="claims"
              label="Upload Claim Document"
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

          <Button
            onClick={handleSave}
            disabled={saving || !title || !claimedAmount}
            className="w-full"
          >
            {saving ? 'Saving...' : claim ? 'Save Changes' : 'File Claim'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
