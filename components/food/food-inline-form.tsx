'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BrandAutocomplete } from './brand-autocomplete'
import { foodTypes, feedingFrequencyOptions } from '@/lib/constants'
import type { FoodFormData } from './food-item-card'

interface FoodInlineFormProps {
  onAdd: (food: FoodFormData) => void
}

export function FoodInlineForm({ onAdd }: FoodInlineFormProps) {
  const [brand, setBrand] = useState('')
  const [brandDomain, setBrandDomain] = useState('')
  const [productVariant, setProductVariant] = useState('')
  const [foodType, setFoodType] = useState('')
  const [portionSize, setPortionSize] = useState('')
  const [feedingFrequency, setFeedingFrequency] = useState('')

  const canAdd = brand.trim().length > 0 && foodType.length > 0

  const handleAdd = () => {
    if (!canAdd) return

    onAdd({
      brand: brand.trim(),
      brandDomain,
      productVariant: productVariant.trim(),
      foodType,
      portionSize: portionSize.trim(),
      feedingFrequency,
    })

    // Reset form
    setBrand('')
    setBrandDomain('')
    setProductVariant('')
    setFoodType('')
    setPortionSize('')
    setFeedingFrequency('')
  }

  const handleBrandChange = (newBrand: string, newDomain: string) => {
    setBrand(newBrand)
    setBrandDomain(newDomain)
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
      <div className="space-y-2">
        <Label>Brand *</Label>
        <BrandAutocomplete
          value={brand}
          domain={brandDomain}
          onChange={handleBrandChange}
          placeholder="Search pet food brands..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="variant">Product/Variant</Label>
          <Input
            id="variant"
            placeholder="e.g., Chicken & Rice"
            value={productVariant}
            onChange={(e) => setProductVariant(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Food Type *</Label>
          <Select value={foodType} onValueChange={setFoodType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {foodTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="portion">Portion Size</Label>
          <Input
            id="portion"
            placeholder="e.g., 1 cup, 200g"
            value={portionSize}
            onChange={(e) => setPortionSize(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Feeding Frequency</Label>
          <Select value={feedingFrequency} onValueChange={setFeedingFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              {feedingFrequencyOptions.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          <Plus className="h-4 w-4" />
          Add Food
        </Button>
      </div>
    </div>
  )
}
