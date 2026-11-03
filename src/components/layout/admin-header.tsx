'use client'

import { Menu } from 'lucide-react'
import { UserMenu } from '@/components/layout/user-menu'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useBranding } from '@/components/brand/brand-provider'
import type { SessionUser } from '@/lib/auth'
import type { ReactNode } from 'react'

export function AdminHeader({
  user,
  onMenuClick,
  contextChip,
}: {
  user: SessionUser
  onMenuClick: () => void
  contextChip?: ReactNode
}) {
  const branding = useBranding()
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col min-w-0 lg:hidden">
          <span className="truncate text-sm font-semibold text-foreground">
            {branding.schoolName}
          </span>
          {branding.tagline && (
            <span className="truncate text-[11px] text-muted-foreground">
              {branding.tagline}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {contextChip}
        <NotificationBell compact viewAllHref="/admin/notifications" />
        <UserMenu user={user} />
        <div className="hidden min-w-0 flex-col items-end pl-1 sm:flex">
          <span className="max-w-[12rem] truncate text-xs font-semibold text-foreground">
            {fullName}
          </span>
          <span className="max-w-[12rem] truncate text-[11px] capitalize text-muted-foreground">
            {user.role}
          </span>
        </div>
      </div>
    </header>
  )
}