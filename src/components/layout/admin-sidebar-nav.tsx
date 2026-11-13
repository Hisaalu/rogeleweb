'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ADMIN_NAV_SECTIONS, resolveActiveHref } from './admin-nav-config'

export const AdminSidebarNav = React.memo(function AdminSidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const activeHref = resolveActiveHref(pathname)

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    onNavigate?.()
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }, [router, onNavigate])

  return (
    <>
      <nav
        aria-label="Admin"
        className={cn(
          'flex-1 overflow-y-auto overscroll-contain py-4 no-scrollbar',
          collapsed ? 'px-2' : 'px-3',
        )}
      >
        {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={cn(sectionIndex > 0 && (collapsed ? 'mt-4' : 'mt-6'))}
          >
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.href === activeHref
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-lg text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        collapsed
                          ? 'h-10 w-full justify-center'
                          : 'gap-3 px-3 py-2.5',
                        active
                          ? 'nav-active'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'shrink-0 transition-colors',
                          active
                            ? 'text-brand-accent'
                            : 'text-brand-accent/70 group-hover:text-brand-accent',
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-border py-3',
          collapsed ? 'px-2' : 'px-3',
        )}
      >
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label={collapsed ? 'Sign out' : undefined}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'group flex w-full items-center rounded-lg text-sm font-semibold transition-colors',
            'hover:bg-danger-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-border focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5',
          )}
          style={{ color: 'var(--danger-fg)' }}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>}
        </button>
      </div>
    </>
  )
})