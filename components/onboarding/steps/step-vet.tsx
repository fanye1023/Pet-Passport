'use client'

import { useState, useRef, useEffect } from 'react'
import { Stethoscope, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'

interface StepVetProps {
  petId: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

interface PlaceResult {
  place_id: string
  name: string
  address: string
}

export function StepVet({ petId, onComplete, onSkip, onBack, isFirstStep }: StepVetProps) {
  const [clinicName, setClinicName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Places search state
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for clinics when typing
  const handleClinicNameChange = (value: string) => {
    setClinicName(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only search if we have at least 3 characters
    if (value.length >= 3) {
      setSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/places/search?query=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (data.results) {
            setSearchResults(data.results)
            setShowDropdown(true)
          }
        } catch (error) {
          console.error('Error searching places:', error)
        } finally {
          setSearching(false)
        }
      }, 300)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  // Select a place and fetch its details
  const handleSelectPlace = async (place: PlaceResult) => {
    setClinicName(place.name)
    setAddress(place.address)
    setShowDropdown(false)
    setFetchingDetails(true)

    try {
      const response = await fetch(`/api/places/details?place_id=${place.place_id}`)
      const data = await response.json()
      if (data.phone) setPhone(data.phone)
    } catch (error) {
      console.error('Error fetching place details:', error)
    } finally {
      setFetchingDetails(false)
    }
  }

  const handleSave = async () => {
    if (!clinicName.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('veterinarians').insert({
      pet_id: petId,
      clinic_name: clinicName.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      is_primary: true,
    })

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={Stethoscope}
      title="Add Your Primary Vet"
      description="Where does your pet go for checkups?"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={clinicName.trim().length > 0}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinic">Clinic Name *</Label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Input
                id="clinic"
                placeholder="Search for vet clinic..."
                value={clinicName}
                onChange={(e) => handleClinicNameChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              />
              {(searching || fetchingDetails) && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                    onClick={() => handleSelectPlace(place)}
                  >
                    <div className="font-medium text-sm">{place.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{place.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Type to search and auto-fill clinic details
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {address && (
          <p className="text-sm text-muted-foreground">{address}</p>
        )}
      </div>
    </OnboardingStep>
  )
}
