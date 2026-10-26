'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  DollarSign,
  GraduationCap,
  LogOut,
  Mail,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: typeof BarChart3
}

const NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: BarChart3 },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Analytics', href: '/admin/analytics', icon: ClipboardList },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Plans', href: '/admin/plans', icon: CreditCard },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: DollarSign },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Email campaigns', href: '/admin/email-campaigns', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Profile', href: '/admin/profile', icon: User },
]

export const AdminSidebarNav = React.memo(function AdminSidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }, [router])

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-primary" />
                  )}
                  
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors',
                      active ? 'text-brand-primary' : 'text-brand-accent group-hover:text-foreground'
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          <LogOut size={18} className="shrink-0" />
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </>
  )
})