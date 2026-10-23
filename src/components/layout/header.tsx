'use client'

import Link from 'next/link'
import { Menu, Zap, Crown } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { UserMenu } from './user-menu'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { SessionUser } from '@/lib/auth'

export function Header({
  user,
  onMenuClick,
  isPro,
}: {
  user: SessionUser
  onMenuClick: () => void
  isPro?: boolean 
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:h-[70px] sm:gap-4 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <Link href="/dashboard" className="flex min-w-0 items-center lg:hidden">
          <BrandLogo size={34} showText={false} />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {user.role !== 'teacher' && (
          isPro ? (
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              style={{ backgroundColor: 'var(--success-border)' }}
            >
              <Crown size={13} className="shrink-0" />
              <span>Pro</span>
            </div>
          ) : (
            <Link
              href="/learner/subscription"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              style={{ backgroundColor: 'var(--success-border)' }}
            >
              <Zap size={13} className="shrink-0" />
              <span>Upgrade</span>
            </Link>
          )
        )}
        <NotificationBell compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}