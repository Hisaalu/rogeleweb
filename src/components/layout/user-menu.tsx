'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User as UserIcon, Settings, Sun, Moon, Monitor, Check } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import type { SessionUser } from '@/lib/auth'

type Theme = 'light' | 'dark' | 'system'

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function UserMenu({ user }: { user?: SessionUser | null }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
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
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <p className="truncate text-sm font-bold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{safeUser.email}</p>
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

            <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Theme
            </div>
            {THEME_OPTIONS.map((opt) => {
              const OptIcon = opt.icon
              const active = theme === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setTheme(opt.value)
                    setOpen(false)
                  }}
                  className={
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ' +
                    (active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-foreground hover:bg-muted')
                  }
                >
                  <span className="flex items-center gap-3">
                    <OptIcon
                      size={16}
                      style={active ? undefined : { color: 'var(--brand-accent)' }}
                    />
                    {opt.label}
                  </span>
                  {active && <Check size={14} />}
                </button>
              )
            })}

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
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