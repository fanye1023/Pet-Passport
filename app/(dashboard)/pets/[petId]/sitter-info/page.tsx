'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Key, Package, MapPin, Wifi, FileText, Brain, Home, Dog } from 'lucide-react'
import { SubTabs } from '@/components/ui/sub-tabs'
import { CareInstructions, BehavioralNotes } from '@/lib/types/pet'
import { toast } from 'sonner'
import { RecordCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

export default function SitterInfoPage() {
  const params = useParams()
  const petId = params.petId as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [savingCare, setSavingCare] = useState(false)
  const [savingBehavior, setSavingBehavior] = useState(false)

  // Care Instructions state
  const [careId, setCareId] = useState<string | null>(null)
  const [houseAccess, setHouseAccess] = useState('')
  const [foodStorage, setFoodStorage] = useState('')
  const [suppliesLocation, setSuppliesLocation] = useState('')
  const [wifiAndAlarm, setWifiAndAlarm] = useState('')
  const [otherNotes, setOtherNotes] = useState('')

  // Behavioral Notes state
  const [behaviorId, setBehaviorId] = useState<string | null>(null)
  const [knownCommands, setKnownCommands] = useState('')
  const [fearsAndTriggers, setFearsAndTriggers] = useState('')
  const [socialization, setSocialization] = useState('')
  const [temperament, setTemperament] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [petId])

  const loadData = async () => {
    const [careResult, behaviorResult] = await Promise.all([
      supabase
        .from('care_instructions')
        .select('*')
        .eq('pet_id', petId)
        .maybeSingle(),
      supabase
        .from('behavioral_notes')
        .select('*')
        .eq('pet_id', petId)
        .maybeSingle(),
    ])

    if (careResult.data) {
      const care = careResult.data as CareInstructions
      setCareId(care.id)
      setHouseAccess(care.house_access || '')
      setFoodStorage(care.food_storage || '')
      setSuppliesLocation(care.supplies_location || '')
      setWifiAndAlarm(care.wifi_and_alarm || '')
      setOtherNotes(care.other_notes || '')
    }

    if (behaviorResult.data) {
      const behavior = behaviorResult.data as BehavioralNotes
      setBehaviorId(behavior.id)
      setKnownCommands(behavior.known_commands || '')
      setFearsAndTriggers(behavior.fears_and_triggers || '')
      setSocialization(behavior.socialization || '')
      setTemperament(behavior.temperament || '')
      setAdditionalNotes(behavior.additional_notes || '')
    }

    setLoading(false)
  }

  const handleSaveCare = async () => {
    setSavingCare(true)

    const data = {
      pet_id: petId,
      house_access: houseAccess || null,
      food_storage: foodStorage || null,
      supplies_location: suppliesLocation || null,
      wifi_and_alarm: wifiAndAlarm || null,
      other_notes: otherNotes || null,
    }

    if (careId) {
      const { error } = await supabase
        .from('care_instructions')
        .update(data)
        .eq('id', careId)
      if (error) {
        toast.error('Failed to save care instructions')
      } else {
        toast.success('Care instructions saved')
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('care_instructions')
        .insert(data)
        .select()
        .single()
      if (error) {
        toast.error('Failed to save care instructions')
      } else {
        setCareId(inserted.id)
        toast.success('Care instructions saved')
      }
    }

    setSavingCare(false)
  }

  const handleSaveBehavior = async () => {
    setSavingBehavior(true)

    const data = {
      pet_id: petId,
      known_commands: knownCommands || null,
      fears_and_triggers: fearsAndTriggers || null,
      socialization: socialization || null,
      temperament: temperament || null,
      additional_notes: additionalNotes || null,
    }

    if (behaviorId) {
      const { error } = await supabase
        .from('behavioral_notes')
        .update(data)
        .eq('id', behaviorId)
      if (error) {
        toast.error('Failed to save behavioral notes')
      } else {
        toast.success('Behavioral notes saved')
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('behavioral_notes')
        .insert(data)
        .select()
        .single()
      if (error) {
        toast.error('Failed to save behavioral notes')
      } else {
        setBehaviorId(inserted.id)
        toast.success('Behavioral notes saved')
      }
    }

    setSavingBehavior(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <RecordCardSkeleton />
        <RecordCardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Sitter Info</h2>
        <p className="text-sm text-muted-foreground">
          Information for pet sitters and walkers
        </p>
      </div>

      <Tabs defaultValue="care">
        <SubTabs
          tabs={[
            { value: 'care', label: 'Care Instructions', icon: <Home className="h-4 w-4" /> },
            { value: 'behavior', label: 'Behavioral Notes', icon: <Dog className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="care" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" />
                House Access
              </CardTitle>
              <CardDescription>Lockbox code, key location, gate codes</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={houseAccess}
                onChange={(e) => setHouseAccess(e.target.value)}
                placeholder="e.g., Lockbox on front door, code 1234. Side gate code: 5678"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                Food Storage
              </CardTitle>
              <CardDescription>Where food and treats are stored</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={foodStorage}
                onChange={(e) => setFoodStorage(e.target.value)}
                placeholder="e.g., Dry food in pantry, bottom shelf. Treats in kitchen drawer by the fridge"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Supplies Location
              </CardTitle>
              <CardDescription>Leash, toys, waste bags location</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={suppliesLocation}
                onChange={(e) => setSuppliesLocation(e.target.value)}
                placeholder="e.g., Leash hanging by front door. Waste bags in hall closet. Toys in living room basket"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" />
                WiFi & Alarm
              </CardTitle>
              <CardDescription>Network name/password, alarm code</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={wifiAndAlarm}
                onChange={(e) => setWifiAndAlarm(e.target.value)}
                placeholder="e.g., WiFi: MyNetwork, Password: abc123. Alarm code: 9999"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Other Notes
              </CardTitle>
              <CardDescription>Anything else the sitter should know</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
                placeholder="e.g., Mailbox key is under the doormat. Trash goes out on Tuesdays"
                rows={3}
              />
            </CardContent>
          </Card>

          <Button onClick={handleSaveCare} disabled={savingCare} className="w-full sm:w-auto">
            {savingCare ? 'Saving...' : 'Save Care Instructions'}
          </Button>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Known Commands</CardTitle>
              <CardDescription>Commands your pet responds to</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={knownCommands}
                onChange={(e) => setKnownCommands(e.target.value)}
                placeholder="e.g., sit, stay, come, leave it, down, shake"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fears & Triggers</CardTitle>
              <CardDescription>Things that scare or stress your pet</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={fearsAndTriggers}
                onChange={(e) => setFearsAndTriggers(e.target.value)}
                placeholder="e.g., thunder, vacuum cleaner, skateboards, loud noises"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Socialization</CardTitle>
              <CardDescription>How your pet interacts with others</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={socialization}
                onChange={(e) => setSocialization(e.target.value)}
                placeholder="e.g., good with kids, reactive with large dogs, friendly with cats"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Temperament</CardTitle>
              <CardDescription>General personality description</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={temperament}
                onChange={(e) => setTemperament(e.target.value)}
                placeholder="e.g., friendly but shy with strangers"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
              <CardDescription>Any other behavioral information</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., Likes to sleep on the couch. Gets zoomies after dinner"
                rows={3}
              />
            </CardContent>
          </Card>

          <Button onClick={handleSaveBehavior} disabled={savingBehavior} className="w-full sm:w-auto">
            {savingBehavior ? 'Saving...' : 'Save Behavioral Notes'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
