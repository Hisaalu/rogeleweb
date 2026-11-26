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
  Users,
  BarChart3,
  Settings,
  Sun,
  Moon,
  AlarmClock,
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
]

const LEARNER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/learner/dashboard', icon: LayoutDashboard },
  { label: 'Premium', href: '/learner/subscription', icon: Rocket, isDiscount: true },
  { label: 'Analytics', href: '/learner/analytics', icon: BarChart3, isNew: true },
  { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
  { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
  { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
  { label: 'Library', href: '/learner/bookmarks', icon: BookmarkCheck },
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
  const profileHref =
    user.role === 'teacher' ? '/teacher/profile' : '/learner/profile'
  const settingsHref =
    user.role === 'teacher' ? '/teacher/settings' : '/learner/settings'
    const helpCenterHref =
  user.role === 'teacher' ? '/teacher/contact' : '/learner/contact'

  const utilityItems: NavItem[] = [
    { label: 'Profile', href: profileHref, icon: User },
    { label: 'Settings and privacy', href: settingsHref, icon: Settings },
    { label: 'Help Center', href: helpCenterHref, icon: HelpCircle },
  ]

  const hintRole = toHintRole(user.role)
  const [hintDismissed, setHintDismissed] = useState(true)
  const [isDark, setIsDark] = useState(false)
  
  const [isScrolled, setIsScrolled] = useState(false)

  const closeRef = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [open])

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
      setIsScrolled(false)
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

  function handleToggleTheme() {
    const nextDark = !isDark
    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    try {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light')
    } catch {
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  const roleLabel =
    user.role === 'teacher' ? "Teacher account" : "Student Account"

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <style>{`
        .mobile-drawer-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-drawer-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

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
          'mobile-drawer-scroll absolute inset-y-0 left-0 flex w-[82%] max-w-[340px] flex-col overflow-hidden border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out',
          visible ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className={cn(
          "shrink-0 transition-colors duration-200",
          isScrolled ? "border-b border-border mx-5" : "border-b border-transparent mx-5"
        )}>
          <div className="px-0 pb-4 pt-5">
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
              <p className="mt-2.5 text-sm text-muted-foreground">
                <span className="text-foreground">{roleLabel}</span>
              </p>
            </div>
          </div>
        </div>

        <nav 
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
          className="mobile-drawer-scroll min-h-0 flex-1 overflow-y-auto px-2 py-2"
        >
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
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-brand-accent px-2 py-0.5 text-[15px] leading-none tracking-wider text-white shadow-sm">
                        <AlarmClock size={14} strokeWidth={2.2} className="shrink-0" />
                        <span>Offer</span>
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
          </ul>

          <div className="mt-3 border-t border-border pt-3">
            <ul className="space-y-0.5">
              {utilityItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-4 rounded-xl px-4 py-2 text-[16px] font-medium transition',
                        active
                          ? 'nav-active bg-muted/70 text-foreground'
                          : 'text-foreground hover:bg-muted/60',
                      )}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.9}
                        className={cn(
                          'shrink-0',
                          active ? 'text-brand-accent' : 'text-foreground',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        <div className="shrink-0 px-5 py-3">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted/60"
          >
            {isDark ? (
              <Moon size={22} strokeWidth={2.1} />
            ) : (
              <Sun size={22} strokeWidth={2.1} />
            )}
          </button>
        </div>
      </aside>
    </div>
  )
}