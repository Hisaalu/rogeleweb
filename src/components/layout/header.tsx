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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-muted-foreground transition hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell compact />
        <ThemeToggle compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}