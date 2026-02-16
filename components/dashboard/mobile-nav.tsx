'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CalendarDays, Activity, Plus, PawPrint } from 'lucide-react'

const navItems = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Add',
    href: '/pets/new',
    icon: Plus,
    isAction: true,
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: Activity,
  },
  {
    label: 'Pets',
    href: '/dashboard',
    icon: PawPrint,
    scrollToPets: true,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on pet detail pages (they have their own nav)
  const isPetDetailPage = pathname.startsWith('/pets/') && pathname !== '/pets/new'
  if (isPetDetailPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area background */}
      <div className="bg-background/80 backdrop-blur-xl border-t border-white/20 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href && !item.isAction

            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
