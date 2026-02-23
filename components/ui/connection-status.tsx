'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConnectionStatus() {
  const [isOffline, setIsOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const supabase = createClient()
      // Simple health check - try to reach Supabase
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      setIsOffline(false)
    } catch (error) {
      setIsOffline(true)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Also listen for browser online/offline events
    const handleOnline = () => checkConnection()
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>

        <h2 className="text-xl font-bold mb-2">Unable to connect</h2>

        <p className="text-muted-foreground mb-4">
          We can&apos;t reach our servers. This might be because:
        </p>

        <ul className="text-sm text-muted-foreground text-left space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>You&apos;re on a corporate, school, or public WiFi that blocks certain services</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Your internet connection is down</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>A firewall or VPN is blocking the connection</span>
          </li>
        </ul>

        <div className="space-y-3">
          <p className="text-sm font-medium">Try:</p>
          <p className="text-sm text-muted-foreground">
            Switching to mobile data, using a different network, or disabling your VPN
          </p>
        </div>

        <Button
          onClick={checkConnection}
          disabled={isChecking}
          className="mt-6 w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
