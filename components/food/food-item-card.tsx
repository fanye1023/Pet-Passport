'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandLogo } from './brand-logo'

export interface FoodFormData {
  brand: string
  brandDomain: string
  productVariant: string
  foodType: string
  portionSize: string
  feedingFrequency: string
}

interface FoodItemCardProps {
  food: FoodFormData
  onRemove: () => void
}

const foodTypeLabels: Record<string, string> = {
  dry: 'Dry',
  wet: 'Wet',
  raw: 'Raw',
  homemade: 'Homemade',
  treat: 'Treat',
}

export function FoodItemCard({ food, onRemove }: FoodItemCardProps) {
  const displayName = food.productVariant
    ? `${food.brand} ${food.productVariant}`
    : food.brand

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      {food.brandDomain && (
        <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
          <BrandLogo
            domain={food.brandDomain}
            brandName={food.brand}
            size={24}
            className="object-contain"
          />
        </div>
      )}
      {!food.brandDomain && (
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            {food.brand.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {food.foodType && (
            <Badge variant="secondary" className="text-xs">
              {foodTypeLabels[food.foodType] || food.foodType}
            </Badge>
          )}
          {food.portionSize && (
            <span className="text-xs text-muted-foreground">{food.portionSize}</span>
          )}
          {food.feedingFrequency && (
            <span className="text-xs text-muted-foreground">{food.feedingFrequency}</span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
