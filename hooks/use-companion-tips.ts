'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useCompanionOptional } from '@/components/ui/pet-companion'

// Tips organized by route pattern
const PAGE_TIPS: Record<string, string[]> = {
  '/pets': [
    'Click + to add a new pet!',
    'Tap a pet card to see details',
    'Each section tracks different info',
  ],
  '/pets/[petId]': [
    'This is your pet\'s dashboard',
    'Track vaccinations, health & more!',
    'Tap any section to manage it',
  ],
  '/pets/[petId]/vaccinations': [
    'Keep vaccination records up to date',
    'Upload docs for easy access',
    'Vets love organized records!',
  ],
  '/pets/[petId]/health': [
    'Log vet visits and treatments here',
    'Keep a health timeline',
    'Track medications too!',
  ],
  '/pets/[petId]/care': [
    'Add foods your pet enjoys',
    'Set up daily routines',
    'Great info for pet sitters!',
  ],
  '/pets/[petId]/emergency': [
    'Add emergency contacts here',
    'Include your vet\'s number',
    'Quick access when needed',
  ],
  '/pets/[petId]/insurance': [
    'Store policy details here',
    'Upload insurance cards',
    'Easy claims access!',
  ],
  '/pets/[petId]/share': [
    'Share pet info with others',
    'Great for pet sitters!',
    'Control what they see',
  ],
  '/pets/[petId]/calendar': [
    'Track appointments here',
    'Set medication reminders',
    'Never miss a vet visit!',
  ],
  '/pets/[petId]/sitter-info': [
    'Perfect for pet sitters',
    'Add care instructions',
    'Note behavioral quirks',
  ],
  '/settings': [
    'Customize your experience',
    'You can hide me here!',
    'Change theme anytime',
  ],
}

// Generic tips shown on any page
const GENERIC_TIPS: string[] = [
  'I\'m here to help!',
  'Looking good today!',
  'Keeping track of your pets!',
]

// Storage key for tracking shown tips
const TIPS_SHOWN_KEY = 'companion-tips-shown'

interface UseTipsConfig {
  enabled?: boolean
  minDelay?: number // Min ms before showing first tip
  maxDelay?: number // Max ms before showing first tip
  tipInterval?: number // Ms between tips
  maxTipsPerSession?: number
}

export function useCompanionTips(config: UseTipsConfig = {}) {
  const {
    enabled = true,
    minDelay = 5000, // 5 seconds
    maxDelay = 15000, // 15 seconds
    tipInterval = 60000, // 1 minute between tips
    maxTipsPerSession = 3,
  } = config

  const companion = useCompanionOptional()
  const pathname = usePathname()
  const tipCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const companionRef = useRef(companion)
  const pathnameRef = useRef(pathname)

  // Keep refs updated
  useEffect(() => {
    companionRef.current = companion
  }, [companion])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  // Get tips for current route
  const getTipsForRoute = useCallback((path: string): string[] => {
    // Direct match
    if (PAGE_TIPS[path]) {
      return PAGE_TIPS[path]
    }

    // Pattern matching for dynamic routes
    const patterns = Object.keys(PAGE_TIPS)
    for (const pattern of patterns) {
      const regex = new RegExp(
        '^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$'
      )
      if (regex.test(path)) {
        return PAGE_TIPS[pattern]
      }
    }

    return GENERIC_TIPS
  }, [])

  // Get a random tip that hasn't been shown recently
  const getRandomTip = useCallback((tips: string[]): string => {
    // Get shown tips from session storage
    const shownRaw = sessionStorage.getItem(TIPS_SHOWN_KEY)
    const shown: string[] = shownRaw ? JSON.parse(shownRaw) : []

    // Filter out recently shown
    const available = tips.filter(tip => !shown.includes(tip))
    const pool = available.length > 0 ? available : tips

    // Pick random
    const tip = pool[Math.floor(Math.random() * pool.length)]

    // Track shown (keep last 10)
    const updated = [...shown, tip].slice(-10)
    sessionStorage.setItem(TIPS_SHOWN_KEY, JSON.stringify(updated))

    return tip
  }, [])

  // Show a random tip
  const showTip = useCallback(() => {
    const currentCompanion = companionRef.current
    if (!currentCompanion || !currentCompanion.state.isVisible) return
    if (tipCountRef.current >= maxTipsPerSession) return

    const tips = getTipsForRoute(pathnameRef.current)
    const tip = getRandomTip(tips)

    currentCompanion.showMessage(tip, 4000)
    tipCountRef.current++
  }, [getTipsForRoute, getRandomTip, maxTipsPerSession])

  // Schedule next tip
  const scheduleNextTip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!enabled) return
    if (tipCountRef.current >= maxTipsPerSession) return

    const delay = tipCountRef.current === 0
      ? Math.random() * (maxDelay - minDelay) + minDelay
      : tipInterval

    timeoutRef.current = setTimeout(() => {
      showTip()
      scheduleNextTip()
    }, delay)
  }, [enabled, minDelay, maxDelay, tipInterval, maxTipsPerSession, showTip])

  // Start tips on mount / when pathname changes
  useEffect(() => {
    if (!enabled) return

    // Reset count on page change
    tipCountRef.current = 0
    scheduleNextTip()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, pathname, scheduleNextTip])

  // Manual tip trigger
  const triggerTip = useCallback(() => {
    showTip()
  }, [showTip])

  return { triggerTip }
}
