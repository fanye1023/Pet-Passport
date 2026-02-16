'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UseCrudOptions<T> {
  table: string
  petId: string
  onSuccess?: () => void
  toastLabels?: {
    created?: string
    updated?: string
    deleted?: string
    createError?: string
    updateError?: string
    deleteError?: string
  }
}

export function useCrud<T extends { id: string }>({
  table,
  petId,
  onSuccess,
  toastLabels = {},
}: UseCrudOptions<T>) {
  const supabase = createClient()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)

  const labels = {
    created: toastLabels.created ?? 'Item added',
    updated: toastLabels.updated ?? 'Item updated',
    deleted: toastLabels.deleted ?? 'Item deleted',
    createError: toastLabels.createError ?? 'Failed to save',
    updateError: toastLabels.updateError ?? 'Failed to save',
    deleteError: toastLabels.deleteError ?? 'Failed to delete',
  }

  const load = async (
    query?: (q: ReturnType<ReturnType<typeof createClient>['from']>) => ReturnType<ReturnType<typeof createClient>['from']>
  ) => {
    let q = supabase.from(table).select('*').eq('pet_id', petId) as any
    if (query) q = query(q)
    const { data } = await q
    setItems(data || [])
    setLoading(false)
  }

  const save = async (
    data: Record<string, unknown>,
    resetForm: () => void
  ) => {
    setSaving(true)

    let error
    if (editingItem) {
      const result = await supabase.from(table).update(data).eq('id', editingItem.id)
      error = result.error
    } else {
      const result = await supabase.from(table).insert({ pet_id: petId, ...data })
      error = result.error
    }

    if (error) {
      toast.error(editingItem ? labels.updateError : labels.createError, {
        description: error.message,
      })
      setSaving(false)
      return false
    }

    toast.success(editingItem ? labels.updated : labels.created)
    resetForm()
    setDialogOpen(false)
    setEditingItem(null)
    setSaving(false)
    onSuccess?.()
    return true
  }

  const remove = async (id: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return false

    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error(labels.deleteError, { description: error.message })
      return false
    }

    toast.success(labels.deleted)
    onSuccess?.()
    return true
  }

  const openEdit = (item: T) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean, resetForm?: () => void) => {
    setDialogOpen(open)
    if (!open) {
      setEditingItem(null)
      resetForm?.()
    }
  }

  return {
    items,
    setItems,
    loading,
    saving,
    dialogOpen,
    setDialogOpen,
    editingItem,
    setEditingItem,
    load,
    save,
    remove,
    openEdit,
    handleDialogChange,
  }
}
