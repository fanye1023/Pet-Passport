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
import { PetExpense, ExpenseType, InsuranceClaim } from '@/lib/types/pet'
import { DocumentUpload } from '@/components/pets/document-upload'
import { toast } from 'sonner'
import { Stethoscope, Pill, Scissors, Utensils, ShoppingBag, MoreHorizontal } from 'lucide-react'

const expenseTypes = [
  { value: 'vet_visit', label: 'Vet Visit', icon: Stethoscope },
  { value: 'medication', label: 'Medication', icon: Pill },
  { value: 'grooming', label: 'Grooming', icon: Scissors },
  { value: 'food', label: 'Food', icon: Utensils },
  { value: 'supplies', label: 'Supplies', icon: ShoppingBag },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
]

interface ExpenseDialogProps {
  petId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: PetExpense | null
  claims?: InsuranceClaim[]
  onSaved: () => void
}

export function ExpenseDialog({
  petId,
  open,
  onOpenChange,
  expense,
  claims = [],
  onSaved,
}: ExpenseDialogProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  // Form state
  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [claimId, setClaimId] = useState('')

  // Reset form when dialog opens/closes or expense changes
  useEffect(() => {
    if (open) {
      if (expense) {
        setExpenseType(expense.expense_type)
        setTitle(expense.title)
        setDescription(expense.description || '')
        setAmount(expense.amount.toString())
        setExpenseDate(expense.expense_date)
        setVendorName(expense.vendor_name || '')
        setReceiptUrl(expense.receipt_url || '')
        setClaimId(expense.claim_id || '')
      } else {
        // Reset for new expense
        setExpenseType('')
        setTitle('')
        setDescription('')
        setAmount('')
        setExpenseDate(new Date().toISOString().split('T')[0])
        setVendorName('')
        setReceiptUrl('')
        setClaimId('')
      }
    }
  }, [open, expense])

  const handleSave = async () => {
    if (!expenseType || !title || !amount || !expenseDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSaving(true)

    const expenseData = {
      expense_type: expenseType,
      title,
      description: description || null,
      amount: parsedAmount,
      expense_date: expenseDate,
      vendor_name: vendorName || null,
      receipt_url: receiptUrl || null,
      claim_id: claimId || null,
    }

    let error
    if (expense) {
      const result = await supabase
        .from('pet_expenses')
        .update(expenseData)
        .eq('id', expense.id)
      error = result.error
    } else {
      const result = await supabase.from('pet_expenses').insert({
        pet_id: petId,
        ...expenseData,
      })
      error = result.error
    }

    if (error) {
      console.error('Error saving expense:', error)
      toast.error('Failed to save expense', { description: error.message })
    } else {
      toast.success(expense ? 'Expense updated' : 'Expense added')
      onOpenChange(false)
      onSaved()
    }
    setSaving(false)
  }

  // Filter claims that are still open for linking
  const linkableClaims = claims.filter(
    (c) => c.status !== 'paid' && c.status !== 'denied'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Expense Type *</Label>
            <Select value={expenseType} onValueChange={(v) => setExpenseType(v as ExpenseType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
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
              placeholder="e.g., Annual checkup"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vendor/Provider</Label>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g., Happy Paws Vet Clinic"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt (PDF)</Label>
            <DocumentUpload
              value={receiptUrl}
              onChange={setReceiptUrl}
              petId={petId}
              folder="expenses"
              label="Upload Receipt"
            />
          </div>

          {linkableClaims.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Insurance Claim</Label>
              <Select value={claimId} onValueChange={setClaimId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a claim (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {linkableClaims.map((claim) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.title} (${claim.claimed_amount.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !expenseType || !title || !amount || !expenseDate}
            className="w-full"
          >
            {saving ? 'Saving...' : expense ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
