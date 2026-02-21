import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, Menu, LayoutDashboard, CalendarDays, Activity, Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/ui/logo'

const mobileNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Add Pet', href: '/pets/new', icon: Plus },
]

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between glass-nav border-b border-white/20 px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 glass">
            <div className="flex h-16 items-center border-b border-white/20 px-6">
              <Logo href="/" />
            </div>
            <nav className="p-4 space-y-2">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 active:bg-white/70 dark:active:bg-white/20 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="md:hidden">
          <Logo href="/" size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/30 hover:ring-white/50 transition-all">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass border-white/20">
          <div className="flex items-center gap-2 p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-white/20" />
          <DropdownMenuItem asChild>
            <Link href="#" className="cursor-pointer rounded-lg">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/20" />
          <DropdownMenuItem asChild>
            <Link href="/logout" className="cursor-pointer text-destructive focus:text-destructive rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
