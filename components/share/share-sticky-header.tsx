'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PawPrint, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareStickyHeaderProps {
  petName: string
  petPhotoUrl?: string | null
  breed?: string | null
  species: string
}

export function ShareStickyHeader({ petName, petPhotoUrl, breed, species }: ShareStickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past 250px (past the hero section)
      setIsVisible(window.scrollY > 250)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform print:hidden',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={petPhotoUrl || undefined} alt={petName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                  <PawPrint className="h-4 w-4 text-primary/60" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">
                  {petName}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {breed ? `${breed} ` : ''}{species}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ChevronUp className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Back to Top</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
