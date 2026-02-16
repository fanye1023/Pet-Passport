'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchBrands, getBrandLogoUrl, PetFoodBrand } from '@/lib/data/pet-food-brands'
import { Check, Search } from 'lucide-react'
import Image from 'next/image'

interface BrandAutocompleteProps {
  value: string
  domain: string
  onChange: (brand: string, domain: string) => void
  placeholder?: string
}

export function BrandAutocomplete({
  value,
  domain,
  onChange,
  placeholder = 'Search pet food brands...'
}: BrandAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const [results, setResults] = useState<PetFoodBrand[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearch(value)
  }, [value])

  useEffect(() => {
    if (search.length > 0) {
      const matches = searchBrands(search)
      setResults(matches.slice(0, 8))
    } else {
      setResults([])
    }
  }, [search])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (brand: PetFoodBrand) => {
    setSearch(brand.name)
    onChange(brand.name, brand.domain)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearch(newValue)
    setOpen(true)
    // If typing custom brand, clear domain
    onChange(newValue, '')
  }

  const handleFocus = () => {
    // Only open dropdown if there's text to search
    if (search.length > 0) {
      setOpen(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {open && search.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => handleSelect(brand)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src={getBrandLogoUrl(brand.domain)}
                      alt={brand.name}
                      width={24}
                      height={24}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">{brand.name}</span>
                  {value === brand.name && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                <p>No brands found</p>
                <p className="text-xs mt-1">You can still use &quot;{search}&quot; as a custom brand</p>
              </div>
            )}
          </div>
          {search && !results.find(r => r.name.toLowerCase() === search.toLowerCase()) && (
            <div className="border-t px-3 py-2 bg-muted/50">
              <button
                type="button"
                onClick={() => {
                  onChange(search, '')
                  setOpen(false)
                }}
                className="w-full text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Use &quot;{search}&quot; as custom brand
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
