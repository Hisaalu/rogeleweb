'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileMenu } from './mobile-menu'
import type { SessionUser } from '@/lib/auth'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={user} />

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileMenu
        user={user}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  )
}