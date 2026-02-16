'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { SharedPetData } from '@/lib/types/pet'
import { ShareContent } from '@/components/share/share-content'

interface PinEntryGateProps {
  token: string
  petName: string
}

export function PinEntryGate({ token, petName }: PinEntryGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SharedPetData | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: result, error: rpcError } = await supabase.rpc('verify_share_pin', {
      share_token: token,
      pin,
    })

    if (rpcError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setData(result as SharedPetData)
    setLoading(false)
  }

  if (data) {
    return <ShareContent data={data} />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{petName}&apos;s Profile</CardTitle>
          <CardDescription>Enter the PIN to view this profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
              placeholder="Enter PIN"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || pin.length < 4}
            >
              {loading ? 'Verifying...' : 'View Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
