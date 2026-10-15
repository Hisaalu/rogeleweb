'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CreditCard,
  DollarSign,
  GraduationCap,
  Mail,
  Settings,
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
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Plans', href: '/admin/plans', icon: CreditCard },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Payments', href: '/admin/payments', icon: DollarSign },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Email campaigns', href: '/admin/email-campaigns', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon
                    size={16}
                    className={active ? 'text-brand-primary' : 'text-brand-accent'}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-2 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft size={16} className="text-brand-accent" />
          Back to app
        </Link>
      </div>
    </>
  )
}