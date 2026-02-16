'use client'

import { ActivityFeed } from '@/components/activity/activity-feed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activity Feed
        </h1>
        <p className="text-muted-foreground mt-1">
          See recent changes across all your pets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>
            Track updates made by you and your collaborators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed showPetFilter={true} limit={30} />
        </CardContent>
      </Card>
    </div>
  )
}
