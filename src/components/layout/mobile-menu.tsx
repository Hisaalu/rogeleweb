'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  X,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  CreditCard,
  User,
  LogOut,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

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
  const isTeacher = user.role === 'teacher'

  const TEACHER_NAV = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/teacher/students', icon: Users },
    { label: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
    { label: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
    { label: 'Quizzes', href: '/teacher/quizzes', icon: HelpCircle },
    { label: 'Homework', href: '/teacher/homework', icon: ClipboardList },
    { label: 'Profile', href: '/teacher/profile', icon: User },
    { label: 'Settings', href: '/teacher/settings', icon: Settings },
  ]

  const LEARNER_NAV = [
    { label: 'Dashboard', href: '/learner/dashboard', icon: LayoutDashboard },
    { label: 'Subscription', href: '/subscription', icon: CreditCard },
    { label: 'Lessons', href: '/learner/lessons', icon: BookOpen },
    { label: 'Quizzes', href: '/learner/quizzes', icon: HelpCircle },
    { label: 'Homework', href: '/learner/homework', icon: ClipboardList },
    { label: 'Bookmarks', href: '/learner/bookmarks', icon: BookOpen },
    { label: 'Profile', href: '/learner/profile', icon: User },
    { label: 'Settings', href: '/learner/settings', icon: Settings },
  ]

  const NAV = isTeacher ? TEACHER_NAV : LEARNER_NAV

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-[85%] max-w-[380px] flex-col bg-card shadow-2xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div
          className="relative px-6 py-6"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:rotate-90 hover:bg-white/30"
          >
            <X size={18} />
          </button>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-lg font-semibold text-white">
              {getInitials(fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {fullName}
              </p>
              <p className="truncate text-xs capitalize text-white/80">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                      active
                        ? 'bg-brand-primary/15 text-brand-accent'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon
                      size={18}
                      className={active ? 'text-brand-accent' : 'text-brand-accent/70'}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li className="pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}