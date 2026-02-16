import { createClient } from '@/lib/supabase/client'
import type {
  PetCollaborator,
  PetInvitation,
  CollaboratorRole,
  InvitationPreview,
  UserProfile
} from '@/lib/types/pet'

// Generate a secure random token for invitations
export function generateInviteToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get the invite URL for sharing
export function getInviteUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || ''
  return `${baseUrl}/invite/${token}`
}

// Fetch collaborators for a pet
export async function getCollaborators(petId: string): Promise<PetCollaborator[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pet_collaborators')
    .select(`
      *,
      user_profile:user_profiles(*)
    `)
    .eq('pet_id', petId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching collaborators:', error)
    return []
  }

  return data || []
}

// Fetch pending invitations for a pet
export async function getPendingInvitations(petId: string): Promise<PetInvitation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pet_invitations')
    .select('*')
    .eq('pet_id', petId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }

  return data || []
}

// Create a new invitation
export async function createInvitation(
  petId: string,
  email: string,
  role: CollaboratorRole
): Promise<{ success: boolean; invitation?: PetInvitation; error?: string }> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user is already a collaborator
  const { data: existingCollaborator } = await supabase
    .from('pet_collaborators')
    .select('id')
    .eq('pet_id', petId)
    .eq('user_id', user.id)
    .single()

  // Check if there's already a pending invitation for this email
  const { data: existingInvitation } = await supabase
    .from('pet_invitations')
    .select('id')
    .eq('pet_id', petId)
    .ilike('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvitation) {
    return { success: false, error: 'An invitation has already been sent to this email' }
  }

  const token = generateInviteToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

  const { data, error } = await supabase
    .from('pet_invitations')
    .insert({
      pet_id: petId,
      email: email.toLowerCase(),
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    return { success: false, error: error.message }
  }

  return { success: true, invitation: data }
}

// Cancel an invitation
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pet_invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    console.error('Error canceling invitation:', error)
    return false
  }

  return true
}

// Remove a collaborator
export async function removeCollaborator(collaboratorId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pet_collaborators')
    .delete()
    .eq('id', collaboratorId)

  if (error) {
    console.error('Error removing collaborator:', error)
    return false
  }

  return true
}

// Update a collaborator's role
export async function updateCollaboratorRole(
  collaboratorId: string,
  newRole: CollaboratorRole
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pet_collaborators')
    .update({ role: newRole })
    .eq('id', collaboratorId)

  if (error) {
    console.error('Error updating collaborator role:', error)
    return false
  }

  return true
}

// Get invitation preview (for public invite page)
export async function getInvitationPreview(token: string): Promise<InvitationPreview> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_invitation_preview', { invitation_token: token })

  if (error) {
    console.error('Error fetching invitation preview:', error)
    return { valid: false, error: 'Failed to load invitation' }
  }

  return data as InvitationPreview
}

// Accept an invitation
export async function acceptInvitation(token: string): Promise<{ success: boolean; petId?: string; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('accept_pet_invitation', { invitation_token: token })

  if (error) {
    console.error('Error accepting invitation:', error)
    return { success: false, error: error.message }
  }

  // Transform snake_case from database to camelCase
  const result = data as { success: boolean; pet_id?: string; error?: string }
  return {
    success: result.success,
    petId: result.pet_id,
    error: result.error
  }
}

// Get current user's role for a pet
export async function getUserPetRole(petId: string): Promise<CollaboratorRole | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_user_pet_role', { pet_uuid: petId })

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data as CollaboratorRole | null
}

// Check if user has pending invitation (for auth callback)
export async function checkPendingInvitationForEmail(email: string): Promise<PetInvitation | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pet_invitations')
    .select('*')
    .ilike('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// Get or create user profile
export async function ensureUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Try to get existing profile
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingProfile) return existingProfile

  // Create profile if doesn't exist
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const { data: newProfile, error } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      display_name: displayName
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return newProfile
}

// Update user profile
export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>
): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

// Role display helpers
export const roleLabels: Record<CollaboratorRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer'
}

export const roleDescriptions: Record<CollaboratorRole, string> = {
  owner: 'Full access including managing collaborators',
  editor: 'Can view and edit all pet information',
  viewer: 'Can only view pet information'
}

export const roleColors: Record<CollaboratorRole, string> = {
  owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}
