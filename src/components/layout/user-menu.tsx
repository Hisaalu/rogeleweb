'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User as UserIcon } from 'lucide-react'
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
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm transition hover:border-brand-accent"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--brand-accent)' }}
        >
          {getInitials(fullName)}
        </span>
        <span className="hidden max-w-[140px] truncate font-medium sm:block">
          {fullName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{fullName}</p>
            {safeUser.email && (
              <p className="truncate text-xs text-muted-foreground">{safeUser.email}</p>
            )}
            <p className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {safeUser.role}
            </p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-muted"
          >
            <UserIcon size={16} />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}