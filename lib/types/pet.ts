export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  breed: string | null
  birthday: string | null
  photo_url: string | null
  microchip_number: string | null
  created_at: string
  updated_at: string
}

export interface Vaccination {
  id: string
  pet_id: string
  vaccine_name: string
  administered_date: string
  expiration_date: string | null
  veterinarian: string | null
  document_url: string | null
  notes: string | null
  created_at: string
}

export interface HealthRecord {
  id: string
  pet_id: string
  record_type: 'checkup' | 'surgery' | 'treatment' | 'allergy' | 'condition'
  title: string
  description: string | null
  record_date: string
  document_url: string | null
  veterinarian: string | null
  created_at: string
}

export interface PetInsurance {
  id: string
  pet_id: string
  provider_name: string
  policy_number: string | null
  coverage_type: string | null
  start_date: string | null
  end_date: string | null
  contact_phone: string | null
  contact_email: string | null
  document_url: string | null
  deductible: string | null
  annual_limit: string | null
  reimbursement_rate: string | null
  covered_services: string[] | null
  excluded_services: string[] | null
  preventative_care: string[] | null
  waiting_periods: string | null
  notes: string | null
  created_at: string
}

export interface Veterinarian {
  id: string
  pet_id: string
  name: string
  clinic_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_primary: boolean
  notes: string | null
  created_at: string
}

export type EmergencyContactType = 'owner' | 'family' | 'friend' | 'neighbor' | 'pet_sitter' | 'veterinarian' | 'other'

export interface EmergencyContact {
  id: string
  pet_id: string
  name: string
  relationship: string | null
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  contact_type: EmergencyContactType
  is_primary: boolean
  created_at: string
}

export interface FoodPreferences {
  id: string
  pet_id: string
  brand: string | null
  brand_domain: string | null
  product_variant: string | null
  food_type: 'dry' | 'wet' | 'raw' | 'homemade' | 'treat' | null
  portion_size: string | null
  feeding_frequency: 'Once daily' | 'Twice daily' | 'Three times daily' | 'Free feeding' | null
  meal_times: string[] | null
  allergies: string[] | null
  treats: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DailyRoutine {
  id: string
  pet_id: string
  routine_type: 'walk' | 'feeding' | 'medication' | 'play' | 'sleep'
  time_of_day: string | null
  duration_minutes: number | null
  description: string | null
  days_of_week: string[] | null
  notes: string | null
  created_at: string
}

export interface PetDocument {
  id: string
  pet_id: string
  category: 'vaccination' | 'health' | 'insurance' | 'other'
  name: string
  document_url: string
  notes: string | null
  uploaded_at: string
}

export interface CareInstructions {
  id: string
  pet_id: string
  house_access: string | null
  food_storage: string | null
  supplies_location: string | null
  wifi_and_alarm: string | null
  other_notes: string | null
  created_at: string
  updated_at: string
}

export interface BehavioralNotes {
  id: string
  pet_id: string
  known_commands: string | null
  fears_and_triggers: string | null
  socialization: string | null
  temperament: string | null
  additional_notes: string | null
  created_at: string
  updated_at: string
}

export interface SharePinRequired {
  pin_required: true
  pet_name: string
  pet_photo_url: string | null
}

export interface ShareLink {
  id: string
  pet_id: string
  token: string
  name: string | null
  expires_at: string | null
  is_active: boolean
  view_count: number
  last_viewed_at: string | null
  show_vaccinations: boolean
  show_health_records: boolean
  show_insurance: boolean
  show_vet_info: boolean
  show_emergency_contacts: boolean
  show_food: boolean
  show_routines: boolean
  show_care_instructions: boolean
  show_behavioral_notes: boolean
  pin_hash: string | null
  created_at: string
}

export interface ShareVisibility {
  vaccinations: boolean
  health_records: boolean
  insurance: boolean
  vet_info: boolean
  emergency_contacts: boolean
  food: boolean
  routines: boolean
  care_instructions: boolean
  behavioral_notes: boolean
}

// Care Calendar Types
export type CareEventType = 'vet_appointment' | 'grooming' | 'medication' | 'vaccination'
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface CareEvent {
  id: string
  pet_id: string
  event_type: CareEventType
  title: string
  description: string | null
  event_date: string | null
  event_time: string | null
  is_recurring: boolean
  recurrence_pattern: RecurrencePattern | null
  recurrence_day_of_month: number | null
  recurrence_day_of_week: string | null
  recurrence_start_date: string | null
  recurrence_end_date: string | null
  location: string | null
  veterinarian_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CalendarOccurrence {
  id: string
  event: CareEvent
  date: Date
  isRecurring: boolean
}

export interface SharedPetData {
  pet: Pet
  vaccinations: Vaccination[]
  health_records: HealthRecord[]
  insurance: PetInsurance | null
  veterinarians: Veterinarian[]
  emergency_contacts: EmergencyContact[]
  food_preferences: FoodPreferences | FoodPreferences[] | null
  daily_routines: DailyRoutine[]
  documents: PetDocument[]
  care_instructions: CareInstructions | null
  behavioral_notes: BehavioralNotes | null
  visibility: ShareVisibility
}

// Collaborative Access Types
export type CollaboratorRole = 'owner' | 'editor' | 'viewer'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface PetCollaborator {
  id: string
  pet_id: string
  user_id: string
  role: CollaboratorRole
  invited_by: string | null
  accepted_at: string
  created_at: string
  user_profile?: UserProfile
}

export interface PetInvitation {
  id: string
  pet_id: string
  email: string
  role: CollaboratorRole
  token: string
  status: InvitationStatus
  invited_by: string
  expires_at: string
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  pet_id: string
  user_id: string | null
  action: 'created' | 'updated' | 'deleted'
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user_profile?: UserProfile
  pet?: Pet
}

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface InvitationPreview {
  valid: boolean
  error?: string
  email?: string
  role?: CollaboratorRole
  expires_at?: string
  pet?: {
    id: string
    name: string
    species: string
    breed: string | null
    photo_url: string | null
  }
  inviter?: {
    display_name: string
    avatar_url: string | null
  }
}

// Pet with collaborator role for dashboard
export interface PetWithRole extends Pet {
  role: CollaboratorRole
}

// Aggregate alert types for multi-pet dashboard
export type AlertType = 'expiring' | 'expired' | 'upcoming_appointment'

export interface AggregateAlert {
  type: AlertType
  count: number
  pets: Array<{
    pet: Pet
    items: Array<{
      id: string
      name: string
      date: string
    }>
  }>
}

// Expense and Insurance Claim Types
export type ExpenseType = 'vet_visit' | 'medication' | 'grooming' | 'food' | 'supplies' | 'other'
export type ClaimStatus = 'not_submitted' | 'submitted' | 'pending' | 'approved' | 'denied' | 'paid'

export interface PetExpense {
  id: string
  pet_id: string
  expense_type: ExpenseType
  title: string
  description: string | null
  amount: number
  expense_date: string
  vendor_name: string | null
  receipt_url: string | null
  claim_id: string | null
  created_at: string
  updated_at: string
}

export interface InsuranceClaim {
  id: string
  pet_id: string
  claim_number: string | null
  title: string
  description: string | null
  status: ClaimStatus
  submitted_date: string | null
  resolved_date: string | null
  claimed_amount: number
  approved_amount: number | null
  reimbursement_amount: number | null
  reimbursement_date: string | null
  claim_document_url: string | null
  notes: string | null
  denial_reason: string | null
  created_at: string
  updated_at: string
}

// Calendar Feed Token
export interface CalendarFeedToken {
  id: string
  user_id: string
  token: string
  name: string | null
  pet_id: string | null
  is_active: boolean
  created_at: string
  last_accessed_at: string | null
}

// Subscription Types
export type SubscriptionTier = 'free' | 'premium'

export interface UserSubscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  started_at: string
  expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

// Free tier limits
export const FREE_TIER_LIMITS = {
  maxPets: 1,
  maxShareLinks: 3,
  maxCollaborators: 2,
  calendarSync: false,
  smsReminders: false,
} as const

export const PREMIUM_FEATURES = {
  maxPets: Infinity,
  maxShareLinks: Infinity,
  maxCollaborators: Infinity,
  calendarSync: true,
  smsReminders: true,
} as const
