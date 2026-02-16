'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PetExpense, InsuranceClaim, ExpenseType } from '@/lib/types/pet'
import { DollarSign, TrendingUp, Receipt, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Stethoscope, Pill, Scissors, Utensils, ShoppingBag, MoreHorizontal } from 'lucide-react'

const expenseTypeConfig: Record<ExpenseType, { label: string; icon: React.ElementType; color: string }> = {
  vet_visit: { label: 'Vet Visits', icon: Stethoscope, color: 'bg-blue-500' },
  medication: { label: 'Medication', icon: Pill, color: 'bg-purple-500' },
  grooming: { label: 'Grooming', icon: Scissors, color: 'bg-pink-500' },
  food: { label: 'Food', icon: Utensils, color: 'bg-orange-500' },
  supplies: { label: 'Supplies', icon: ShoppingBag, color: 'bg-teal-500' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-gray-500' },
}

interface ExpenseSummaryProps {
  expenses: PetExpense[]
  claims: InsuranceClaim[]
}

export function ExpenseSummary({ expenses, claims }: ExpenseSummaryProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)

    // Expense totals
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const thisMonthExpenses = expenses
      .filter((e) => new Date(e.expense_date) >= thisMonth)
      .reduce((sum, e) => sum + e.amount, 0)
    const thisYearExpenses = expenses
      .filter((e) => new Date(e.expense_date) >= thisYear)
      .reduce((sum, e) => sum + e.amount, 0)

    // By expense type
    const byType = Object.entries(
      expenses.reduce((acc, e) => {
        acc[e.expense_type] = (acc[e.expense_type] || 0) + e.amount
        return acc
      }, {} as Record<ExpenseType, number>)
    )
      .map(([type, amount]) => ({
        type: type as ExpenseType,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Claims summary
    const totalClaimed = claims.reduce((sum, c) => sum + c.claimed_amount, 0)
    const totalApproved = claims.reduce((sum, c) => sum + (c.approved_amount || 0), 0)
    const totalReimbursed = claims.reduce((sum, c) => sum + (c.reimbursement_amount || 0), 0)
    const pendingClaims = claims.filter((c) => c.status === 'submitted' || c.status === 'pending')
    const pendingAmount = pendingClaims.reduce((sum, c) => sum + c.claimed_amount, 0)

    // Reimbursement rate
    const reimbursementRate = totalClaimed > 0 ? (totalReimbursed / totalClaimed) * 100 : 0

    return {
      totalExpenses,
      thisMonthExpenses,
      thisYearExpenses,
      byType,
      totalClaimed,
      totalApproved,
      totalReimbursed,
      pendingClaims: pendingClaims.length,
      pendingAmount,
      reimbursementRate,
      approvedClaims: claims.filter((c) => c.status === 'approved').length,
      paidClaims: claims.filter((c) => c.status === 'paid').length,
      deniedClaims: claims.filter((c) => c.status === 'denied').length,
    }
  }, [expenses, claims])

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time ({expenses.length} expenses)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonthExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Year to date: ${stats.thisYearExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reimbursed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${stats.totalReimbursed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.reimbursementRate.toFixed(0)}% reimbursement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pendingClaims}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.pendingAmount.toFixed(2)} awaiting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category */}
      {stats.byType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <CardDescription>Breakdown of expenses by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byType.map(({ type, amount, percentage }) => {
                const config = expenseTypeConfig[type]
                const Icon = config.icon
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{config.label}</span>
                      </div>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${config.color} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insurance Claims Overview</CardTitle>
          <CardDescription>Summary of all insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Claimed</span>
              </div>
              <p className="text-xl font-semibold">${stats.totalClaimed.toFixed(2)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Approved</span>
              </div>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                ${stats.totalApproved.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.approvedClaims + stats.paidClaims} claim{stats.approvedClaims + stats.paidClaims !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Paid Out</span>
              </div>
              <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                ${stats.totalReimbursed.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.paidClaims} claim{stats.paidClaims !== 1 ? 's' : ''} paid
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Denied</span>
              </div>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {stats.deniedClaims}
              </p>
              <p className="text-xs text-muted-foreground">
                claim{stats.deniedClaims !== 1 ? 's' : ''} denied
              </p>
            </div>
          </div>

          {/* Net cost calculation */}
          {stats.totalExpenses > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Net Cost (After Reimbursements)</p>
                  <p className="text-xs text-muted-foreground">
                    Total expenses minus insurance payouts
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  ${(stats.totalExpenses - stats.totalReimbursed).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
