'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Plus, CalendarDays, Activity, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'All Pets Calendar',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: Activity,
  },
  {
    label: 'Saved Pets',
    href: '/saved',
    icon: Bookmark,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col glass-nav border-r border-white/20">
      <div className="flex h-16 items-center border-b border-white/20 px-6">
        <Logo href="/" />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <Link href="/pets/new">
          <Button className="w-full shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Pet
          </Button>
        </Link>
      </div>
    </aside>
  )
}
