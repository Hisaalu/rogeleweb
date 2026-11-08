'use client'

import { memo, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  ClipboardList,
  HelpCircle,
  Rocket,
  User,
  Users,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { cn } from '@/lib/utils'
import {
  isAnalyticsHintDismissed,
  dismissAnalyticsHint,
  toHintRole,
} from '@/lib/nav-hints'
import type { SessionUser } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  isNew?: boolean
}

const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/teacher/students', icon: Users },
  { label: 'Analytics', href: '/teacher/analytics', icon: BarChart3, isNew: true },
  { label: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
  { label: 'Quizzes', href: '/teacher/quizzes', icon: HelpCircle },
  { label: 'Homework', href: '/teacher/homework', icon: ClipboardList },
  { label: 'Profile', href: '/teacher/profile', icon: User },
  { label: 'Settings', href: '/teacher/settings', icon: Settings },
]

const LEARNER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/learner/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/learner/analytics', icon: BarChart3, isNew: true },
  { label: 'Premium', href: '/learner/subscription', icon: Rocket, isNew: true },
  { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
  { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
  { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
  { label: 'Bookmarks', href: '/learner/bookmarks', icon: BookmarkCheck },
  { label: 'Profile', href: '/learner/profile', icon: User },
  { label: 'Settings', href: '/learner/settings', icon: Settings },
]

export const Sidebar = memo(function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const items = user.role === 'teacher' ? TEACHER_NAV : LEARNER_NAV
  const analyticsHref =
    user.role === 'teacher' ? '/teacher/analytics' : '/learner/analytics'
    
  const dashboardHref =
    user.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard'

  const hintRole = toHintRole(user.role)
  const [hintDismissed, setHintDismissed] = useState(true)

  useEffect(() => {
    if (!hintRole) return
    setHintDismissed(isAnalyticsHintDismissed(hintRole))
  }, [hintRole])

  useEffect(() => {
    if (!hintRole || hintDismissed) return
    const onAnalytics =
      pathname === analyticsHref || pathname.startsWith(analyticsHref + '/')
    if (onAnalytics) {
      dismissAnalyticsHint(hintRole)
      setHintDismissed(true)
    }
  }, [pathname, analyticsHref, hintDismissed, hintRole])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      
      <div className="flex h-[70px] shrink-0 items-center border-b border-border px-4">
        <Link 
          href={dashboardHref} 
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <BrandLogo size={34} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              hideBadge={item.href === analyticsHref && hintDismissed}
            />
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-[20px] font-semibold text-danger-fg transition hover:bg-danger-bg"
        >
          <LogOut size={25} className="shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  )
})

const NavLink = memo(function NavLink({
  item,
  pathname,
  hideBadge,
}: {
  item: NavItem
  pathname: string
  hideBadge: boolean
}) {
  const active =
    pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-4 py-2.5 text-[20px] font-semibold transition',
          active
            ? 'nav-active font-bold'
            : 'text-foreground hover:bg-muted hover:text-brand-accent',
        )}
      >
        <Icon
          size={25}
          className={active ? 'text-brand-accent' : 'text-brand-accent/70'}
        />
        <span className="truncate">{item.label}</span>
        {item.isNew && !hideBadge && (
          <span className="ml-auto shrink-0 rounded-sm bg-brand-accent px-2 py-0.5 text-[15px] leading-none tracking-wider text-white shadow-sm">
            New
          </span>
        )}
      </Link>
    </li>
  )
})