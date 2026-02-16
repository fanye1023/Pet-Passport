'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ActivityItem } from './activity-item'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActivityLogEntry } from '@/lib/types/pet'

interface PetOption {
  id: string
  name: string
  photo_url: string | null
}
import { RefreshCw, Filter } from 'lucide-react'

interface ActivityFeedProps {
  petId?: string
  showPetFilter?: boolean
  limit?: number
}

export function ActivityFeed({
  petId,
  showPetFilter = true,
  limit = 20
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [pets, setPets] = useState<PetOption[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>(petId || 'all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const fetchActivities = useCallback(async (reset = false) => {
    setIsLoading(true)
    const supabase = createClient()

    const currentOffset = reset ? 0 : offset

    // Build query
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user_profile:user_profiles!activity_log_user_profile_fkey(*),
        pet:pets!activity_log_pet_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + limit - 1)

    // Apply filters
    const filterPetId = petId || (selectedPetId !== 'all' ? selectedPetId : null)
    if (filterPetId) {
      query = query.eq('pet_id', filterPetId)
    }

    if (selectedAction !== 'all') {
      query = query.eq('action', selectedAction)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching activities:', error)
      setIsLoading(false)
      return
    }

    if (reset) {
      setActivities(data || [])
      setOffset(data?.length || 0)
    } else {
      setActivities(prev => [...prev, ...(data || [])])
      setOffset(currentOffset + (data?.length || 0))
    }

    setHasMore((data?.length || 0) === limit)
    setIsLoading(false)
  }, [petId, selectedPetId, selectedAction, offset, limit])

  const fetchPets = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pets')
      .select('id, name, photo_url')
      .order('name')

    setPets(data || [])
  }

  useEffect(() => {
    fetchPets()
  }, [])

  useEffect(() => {
    setOffset(0)
    fetchActivities(true)
  }, [selectedPetId, selectedAction, petId])

  const handleRefresh = () => {
    setOffset(0)
    fetchActivities(true)
  }

  const handleLoadMore = () => {
    fetchActivities(false)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {showPetFilter && !petId && pets.length > 1 && (
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pets</SelectItem>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Activity list */}
      <div className="space-y-1">
        {isLoading && activities.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No activity yet</p>
            <p className="text-sm">Activity will appear here when changes are made to pet profiles.</p>
          </div>
        ) : (
          <>
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                showPet={!petId && selectedPetId === 'all'}
              />
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
