'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Syringe,
  Heart,
  Shield,
  Stethoscope,
  Phone,
  Share2,
  CalendarDays,
  Users,
  Coffee,
  ClipboardList,
  Receipt,
} from 'lucide-react'

interface PetNavProps {
  petId: string
}

const navItems = [
  { href: '/vaccinations', label: 'Vaccines', icon: Syringe },
  { href: '/health', label: 'Health', icon: Heart },
  { href: '/insurance', label: 'Insurance', icon: Shield },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/vet', label: 'Vet', icon: Stethoscope },
  { href: '/emergency', label: 'Emergency', icon: Phone },
  { href: '/care', label: 'Food & Routine', icon: Coffee },
  { href: '/sitter-info', label: 'Sitter Info', icon: ClipboardList },
  { href: '/collaborators', label: 'Collaborators', icon: Users },
  { href: '/share', label: 'Share', icon: Share2 },
]

export function PetNav({ petId }: PetNavProps) {
  const pathname = usePathname()
  const basePath = `/pets/${petId}`

  return (
    <nav className="glass-nav rounded-2xl p-2 overflow-x-auto -mx-4 px-4 md:mx-0">
      <div className="flex gap-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`
          const isActive = pathname === href || pathname.startsWith(href)

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
