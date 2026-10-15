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
  X,
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

export function Sidebar({
  user,
  mobileOpen,
  onClose,
}: {
  user?: SessionUser | null
  mobileOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const role = user?.role ?? 'learner'

  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role),
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <BrandLogo size={36} />
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon
                      size={18}
                      className={active ? 'text-brand-primary' : 'text-brand-accent'}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}