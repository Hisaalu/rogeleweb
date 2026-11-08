'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileMenu } from './mobile-menu'
import type { SessionUser } from '@/lib/auth'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header 
        user={user} 
        onMenuClick={() => setSidebarOpen(true)} 
        isInTrial={isInTrial}
        hasActiveSubscription={hasActiveSubscription}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} />
        
        <MobileMenu 
          user={user} 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto lg:pl-64">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}