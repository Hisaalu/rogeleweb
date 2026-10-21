'use client'

import { Menu } from 'lucide-react'
import { UserMenu } from './user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { SessionUser } from '@/lib/auth'

export function Header({
  user,
  onMenuClick,
}: {
  user: SessionUser
  onMenuClick: () => void
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {user.role !== 'teacher' && (
          <a
            href="/subscription"
            className="hidden items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 sm:flex lg:hidden"
          >
            Upgrade
          </a>
        )}
        <NotificationBell compact />
        <ThemeToggle compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}