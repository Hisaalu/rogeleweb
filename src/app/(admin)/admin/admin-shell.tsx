'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

const COLLAPSE_KEY = 'rogele.admin.sidebar.collapsed'

export function AdminShell({
  user,
  children,
  contextChip,
}: {
  user: SessionUser
  children: ReactNode
  contextChip?: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
    } catch {
      setCollapsed(false)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated])

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggleCollapsed={toggleCollapsed}
      />

      <div
        className={cn(
          'transition-[padding] duration-200',
          collapsed ? 'lg:pl-20' : 'lg:pl-72',
        )}
      >
        <AdminHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          contextChip={contextChip}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}