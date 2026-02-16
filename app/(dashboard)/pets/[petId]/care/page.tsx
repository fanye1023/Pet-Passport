'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Utensils, Clock, Trash2, Pencil, ShoppingCart, ArrowRight } from 'lucide-react'
import { FoodPreferences, DailyRoutine } from '@/lib/types/pet'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { BrandAutocomplete } from '@/components/food/brand-autocomplete'
import { BrandLogo } from '@/components/food/brand-logo'
import { EmptyState } from '@/components/ui/empty-state'
import {
  foodTypes,
  feedingFrequencyOptions,
  getDefaultMealTimes,
  routineTypes,
  daysOfWeek,
  timeOfDayOptions,
  getAmazonSearchUrl,
  getChewySearchUrl,
  getPetcoSearchUrl,
  getPetSmartSearchUrl,
} from '@/lib/constants'

export default function CarePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const petId = params.petId as string
  const supabase = createClient()

  const defaultTab = searchParams.get('tab') || 'food'
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Food state
  const [foods, setFoods] = useState<FoodPreferences[]>([])
  const [foodLoading, setFoodLoading] = useState(true)
  const [foodDialogOpen, setFoodDialogOpen] = useState(false)
  const [savingFood, setSavingFood] = useState(false)
  const [deleteFoodDialogOpen, setDeleteFoodDialogOpen] = useState(false)
  const [foodToDelete, setFoodToDelete] = useState<FoodPreferences | null>(null)
  const [editingFood, setEditingFood] = useState<FoodPreferences | null>(null)
  const [brand, setBrand] = useState('')
  const [brandDomain, setBrandDomain] = useState('')
  const [productVariant, setProductVariant] = useState('')
  const [foodType, setFoodType] = useState('')
  const [portionSize, setPortionSize] = useState('')
  const [feedingFrequency, setFeedingFrequency] = useState('')
  const [mealTimes, setMealTimes] = useState<string[]>([])
  const [foodNotes, setFoodNotes] = useState('')

  // Routine state
  const [routines, setRoutines] = useState<DailyRoutine[]>([])
  const [routineLoading, setRoutineLoading] = useState(true)
  const [routineDialogOpen, setRoutineDialogOpen] = useState(false)
  const [savingRoutine, setSavingRoutine] = useState(false)
  const [deleteRoutineDialogOpen, setDeleteRoutineDialogOpen] = useState(false)
  const [routineToDelete, setRoutineToDelete] = useState<DailyRoutine | null>(null)
  const [editingRoutine, setEditingRoutine] = useState<DailyRoutine | null>(null)
  const [routineType, setRoutineType] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [routineDescription, setRoutineDescription] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [routineNotes, setRoutineNotes] = useState('')

  useEffect(() => {
    loadFoods()
    loadRoutines()
  }, [petId])

  // Food functions
  const loadFoods = async () => {
    const { data } = await supabase
      .from('food_preferences')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
    setFoods(data || [])
    setFoodLoading(false)
  }

  const resetFoodForm = () => {
    setEditingFood(null)
    setBrand('')
    setBrandDomain('')
    setProductVariant('')
    setFoodType('')
    setPortionSize('')
    setFeedingFrequency('')
    setMealTimes([])
    setFoodNotes('')
  }

  const openEditFoodDialog = (food: FoodPreferences) => {
    setEditingFood(food)
    setBrand(food.brand || '')
    setBrandDomain(food.brand_domain || '')
    setProductVariant(food.product_variant || '')
    setFoodType(food.food_type || '')
    setPortionSize(food.portion_size || '')
    setFeedingFrequency(food.feeding_frequency || '')
    setMealTimes(food.meal_times || [])
    setFoodNotes(food.notes || '')
    setFoodDialogOpen(true)
  }

  const handleFeedingFrequencyChange = (value: string) => {
    setFeedingFrequency(value)
    setMealTimes(getDefaultMealTimes(value))
  }

  const handleMealTimeChange = (index: number, value: string) => {
    setMealTimes(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleFoodDialogChange = (open: boolean) => {
    setFoodDialogOpen(open)
    if (!open) resetFoodForm()
  }

  const handleBrandChange = (newBrand: string, newDomain: string) => {
    setBrand(newBrand)
    setBrandDomain(newDomain)
  }

  const handleSaveFood = async () => {
    setSavingFood(true)
    const foodData = {
      brand: brand || null,
      brand_domain: brandDomain || null,
      product_variant: productVariant || null,
      food_type: foodType || null,
      portion_size: portionSize || null,
      feeding_frequency: feedingFrequency || null,
      meal_times: mealTimes.length > 0 ? mealTimes : null,
      notes: foodNotes || null,
    }

    let error
    if (editingFood) {
      const result = await supabase.from('food_preferences').update(foodData).eq('id', editingFood.id)
      error = result.error
    } else {
      const result = await supabase.from('food_preferences').insert({ pet_id: petId, ...foodData })
      error = result.error
    }

    if (error) {
      toast.error('Failed to save', { description: error.message })
      setSavingFood(false)
      return
    }

    toast.success(editingFood ? 'Food updated' : 'Food added')
    resetFoodForm()
    setFoodDialogOpen(false)
    setSavingFood(false)
    loadFoods()
  }

  const handleDeleteFood = async () => {
    if (!foodToDelete) return
    const id = foodToDelete.id
    setDeleteFoodDialogOpen(false)
    setFoodToDelete(null)

    const { data, error } = await supabase.from('food_preferences').delete().eq('id', id).select()
    if (error || !data?.length) {
      toast.error('Failed to delete')
      return
    }
    setFoods(prev => prev.filter(f => f.id !== id))
    toast.success('Food deleted')
  }

  // Routine functions
  const loadRoutines = async () => {
    const { data } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('pet_id', petId)
      .order('time_of_day', { ascending: true })
    setRoutines(data || [])
    setRoutineLoading(false)
  }

  const resetRoutineForm = () => {
    setEditingRoutine(null)
    setRoutineType('')
    setTimeOfDay('')
    setCustomTime('')
    setDurationMinutes('')
    setRoutineDescription('')
    setSelectedDays([])
    setRoutineNotes('')
  }

  const openEditRoutineDialog = (routine: DailyRoutine) => {
    setEditingRoutine(routine)
    setRoutineType(routine.routine_type)
    const isPreset = timeOfDayOptions.some(opt => opt.value === routine.time_of_day)
    if (isPreset) {
      setTimeOfDay(routine.time_of_day || '')
      setCustomTime('')
    } else if (routine.time_of_day) {
      setTimeOfDay('custom')
      setCustomTime(routine.time_of_day)
    }
    setDurationMinutes(routine.duration_minutes?.toString() || '')
    setRoutineDescription(routine.description || '')
    setSelectedDays(routine.days_of_week || [])
    setRoutineNotes(routine.notes || '')
    setRoutineDialogOpen(true)
  }

  const handleRoutineDialogChange = (open: boolean) => {
    setRoutineDialogOpen(open)
    if (!open) resetRoutineForm()
  }

  const handleSaveRoutine = async () => {
    setSavingRoutine(true)
    const timeValue = timeOfDay === 'custom' ? customTime : timeOfDay
    const routineData = {
      routine_type: routineType,
      time_of_day: timeValue || null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      description: routineDescription || null,
      days_of_week: selectedDays.length > 0 ? selectedDays : null,
      notes: routineNotes || null,
    }

    let error
    if (editingRoutine) {
      const result = await supabase.from('daily_routines').update(routineData).eq('id', editingRoutine.id)
      error = result.error
    } else {
      const result = await supabase.from('daily_routines').insert({ pet_id: petId, ...routineData })
      error = result.error
    }

    if (error) {
      toast.error('Failed to save', { description: error.message })
      setSavingRoutine(false)
      return
    }

    toast.success(editingRoutine ? 'Routine updated' : 'Routine added')
    resetRoutineForm()
    setRoutineDialogOpen(false)
    setSavingRoutine(false)
    loadRoutines()
  }

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return
    const id = routineToDelete.id
    setDeleteRoutineDialogOpen(false)
    setRoutineToDelete(null)

    const { data, error } = await supabase.from('daily_routines').delete().eq('id', id).select()
    if (error || !data?.length) {
      toast.error('Failed to delete')
      return
    }
    setRoutines(prev => prev.filter(r => r.id !== id))
    toast.success('Routine deleted')
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const formatTime = (time: string | null) => {
    if (!time) return ''
    const preset = timeOfDayOptions.find(opt => opt.value === time)
    if (preset && preset.value !== 'custom') return preset.label.split(' (')[0]
    return time
  }

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Food & Routine</h2>
            <p className="text-sm text-muted-foreground">Food preferences and daily routines</p>
          </div>
          <TabsList>
            <TabsTrigger value="food" className="gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="routine" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Routine</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Food Tab */}
        <TabsContent value="food" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={foodDialogOpen} onOpenChange={handleFoodDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingFood ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <BrandAutocomplete value={brand} domain={brandDomain} onChange={handleBrandChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Variant / Flavor</Label>
                    <Input value={productVariant} onChange={(e) => setProductVariant(e.target.value)} placeholder="e.g., Chicken & Rice" />
                  </div>
                  <div className="space-y-2">
                    <Label>Food Type</Label>
                    <Select value={foodType} onValueChange={setFoodType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {foodTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Portion Size</Label>
                      <Input value={portionSize} onChange={(e) => setPortionSize(e.target.value)} placeholder="e.g., 1 cup" />
                    </div>
                    <div className="space-y-2">
                      <Label>Feeding Frequency</Label>
                      <Select value={feedingFrequency} onValueChange={handleFeedingFrequencyChange}>
                        <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                        <SelectContent>
                          {feedingFrequencyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {feedingFrequency && feedingFrequency !== 'Free feeding' && mealTimes.length > 0 && (
                    <div className="space-y-3">
                      <Label>Meal Times</Label>
                      {mealTimes.map((mt, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-16 shrink-0">Meal {index + 1}:</span>
                          <Select value={mt} onValueChange={(v) => handleMealTimeChange(index, v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timeOfDayOptions.filter(o => o.value !== 'custom').map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={foodNotes} onChange={(e) => setFoodNotes(e.target.value)} placeholder="Any additional notes..." />
                  </div>
                  <Button onClick={handleSaveFood} disabled={savingFood || (!brand && !foodType)} className="w-full">
                    {savingFood ? 'Saving...' : editingFood ? 'Save Changes' : 'Add Food'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {foodLoading ? (
            <div className="space-y-3"><RecordCardSkeleton /><RecordCardSkeleton /></div>
          ) : foods.length === 0 ? (
            <EmptyState
              variant="food"
              title="No food preferences set"
              description="Add your pet's food brands, portions, and meal schedule"
            />
          ) : (
            <div className="space-y-3">
              {foods.map((food) => (
                <Card key={food.id} className="card-hover overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          {food.brand || 'Unnamed Food'}
                          {food.food_type && <Badge variant="secondary">{foodTypes.find(t => t.value === food.food_type)?.label || food.food_type}</Badge>}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {food.product_variant && <span className="font-medium text-foreground/80">{food.product_variant}</span>}
                          {food.product_variant && (food.portion_size || food.feeding_frequency) && ' • '}
                          {food.portion_size}{food.portion_size && food.feeding_frequency && ' • '}{food.feeding_frequency}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {food.brand_domain && <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={40} containerClassName="w-10 h-10 bg-white rounded-md border flex items-center justify-center overflow-hidden flex-shrink-0" />}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditFoodDialog(food)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setFoodToDelete(food); setDeleteFoodDialogOpen(true) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {food.brand && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a href={getAmazonSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#FF9900] text-black hover:bg-[#e88a00] transition-all"><ShoppingCart className="h-3 w-3" />Amazon</a>
                        <a href={getChewySearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#1C49C2] text-white hover:bg-[#153a9e] transition-all"><ShoppingCart className="h-3 w-3" />Chewy</a>
                        <a href={getPetcoSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#0057A6] text-white hover:bg-[#004785] transition-all"><ShoppingCart className="h-3 w-3" />Petco</a>
                        <a href={getPetSmartSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#E31837] text-white hover:bg-[#c7142f] transition-all"><ShoppingCart className="h-3 w-3" />PetSmart</a>
                      </div>
                    )}
                    {food.notes && <p className="text-sm text-muted-foreground">{food.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Routine Tab */}
        <TabsContent value="routine" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={routineDialogOpen} onOpenChange={handleRoutineDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Routine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRoutine ? 'Edit Daily Routine' : 'Add Daily Routine'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Activity Type *</Label>
                    <Select value={routineType} onValueChange={setRoutineType}>
                      <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                      <SelectContent>
                        {routineTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.icon} {type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time of Day</Label>
                    <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                      <SelectTrigger><SelectValue placeholder="Select time of day" /></SelectTrigger>
                      <SelectContent>
                        {timeOfDayOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {timeOfDay === 'custom' && (
                    <div className="space-y-2">
                      <Label>Custom Time</Label>
                      <Input value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="e.g., 7:30am - 8:00am" />
                    </div>
                  )}
                  {!['medication', 'sleep'].includes(routineType) && (
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="30" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Button key={day.value} type="button" variant={selectedDays.includes(day.value) ? 'default' : 'outline'} size="sm" onClick={() => toggleDay(day.value)}>{day.label}</Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={routineDescription} onChange={(e) => setRoutineDescription(e.target.value)} placeholder="e.g., Morning walk around the park" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={routineNotes} onChange={(e) => setRoutineNotes(e.target.value)} placeholder="Any additional notes..." />
                  </div>
                  <Button onClick={handleSaveRoutine} disabled={savingRoutine || !routineType} className="w-full">
                    {savingRoutine ? 'Saving...' : editingRoutine ? 'Save Changes' : 'Add Routine'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Meal Schedule derived from food preferences */}
          {(() => {
            const foodsWithMealTimes = foods.filter(f => f.meal_times && f.meal_times.length > 0)
            const freeFeedingFoods = foods.filter(f => f.feeding_frequency === 'Free feeding')

            if (foodsWithMealTimes.length === 0 && freeFeedingFoods.length === 0) return null

            // Collect all unique time slots and group foods by them
            const timeSlotMap = new Map<string, FoodPreferences[]>()
            for (const food of foodsWithMealTimes) {
              for (const slot of food.meal_times!) {
                if (!timeSlotMap.has(slot)) timeSlotMap.set(slot, [])
                timeSlotMap.get(slot)!.push(food)
              }
            }

            // Sort time slots by the order in timeOfDayOptions
            const slotOrder = timeOfDayOptions.map(o => o.value)
            const sortedSlots = Array.from(timeSlotMap.entries()).sort(([a], [b]) => {
              const ia = slotOrder.indexOf(a)
              const ib = slotOrder.indexOf(b)
              // Known slots sort by index, unknown slots sort after known ones alphabetically
              if (ia !== -1 && ib !== -1) return ia - ib
              if (ia !== -1) return -1
              if (ib !== -1) return 1
              return a.localeCompare(b)
            })

            return (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Meal Schedule</h3>
                {sortedSlots.map(([slot, slotFoods]) => {
                  const timeOption = timeOfDayOptions.find(o => o.value === slot)
                  const label = timeOption ? timeOption.label.split(' (')[0] : slot
                  const timeRange = timeOption ? timeOption.label.match(/\(([^)]+)\)/)?.[1] : undefined
                  return (
                    <Card key={slot}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span>🍽️</span>
                          {label} Meal
                          {timeRange && <span className="text-sm font-normal text-muted-foreground">· {timeRange}</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        {slotFoods.map(food => (
                          <div key={food.id} className="flex items-center justify-between gap-2 py-1">
                            <div className="flex items-center gap-2 min-w-0">
                              {food.brand_domain && <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={24} containerClassName="w-6 h-6 bg-white rounded border flex items-center justify-center overflow-hidden flex-shrink-0" />}
                              <span className="text-sm truncate">{food.brand || 'Unnamed'}</span>
                              {food.food_type && <Badge variant="secondary" className="text-xs">{foodTypes.find(t => t.value === food.food_type)?.label || food.food_type}</Badge>}
                            </div>
                            {food.portion_size && <span className="text-sm text-muted-foreground whitespace-nowrap">{food.portion_size}</span>}
                          </div>
                        ))}
                        <div className="pt-1">
                          <button type="button" onClick={() => setActiveTab('food')} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">Edit in Food tab <ArrowRight className="h-3 w-3" /></button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {freeFeedingFoods.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>🍽️</span>
                        Available All Day
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {freeFeedingFoods.map(food => (
                        <div key={food.id} className="flex items-center justify-between gap-2 py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {food.brand_domain && <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={24} containerClassName="w-6 h-6 bg-white rounded border flex items-center justify-center overflow-hidden flex-shrink-0" />}
                            <span className="text-sm truncate">{food.brand || 'Unnamed'}</span>
                            {food.food_type && <Badge variant="secondary" className="text-xs">{foodTypes.find(t => t.value === food.food_type)?.label || food.food_type}</Badge>}
                          </div>
                          {food.portion_size && <span className="text-sm text-muted-foreground whitespace-nowrap">{food.portion_size}</span>}
                        </div>
                      ))}
                      <div className="pt-1">
                        <button type="button" onClick={() => setActiveTab('food')} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">Edit in Food tab <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })()}

          {routineLoading ? (
            <div className="space-y-3"><RecordCardSkeleton /><RecordCardSkeleton /></div>
          ) : routines.length === 0 ? (
            <EmptyState
              variant="routine"
              title="No daily routines set"
              description="Add walks, play time, medication schedules, and more"
            />
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => {
                const typeInfo = routineTypes.find(t => t.value === routine.routine_type)
                return (
                  <Card key={routine.id} className="card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{typeInfo?.icon}</span>
                            {typeInfo?.label}
                            {routine.time_of_day && <Badge variant="outline">{formatTime(routine.time_of_day)}</Badge>}
                          </CardTitle>
                          {routine.description && <CardDescription>{routine.description}</CardDescription>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditRoutineDialog(routine)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setRoutineToDelete(routine); setDeleteRoutineDialogOpen(true) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {routine.duration_minutes && <Badge variant="secondary">{routine.duration_minutes} min</Badge>}
                        {routine.days_of_week?.map((day) => (
                          <Badge key={day} variant="outline" className="capitalize">{day.slice(0, 3)}</Badge>
                        ))}
                      </div>
                      {routine.notes && <p className="text-sm text-muted-foreground">{routine.notes}</p>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Food Dialog */}
      <AlertDialog open={deleteFoodDialogOpen} onOpenChange={setDeleteFoodDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {foodToDelete?.brand || 'this food item'}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFood} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Routine Dialog */}
      <AlertDialog open={deleteRoutineDialogOpen} onOpenChange={setDeleteRoutineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Routine</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this {routineTypes.find(t => t.value === routineToDelete?.routine_type)?.label?.toLowerCase() || 'routine'}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoutine} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
