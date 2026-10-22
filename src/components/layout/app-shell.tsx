'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileMenu } from './mobile-menu'
import type { SessionUser } from '@/lib/auth'

export function AppShell({
  user,
  children,
  isPro,
}: {
  user: SessionUser
  children: ReactNode
  isPro?: boolean
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header user={user} onMenuClick={() => setMobileOpen(true)} isPro={isPro} />
        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
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