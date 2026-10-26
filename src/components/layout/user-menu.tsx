'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User as UserIcon, Settings, Moon, Sun } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import type { SessionUser } from '@/lib/auth'

export function UserMenu({ user }: { user?: SessionUser | null }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const { fullName, rolePath } = useMemo(() => {
    const safeUser = user ?? { id: 0, email: '', role: 'learner' as const }
    const name = [safeUser.first_name, safeUser.last_name].filter(Boolean).join(' ') || safeUser.email || 'User'
    
    let path = '/learner'
    if (safeUser.role === 'admin') path = '/admin'
    else if (safeUser.role === 'teacher') path = '/teacher'
    
    return { fullName: name, rolePath: path }
  }, [user])

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
    setOpen(false)
  }, [isDark, setTheme])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }, [router])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white transition hover:scale-105 hover:shadow-md sm:h-10 sm:w-10 sm:text-sm"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {getInitials(fullName)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <p className="truncate text-sm font-bold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>

          <div className="p-1">
            <Link
              href={`${rolePath}/profile`}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted hover:text-brand-accent"
            >
              <UserIcon size={16} style={{ color: 'var(--brand-accent)' }} />
              Profile
            </Link>
            <Link
              href={`${rolePath}/settings`}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted hover:text-brand-accent"
            >
              <Settings size={16} style={{ color: 'var(--brand-accent)' }} />
              Settings
            </Link>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              onClick={toggleTheme}
              role="menuitem"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-muted hover:text-brand-accent"
            >
              <span className="flex items-center gap-3">
                {isDark ? (
                  <Sun size={16} style={{ color: 'var(--brand-accent)' }} />
                ) : (
                  <Moon size={16} style={{ color: 'var(--brand-accent)' }} />
                )}
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
            </button>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition"
              style={{ color: 'var(--danger-fg)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger-bg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
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