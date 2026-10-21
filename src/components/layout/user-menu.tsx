'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

export function UserMenu({ user }: { user?: SessionUser | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const safeUser = user ?? { id: 0, email: '', role: 'learner' }
  const fullName =
    [safeUser.first_name, safeUser.last_name].filter(Boolean).join(' ') ||
    safeUser.email ||
    'User'

  const rolePath = safeUser.role === 'teacher' ? '/teacher' : '/learner'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition hover:scale-105 hover:shadow-md"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {getInitials(fullName)}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <p className="truncate text-sm font-bold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{safeUser.email}</p>
          </div>

          <div className="p-1">
            <Link
              href={`${rolePath}/profile`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted hover:text-brand-accent"
            >
              <UserIcon size={16} style={{ color: 'var(--brand-accent)' }} />
              Profile
            </Link>
            <Link
              href={`${rolePath}/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted hover:text-brand-accent"
            >
              <Settings size={16} style={{ color: 'var(--brand-accent)' }} />
              Settings
            </Link>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}