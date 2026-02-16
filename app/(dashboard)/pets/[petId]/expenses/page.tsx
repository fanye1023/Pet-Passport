'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Receipt, FileText, BarChart3 } from 'lucide-react'
import { PetExpense, InsuranceClaim, ExpenseType } from '@/lib/types/pet'
import { ExpenseDialog } from '@/components/expenses/expense-dialog'
import { ExpenseCard } from '@/components/expenses/expense-card'
import { ClaimDialog } from '@/components/expenses/claim-dialog'
import { ClaimCard } from '@/components/expenses/claim-card'
import { ExpenseSummary } from '@/components/expenses/expense-summary'
import { claimStatusOptions } from '@/components/expenses/claim-status-badge'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

const expenseTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'medication', label: 'Medication' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'food', label: 'Food' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
]

export default function ExpensesPage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [expenses, setExpenses] = useState<PetExpense[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PetExpense | null>(null)
  const [editingClaim, setEditingClaim] = useState<InsuranceClaim | null>(null)

  // Filter states
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('all')
  const [claimStatusFilter, setClaimStatusFilter] = useState('all')

  const loadData = useCallback(async () => {
    const [expensesResult, claimsResult] = await Promise.all([
      supabase
        .from('pet_expenses')
        .select('*')
        .eq('pet_id', petId)
        .order('expense_date', { ascending: false }),
      supabase
        .from('insurance_claims')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false }),
    ])

    if (expensesResult.error) {
      console.error('Error loading expenses:', expensesResult.error)
      toast.error('Failed to load expenses')
    } else {
      setExpenses(expensesResult.data || [])
    }

    if (claimsResult.error) {
      console.error('Error loading claims:', claimsResult.error)
      toast.error('Failed to load claims')
    } else {
      setClaims(claimsResult.data || [])
    }

    setLoading(false)
  }, [supabase, petId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    if (expenseTypeFilter !== 'all' && expense.expense_type !== expenseTypeFilter) {
      return false
    }
    return true
  })

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    if (claimStatusFilter !== 'all' && claim.status !== claimStatusFilter) {
      return false
    }
    return true
  })

  // Get linked expenses for a claim
  const getLinkedExpenses = (claimId: string) => {
    return expenses.filter((e) => e.claim_id === claimId)
  }

  // Get claim title by ID (for expense cards)
  const getClaimTitle = (claimId: string) => {
    const claim = claims.find((c) => c.id === claimId)
    return claim?.title
  }

  // Handlers
  const handleEditExpense = (expense: PetExpense) => {
    setEditingExpense(expense)
    setExpenseDialogOpen(true)
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    const { error } = await supabase.from('pet_expenses').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete expense', { description: error.message })
      return
    }
    toast.success('Expense deleted')
    loadData()
  }

  const handleEditClaim = (claim: InsuranceClaim) => {
    setEditingClaim(claim)
    setClaimDialogOpen(true)
  }

  const handleDeleteClaim = async (id: string) => {
    if (!confirm('Are you sure you want to delete this claim? Linked expenses will be unlinked but not deleted.')) return
    const { error } = await supabase.from('insurance_claims').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete claim', { description: error.message })
      return
    }
    toast.success('Claim deleted')
    loadData()
  }

  const handleExpenseDialogClose = (open: boolean) => {
    setExpenseDialogOpen(open)
    if (!open) {
      setEditingExpense(null)
    }
  }

  const handleClaimDialogClose = (open: boolean) => {
    setClaimDialogOpen(open)
    if (!open) {
      setEditingClaim(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Expenses & Claims</h2>
          <p className="text-sm text-muted-foreground">
            Track spending and manage insurance reimbursements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setClaimDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            File Claim
          </Button>
          <Button onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ExpenseDialog
        petId={petId}
        open={expenseDialogOpen}
        onOpenChange={handleExpenseDialogClose}
        expense={editingExpense}
        claims={claims}
        onSaved={loadData}
      />

      <ClaimDialog
        petId={petId}
        open={claimDialogOpen}
        onOpenChange={handleClaimDialogClose}
        claim={editingClaim}
        onSaved={loadData}
      />

      {loading ? (
        <div className="space-y-3">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </div>
      ) : (
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
              {expenses.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {expenses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Claims</span>
              {claims.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {claims.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            {expenses.length > 0 && (
              <div className="flex items-center justify-between">
                <Select value={expenseTypeFilter} onValueChange={setExpenseTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                  {expenseTypeFilter !== 'all' && ' (filtered)'}
                </p>
              </div>
            )}

            {filteredExpenses.length === 0 ? (
              expenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses yet"
                  description="Track your pet care spending by adding expenses"
                  action={
                    <Button onClick={() => setExpenseDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No matching expenses"
                  description="Try adjusting your filter to see more expenses"
                  action={
                    <Button variant="outline" onClick={() => setExpenseTypeFilter('all')}>
                      Clear Filter
                    </Button>
                  }
                />
              )
            ) : (
              <div className="space-y-3 animate-stagger">
                {filteredExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    claimTitle={expense.claim_id ? getClaimTitle(expense.claim_id) : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            {claims.length > 0 && (
              <div className="flex items-center justify-between">
                <Select value={claimStatusFilter} onValueChange={setClaimStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {claimStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''}
                  {claimStatusFilter !== 'all' && ' (filtered)'}
                </p>
              </div>
            )}

            {filteredClaims.length === 0 ? (
              claims.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No insurance claims"
                  description="File a claim to track your insurance reimbursements"
                  action={
                    <Button onClick={() => setClaimDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      File First Claim
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No matching claims"
                  description="Try adjusting your filter to see more claims"
                  action={
                    <Button variant="outline" onClick={() => setClaimStatusFilter('all')}>
                      Clear Filter
                    </Button>
                  }
                />
              )
            ) : (
              <div className="space-y-3 animate-stagger">
                {filteredClaims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    linkedExpenses={getLinkedExpenses(claim.id)}
                    onEdit={handleEditClaim}
                    onDelete={handleDeleteClaim}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary">
            {expenses.length === 0 && claims.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No data yet"
                description="Add expenses and file claims to see your spending summary"
                action={
                  <Button onClick={() => setExpenseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                }
              />
            ) : (
              <ExpenseSummary expenses={expenses} claims={claims} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
