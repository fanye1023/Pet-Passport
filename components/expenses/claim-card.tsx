'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InsuranceClaim, PetExpense } from '@/lib/types/pet'
import { ClaimStatusBadge } from './claim-status-badge'
import { Pencil, Trash2, FileText, ExternalLink, Receipt } from 'lucide-react'
import { openPdfWithSignedUrl } from '@/lib/utils'

interface ClaimCardProps {
  claim: InsuranceClaim
  linkedExpenses?: PetExpense[]
  onEdit: (claim: InsuranceClaim) => void
  onDelete: (id: string) => void
}

export function ClaimCard({ claim, linkedExpenses = [], onEdit, onDelete }: ClaimCardProps) {
  const totalLinkedExpenses = linkedExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{claim.title}</CardTitle>
              <ClaimStatusBadge status={claim.status} />
            </div>
            <CardDescription>
              {claim.claim_number && <span>#{claim.claim_number} • </span>}
              {claim.submitted_date
                ? `Submitted ${new Date(claim.submitted_date).toLocaleDateString()}`
                : 'Not yet submitted'}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(claim)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(claim.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {claim.description && (
          <p className="text-sm text-muted-foreground">
            {claim.description}
          </p>
        )}

        {/* Amount summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Claimed</p>
            <p className="font-semibold">${claim.claimed_amount.toFixed(2)}</p>
          </div>
          {claim.approved_amount !== null && (
            <div>
              <p className="text-muted-foreground">Approved</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ${claim.approved_amount.toFixed(2)}
              </p>
            </div>
          )}
          {claim.reimbursement_amount !== null && (
            <div>
              <p className="text-muted-foreground">Reimbursed</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                ${claim.reimbursement_amount.toFixed(2)}
              </p>
            </div>
          )}
          {linkedExpenses.length > 0 && (
            <div>
              <p className="text-muted-foreground">Linked Expenses</p>
              <p className="font-semibold">${totalLinkedExpenses.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Denial reason */}
        {claim.status === 'denied' && claim.denial_reason && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm">
            <p className="font-medium text-red-700 dark:text-red-300">Denial Reason:</p>
            <p className="text-red-600 dark:text-red-400">{claim.denial_reason}</p>
          </div>
        )}

        {/* Timeline */}
        {(claim.resolved_date || claim.reimbursement_date) && (
          <div className="text-xs text-muted-foreground space-y-1">
            {claim.resolved_date && (
              <p>Resolved: {new Date(claim.resolved_date).toLocaleDateString()}</p>
            )}
            {claim.reimbursement_date && (
              <p>Reimbursed: {new Date(claim.reimbursement_date).toLocaleDateString()}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {claim.notes && (
          <p className="text-sm text-muted-foreground italic">
            {claim.notes}
          </p>
        )}

        {/* Linked expenses */}
        {linkedExpenses.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              {linkedExpenses.length} linked expense{linkedExpenses.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {linkedExpenses.slice(0, 3).map((expense) => (
                <div
                  key={expense.id}
                  className="text-xs flex justify-between text-muted-foreground"
                >
                  <span className="truncate">{expense.title}</span>
                  <span>${expense.amount.toFixed(2)}</span>
                </div>
              ))}
              {linkedExpenses.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{linkedExpenses.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Document link */}
        {claim.claim_document_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPdfWithSignedUrl(claim.claim_document_url!)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Document
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for summaries
export function ClaimCardCompact({ claim, onEdit, onDelete }: Omit<ClaimCardProps, 'linkedExpenses'>) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{claim.title}</p>
            <ClaimStatusBadge status={claim.status} className="text-xs" />
          </div>
          <p className="text-xs text-muted-foreground">
            ${claim.claimed_amount.toFixed(2)} claimed
            {claim.reimbursement_amount !== null && (
              <> • ${claim.reimbursement_amount.toFixed(2)} reimbursed</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(claim)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(claim.id)}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
