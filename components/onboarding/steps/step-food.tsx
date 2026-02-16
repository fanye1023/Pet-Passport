'use client'

import { useState } from 'react'
import { Utensils } from 'lucide-react'
import { OnboardingStep } from '../onboarding-step'
import { FoodItemCard, type FoodFormData } from '@/components/food/food-item-card'
import { FoodInlineForm } from '@/components/food/food-inline-form'
import { createClient } from '@/lib/supabase/client'
import { getDefaultMealTimes } from '@/lib/constants'

interface StepFoodProps {
  petId: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

export function StepFood({ petId, onComplete, onSkip, onBack, isFirstStep }: StepFoodProps) {
  const [foods, setFoods] = useState<FoodFormData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddFood = (food: FoodFormData) => {
    setFoods((prev) => [...prev, food])
  }

  const handleRemoveFood = (index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (foods.length === 0) return

    setIsLoading(true)
    const supabase = createClient()

    const insertData = foods.map((food) => ({
      pet_id: petId,
      brand: food.brand,
      brand_domain: food.brandDomain || null,
      product_variant: food.productVariant || null,
      food_type: food.foodType,
      portion_size: food.portionSize || null,
      feeding_frequency: food.feedingFrequency || null,
      meal_times: food.feedingFrequency ? getDefaultMealTimes(food.feedingFrequency) : null,
    }))

    const { error } = await supabase.from('food_preferences').insert(insertData)

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={Utensils}
      title="Food & Diet"
      description="What does your pet eat? Add all foods, including treats and toppers."
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={foods.length > 0}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-4">
        {foods.length > 0 && (
          <div className="space-y-2">
            {foods.map((food, index) => (
              <FoodItemCard
                key={index}
                food={food}
                onRemove={() => handleRemoveFood(index)}
              />
            ))}
          </div>
        )}

        <FoodInlineForm onAdd={handleAddFood} />

        {foods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Add at least one food to continue, or skip this step.
          </p>
        )}
      </div>
    </OnboardingStep>
  )
}
