'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  CreditCard,
  User,
  Mail,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
  { label: 'Lessons', href: '/lessons', icon: BookOpen, roles: ['*'] },
  { label: 'Homework', href: '/homework', icon: ClipboardList, roles: ['*'] },
  { label: 'Quizzes', href: '/quizzes', icon: HelpCircle, roles: ['*'] },
  {
    label: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
    roles: ['learner', 'external', 'admin'],
  },
  {
    label: 'Email campaigns',
    href: '/admin/email-campaigns',
    icon: Mail,
    roles: ['admin'],
  },
  { label: 'Profile', href: '/profile', icon: User, roles: ['*'] },
]

export function Sidebar({ user }: { user?: SessionUser | null }) {
  const pathname = usePathname()
  const role = user?.role ?? 'learner'
  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role),
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center border-b border-border px-4 py-4">
        <BrandLogo size={36} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active ? 'text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  style={active ? { backgroundColor: 'var(--brand-primary)' } : undefined}
                >
                  <Icon size={18} style={{ color: 'var(--brand-accent)' }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}