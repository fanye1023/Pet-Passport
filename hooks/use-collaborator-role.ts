'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CollaboratorRole } from '@/lib/types/pet'

interface UseCollaboratorRoleResult {
  role: CollaboratorRole | null
  isLoading: boolean
  isOwner: boolean
  isEditor: boolean
  isViewer: boolean
  canEdit: boolean
  canManageCollaborators: boolean
  refetch: () => Promise<void>
}

export function useCollaboratorRole(petId: string | null): UseCollaboratorRoleResult {
  const [role, setRole] = useState<CollaboratorRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRole = async () => {
    if (!petId) {
      setRole(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .rpc('get_user_pet_role', { pet_uuid: petId })

      if (error) {
        console.error('Error fetching role:', error)
        setRole(null)
      } else {
        setRole(data as CollaboratorRole | null)
      }
    } catch (err) {
      console.error('Error fetching role:', err)
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [petId])

  const isOwner = role === 'owner'
  const isEditor = role === 'editor'
  const isViewer = role === 'viewer'
  const canEdit = role === 'owner' || role === 'editor'
  const canManageCollaborators = role === 'owner'

  return {
    role,
    isLoading,
    isOwner,
    isEditor,
    isViewer,
    canEdit,
    canManageCollaborators,
    refetch: fetchRole
  }
}
