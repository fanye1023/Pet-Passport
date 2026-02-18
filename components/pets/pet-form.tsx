'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhotoUpload } from './photo-upload'
import { Pet } from '@/lib/types/pet'

interface PetFormProps {
  pet?: Pet
}

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'other', label: 'Other' },
]

const DOG_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'German Shorthaired Pointer',
  'Dachshund', 'Pembroke Welsh Corgi', 'Australian Shepherd', 'Yorkshire Terrier',
  'Boxer', 'Cavalier King Charles Spaniel', 'Doberman Pinscher', 'Great Dane',
  'Miniature Schnauzer', 'Siberian Husky', 'Shih Tzu', 'Boston Terrier',
  'Bernese Mountain Dog', 'Pomeranian', 'Havanese', 'Shetland Sheepdog',
  'Brittany', 'English Springer Spaniel', 'Cocker Spaniel', 'Border Collie',
  'Chihuahua', 'Vizsla', 'Pug', 'Maltese', 'Weimaraner', 'Collie',
  'Basset Hound', 'Newfoundland', 'Rhodesian Ridgeback', 'West Highland White Terrier',
  'Bichon Frise', 'Shiba Inu', 'Akita', 'Belgian Malinois', 'Bloodhound',
  'Saint Bernard', 'Papillon', 'Australian Cattle Dog', 'Bullmastiff',
  'Samoyed', 'Whippet', 'Mixed Breed',
]

const CAT_BREEDS = [
  'Domestic Shorthair', 'Domestic Longhair', 'Persian', 'Maine Coon',
  'Ragdoll', 'British Shorthair', 'Abyssinian', 'Siamese', 'Scottish Fold',
  'Sphynx', 'Bengal', 'Russian Blue', 'Birman', 'Oriental Shorthair',
  'Devon Rex', 'American Shorthair', 'Norwegian Forest Cat', 'Exotic Shorthair',
  'Burmese', 'Cornish Rex', 'Tonkinese', 'Himalayan', 'Ragamuffin',
  'Turkish Angora', 'Somali', 'Manx', 'Japanese Bobtail', 'Balinese',
  'Chartreux', 'Ocicat', 'Bombay', 'Savannah', 'Mixed Breed',
]

export function PetForm({ pet }: PetFormProps) {
  const [name, setName] = useState(pet?.name ?? '')
  const [species, setSpecies] = useState(pet?.species ?? '')
  const [breed, setBreed] = useState(pet?.breed ?? '')
  const [birthday, setBirthday] = useState(pet?.birthday ?? '')
  const [microchipNumber, setMicrochipNumber] = useState(pet?.microchip_number ?? '')
  const [photoUrl, setPhotoUrl] = useState(pet?.photo_url ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Breed autocomplete state
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false)
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([])
  const breedInputRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!pet

  // Get breeds based on species
  const getBreeds = () => {
    if (species === 'dog') return DOG_BREEDS
    if (species === 'cat') return CAT_BREEDS
    return []
  }

  // Filter breeds based on input
  const handleBreedChange = (value: string) => {
    setBreed(value)
    const breeds = getBreeds()
    if (value.length > 0 && breeds.length > 0) {
      const filtered = breeds.filter(b =>
        b.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8)
      setBreedSuggestions(filtered)
      setShowBreedSuggestions(filtered.length > 0)
    } else {
      setBreedSuggestions([])
      setShowBreedSuggestions(false)
    }
  }

  // Select a breed from suggestions
  const selectBreed = (selectedBreed: string) => {
    setBreed(selectedBreed)
    setShowBreedSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (breedInputRef.current && !breedInputRef.current.contains(event.target as Node)) {
        setShowBreedSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear breed when species changes
  useEffect(() => {
    if (!isEditing) {
      setBreed('')
    }
  }, [species, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const petData = {
      name,
      species,
      breed: breed || null,
      birthday: birthday || null,
      microchip_number: microchipNumber || null,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', pet.id)

        if (error) throw error
        router.push(`/pets/${pet.id}`)
      } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('Auth result:', { user, authError })
        if (authError) throw new Error(`Auth error: ${authError.message}`)
        if (!user) throw new Error('Not authenticated - please log in again')

        const { data, error } = await supabase
          .from('pets')
          .insert({ ...petData, user_id: user.id })
          .select()
          .single()

        console.log('Insert result:', { data, error })
        if (error) throw new Error(`Database error: ${error.message}`)
        // Redirect to onboarding for new pets
        router.push(`/onboarding/${data.id}`)
      }
      router.refresh()
    } catch (err) {
      console.error('Pet form error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Pet' : 'Add New Pet'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <PhotoUpload
            value={photoUrl}
            onChange={setPhotoUrl}
            petId={pet?.id}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Buddy"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select value={species} onValueChange={setSpecies} required>
                <SelectTrigger id="species">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <div className="relative" ref={breedInputRef}>
                <Input
                  id="breed"
                  value={breed}
                  onChange={(e) => handleBreedChange(e.target.value)}
                  onFocus={() => {
                    if (breed.length > 0 && breedSuggestions.length > 0) {
                      setShowBreedSuggestions(true)
                    }
                  }}
                  placeholder={species === 'dog' || species === 'cat' ? 'Start typing to search...' : 'Enter breed'}
                  autoComplete="off"
                />
                {showBreedSuggestions && breedSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                    {breedSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => selectBreed(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="microchip">Microchip Number</Label>
              <Input
                id="microchip"
                value={microchipNumber}
                onChange={(e) => setMicrochipNumber(e.target.value)}
                placeholder="e.g., 123456789012345"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button type="submit" disabled={loading || !name || !species}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Pet'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
