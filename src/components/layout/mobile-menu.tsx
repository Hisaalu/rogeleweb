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
  CreditCard,
  User,
  LogOut,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import type { SessionUser } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

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
  { label: 'Subscription', href: '/learner/subscription', icon: CreditCard },
  { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
  { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
  { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
  { label: 'Bookmarks', href: '/learner/bookmarks', icon: BookmarkCheck },
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

  const closeRef = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
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
          'absolute inset-y-0 right-0 flex w-[85%] max-w-[360px] flex-col bg-card shadow-2xl transition-transform duration-300',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div
          className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-8"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:rotate-90 hover:bg-white/30"
          >
            <X size={20} />
          </button>

          <div className="mt-6 flex items-center gap-4">
            <Avatar
              src={user.profile_photo}
              fallback={getInitials(fullName)}
              size={56}
              className="h-14 w-14 ring-2 ring-white/40 ring-offset-2 ring-offset-transparent"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-white">
                {fullName}
              </p>
              <p className="truncate text-xs capitalize text-white/80">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          <ul className="space-y-0.5 sm:space-y-1">
            {items.map((item) => {
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
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition sm:py-3',
                      active
                        ? 'nav-active font-semibold'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon
                      size={18}
                      className={active ? 'text-brand-accent' : 'text-brand-accent/70'}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
            <li className="mt-3 border-t border-border pt-3 sm:mt-4 sm:pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:bg-muted sm:py-3"
                style={{ color: 'var(--danger-fg)' }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  )
}