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
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const isTeacher = user.role === 'teacher'

  const TEACHER_NAV: NavItem[] = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/teacher/students', icon: Users },
    { label: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
    { label: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
    { label: 'Quizzes', href: '/teacher/quizzes', icon: HelpCircle },
    { label: 'Homework', href: '/teacher/homework', icon: ClipboardList },
    { label: 'Profile', href: '/teacher/profile', icon: User },
    { label: 'Settings', href: '/teacher/settings', icon: Settings },
  ]

  const LEARNER_NAV: NavItem[] = [
    { label: 'Dashboard', href: '/learner/dashboard', icon: LayoutDashboard },
    { label: 'Subscription', href: '/subscription', icon: CreditCard },
    { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
    { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
    { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
    { label: 'Bookmarks', href: '/learner/bookmarks', icon: BookOpen },
    { label: 'Profile', href: '/learner/profile', icon: User },
    { label: 'Settings', href: '/learner/settings', icon: Settings },
  ]

  const items = isTeacher ? TEACHER_NAV : LEARNER_NAV

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-[80px] shrink-0 items-center border-b border-border px-4">
        <BrandLogo size={42} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition',
                    active
                      ? 'text-brand-accent bg-brand-primary/10'
                      : 'text-foreground hover:bg-muted hover:text-brand-accent',
                  )}
                >
                  <Icon
                    size={18}
                    className={active ? 'text-brand-accent' : 'text-brand-accent/70'}
                  />
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