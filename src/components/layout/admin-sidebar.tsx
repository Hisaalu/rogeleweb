'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Menu } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { cn } from '@/lib/utils'
import { AdminSidebarNav } from './admin-sidebar-nav'
import { useMountTransition } from './use-mounted-transition'

function SidebarBody({
  collapsed,
  onNavigate,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onNavigate?: () => void
  onToggleCollapsed?: () => void
}) {
  return (
    <>
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-border transition-all duration-200',
          collapsed ? 'justify-center' : 'gap-3 px-4',
        )}
      >
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
        )}

        {!collapsed && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="min-w-0 rounded-md transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            aria-label="Admin dashboard"
          >
            <BrandLogo size={32} />
          </Link>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <AdminSidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </>
  )
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapsed,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onToggleCollapsed: () => void
}) {
  const mounted = useMountTransition(mobileOpen)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen, onClose])

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card shadow-sm transition-[width] duration-200 lg:flex',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <SidebarBody
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
      </aside>

      {mounted && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <div
            className={cn(
              'fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300',
              mobileOpen ? 'opacity-100' : 'opacity-0',
            )}
            onClick={onClose}
            aria-hidden="true"
          />

          <aside
            ref={drawerRef}
            className={cn(
              'relative flex w-full max-w-[280px] flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link
                href="/admin"
                onClick={onClose}
                className="rounded-md transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                <BrandLogo size={32} />
              </Link>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <AdminSidebarNav onNavigate={onClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}