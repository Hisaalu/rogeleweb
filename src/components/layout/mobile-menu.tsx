'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, LayoutDashboard, BookOpen, ClipboardList, HelpCircle, CreditCard, User, LogOut } from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

export function MobileMenu({ user, open, onClose }: { user: SessionUser, open: boolean, onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const dashboardHref = user.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard'
  const lessonsHref = user.role === 'teacher' ? '/teacher/lessons' : '/learner/lessons'
  const homeworkHref = user.role === 'teacher' ? '/teacher/homework' : '/learner/homework'
  const quizzesHref = user.role === 'teacher' ? '/teacher/quizzes' : '/learner/quizzes'
  const profileHref = user.role === 'teacher' ? '/teacher/profile' : '/learner/profile'

  const NAV = [
    { label: 'Dashboard', href: dashboardHref, icon: LayoutDashboard },
    { label: 'Lessons', href: lessonsHref, icon: BookOpen },
    { label: 'Homework', href: homeworkHref, icon: ClipboardList },
    { label: 'Quizzes', href: quizzesHref, icon: HelpCircle },
    { label: 'Subscription', href: '/subscription', icon: CreditCard },
    { label: 'Profile', href: profileHref, icon: User },
  ]

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={cn('fixed inset-y-0 right-0 z-[70] flex w-[85%] max-w-[380px] flex-col bg-card shadow-2xl transition-transform duration-300 lg:hidden', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="relative px-5 py-6" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:rotate-90 hover:bg-white/30"><X size={18} /></button>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-white/20 text-lg font-semibold text-white">{getInitials(fullName)}</div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{fullName}</p>
              <p className="truncate text-xs capitalize text-white/80">{user.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.href === dashboardHref ? pathname === dashboardHref : pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={onClose} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition', active ? 'text-white' : 'text-foreground hover:bg-muted')} style={active ? { backgroundColor: 'var(--brand-primary)' } : undefined}>
                    <Icon size={18} style={{ color: active ? 'white' : 'var(--brand-accent)' }} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-red-50" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}