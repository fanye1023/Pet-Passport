'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhotoUpload } from '@/components/pets/photo-upload'
import { Sparkles, ArrowRight, Dog, Cat, Rabbit } from 'lucide-react'
import Link from 'next/link'

const speciesOptions = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐈' },
  { value: 'other', label: 'Other', emoji: '🐾' },
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

export default function NewPetOnboardingPage() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [birthday, setBirthday] = useState('')
  const [microchipNumber, setMicrochipNumber] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showMoreFields, setShowMoreFields] = useState(false)

  // Breed autocomplete state
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false)
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([])
  const breedInputRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const supabase = createClient()

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
      ).slice(0, 6)
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
    setBreed('')
  }, [species])

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
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error(`Auth error: ${authError.message}`)
      if (!user) throw new Error('Not authenticated - please log in again')

      const { data, error } = await supabase
        .from('pets')
        .insert({ ...petData, user_id: user.id })
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      // Redirect to step-by-step onboarding
      router.push(`/onboarding/${data.id}`)
    } catch (err) {
      console.error('Pet form error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const getSpeciesIcon = () => {
    if (species === 'dog') return <Dog className="h-5 w-5" />
    if (species === 'cat') return <Cat className="h-5 w-5" />
    return <Rabbit className="h-5 w-5" />
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Welcome message */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Let&apos;s get started!</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Meet your new companion</h1>
        <p className="text-muted-foreground">
          Tell us about your furry friend
        </p>
      </div>

      {/* Form card */}
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Photo upload - centered and prominent */}
          <div className="flex justify-center">
            <PhotoUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              petId={undefined}
            />
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              What&apos;s their name? *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Buddy, Luna, Max..."
              required
              className="h-11 text-base"
              autoFocus
            />
          </div>

          {/* Species selection - fun buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">What kind of pet? *</Label>
            <div className="grid grid-cols-3 gap-2">
              {speciesOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSpecies(option.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    species === option.value
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Breed field - only show for dog/cat */}
          {(species === 'dog' || species === 'cat') && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="breed" className="text-sm font-medium">Breed</Label>
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
                  placeholder="Start typing to search..."
                  autoComplete="off"
                  className="h-10"
                />
                {showBreedSuggestions && breedSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-xl shadow-lg max-h-48 overflow-auto">
                    {breedSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => selectBreed(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toggle for more fields */}
          {!showMoreFields && (
            <button
              type="button"
              onClick={() => setShowMoreFields(true)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              + Add birthday & microchip (optional)
            </button>
          )}

          {/* Optional fields */}
          {showMoreFields && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-sm font-medium">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchip" className="text-sm font-medium">Microchip Number</Label>
                <Input
                  id="microchip"
                  value={microchipNumber}
                  onChange={(e) => setMicrochipNumber(e.target.value)}
                  placeholder="e.g., 123456789012345"
                  className="h-10"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading || !name || !species}
            className="w-full h-12 text-base font-semibold shadow-lg btn-press group"
          >
            {loading ? (
              'Creating profile...'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Skip link */}
      <div className="text-center mt-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip setup for now →
        </Link>
      </div>
    </div>
  )
}
