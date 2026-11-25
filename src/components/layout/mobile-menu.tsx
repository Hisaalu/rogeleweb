'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  X,
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  ClipboardList,
  HelpCircle,
  Rocket,
  User,
  LogOut,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
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
  isDiscount?: boolean
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
  { label: 'Premium', href: '/learner/subscription', icon: Rocket, isDiscount: true },
  { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
  { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
  { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
  { label: 'Library', href: '/learner/bookmarks', icon: BookmarkCheck },
  { label: 'Profile', href: '/learner/profile', icon: User },
  { label: 'Settings', href: '/learner/settings', icon: Settings },
]

export function MobileMenu({
  user,
  open,
  onClose,
}: {
  user: SessionUser
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const items = user.role === 'teacher' ? TEACHER_NAV : LEARNER_NAV
  const analyticsHref =
    user.role === 'teacher' ? '/teacher/analytics' : '/learner/analytics'

  const hintRole = toHintRole(user.role)
  const [hintDismissed, setHintDismissed] = useState(true)

  const closeRef = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hintRole) return
    setHintDismissed(isAnalyticsHintDismissed(hintRole))
  }, [open, hintRole])

  useEffect(() => {
    if (!hintRole || hintDismissed) return
    const onAnalytics =
      pathname === analyticsHref || pathname.startsWith(analyticsHref + '/')
    if (onAnalytics) {
      dismissAnalyticsHint(hintRole)
      setHintDismissed(true)
    }
  }, [pathname, analyticsHref, hintDismissed, hintRole])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => setVisible(true))
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  const roleLabel =
    user.role === 'teacher' ? "Teacher's account" : "Learner's account"

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'absolute inset-y-0 left-0 flex w-[82%] max-w-[340px] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out',
          visible ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <Avatar
              src={user.profile_photo}
              fallback={getInitials(fullName)}
              size={48}
              className="h-12 w-12 shrink-0 ring-1 ring-border"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 min-w-0">
            <p className="truncate text-[18px] font-bold leading-tight text-foreground">
              {fullName}
            </p>
            {user.email && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
            <p className="mt-2.5 text-sm font-medium text-muted-foreground">
              <span className="text-foreground">{roleLabel}</span>
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              const hideBadge =
                item.href === analyticsHref && hintDismissed
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-5 rounded-xl px-4 py-3 text-[19px] font-bold tracking-[-0.01em] transition',
                      active
                        ? 'nav-active bg-muted/70 text-foreground'
                        : 'text-foreground hover:bg-muted/60',
                    )}
                  >
                    <Icon
                      size={22}
                      strokeWidth={2.1}
                      className={cn(
                        'shrink-0',
                        active ? 'text-brand-accent' : 'text-foreground',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.isDiscount && (
                      <span className="shrink-0 rounded-sm bg-brand-accent px-2 py-0.5 text-[15px] leading-none tracking-wider text-white shadow-sm">
                        Offer
                      </span>
                    )}
                    {item.isNew && !hideBadge && (
                      <span className="ml-auto shrink-0 rounded-sm bg-brand-accent px-2 py-0.5 text-[15px] leading-none tracking-wider text-white shadow-sm">
                        New
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
            <li className="mt-3 border-t border-border pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-5 rounded-xl px-4 py-3 text-[19px] font-bold tracking-[-0.01em] text-foreground transition hover:bg-muted/60"
              >
                <LogOut size={22} strokeWidth={2.1} className="shrink-0" />
                <span>Log out</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  )
}