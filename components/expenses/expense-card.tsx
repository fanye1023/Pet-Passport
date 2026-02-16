'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PetExpense, ExpenseType } from '@/lib/types/pet'
import { Pencil, Trash2, FileText, ExternalLink, Link2 } from 'lucide-react'
import { Stethoscope, Pill, Scissors, Utensils, ShoppingBag, MoreHorizontal } from 'lucide-react'

const expenseTypeConfig: Record<ExpenseType, { label: string; icon: React.ElementType; color: string }> = {
  vet_visit: { label: 'Vet Visit', icon: Stethoscope, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
  medication: { label: 'Medication', icon: Pill, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
  grooming: { label: 'Grooming', icon: Scissors, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' },
  food: { label: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200' },
  supplies: { label: 'Supplies', icon: ShoppingBag, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200' },
}

interface ExpenseCardProps {
  expense: PetExpense
  onEdit: (expense: PetExpense) => void
  onDelete: (id: string) => void
  claimTitle?: string
}

export function ExpenseCard({ expense, onEdit, onDelete, claimTitle }: ExpenseCardProps) {
  const config = expenseTypeConfig[expense.expense_type]
  const Icon = config.icon

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{expense.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
              </div>
              <CardDescription>
                {new Date(expense.expense_date).toLocaleDateString()}
                {expense.vendor_name && ` • ${expense.vendor_name}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              ${expense.amount.toFixed(2)}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(expense)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {expense.description && (
          <p className="text-sm text-muted-foreground">
            {expense.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {expense.claim_id && claimTitle && (
            <Badge variant="outline" className="text-xs">
              <Link2 className="h-3 w-3 mr-1" />
              {claimTitle}
            </Badge>
          )}
          {expense.receipt_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(expense.receipt_url!, '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Receipt
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for lists
export function ExpenseCardCompact({ expense, onEdit, onDelete }: Omit<ExpenseCardProps, 'claimTitle'>) {
  const config = expenseTypeConfig[expense.expense_type]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{expense.title}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(expense.expense_date).toLocaleDateString()}
            {expense.vendor_name && ` • ${expense.vendor_name}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold">${expense.amount.toFixed(2)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(expense.id)}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
