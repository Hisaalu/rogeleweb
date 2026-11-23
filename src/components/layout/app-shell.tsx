'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileMenu } from './mobile-menu'
import { PageHeaderProvider, usePageHeader } from './page-header-context'
import { PageHeaderBar } from './page-header'
import type { SessionUser } from '@/lib/auth'

function ShellBody({
  user,
  isInTrial,
  hasActiveSubscription,
  children,
}: {
  user: SessionUser
  isInTrial?: boolean
  hasActiveSubscription?: boolean
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { header } = usePageHeader()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />

      <MobileMenu
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 lg:pl-64">
        {header ? (
          <PageHeaderBar
            title={header.title}
            fallbackHref={header.fallbackHref}
            action={header.action}
          />
        ) : (
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            isInTrial={isInTrial}
            hasActiveSubscription={hasActiveSubscription}
          />
        )}

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppShell({
  user,
  isInTrial,
  hasActiveSubscription,
  children,
}: {
  user: SessionUser
  isPro?: boolean
  isInTrial?: boolean
  hasActiveSubscription?: boolean
  children: React.ReactNode
}) {
  return (
    <PageHeaderProvider>
      <ShellBody
        user={user}
        isInTrial={isInTrial}
        hasActiveSubscription={hasActiveSubscription}
      >
        {children}
      </ShellBody>
    </PageHeaderProvider>
  )
}