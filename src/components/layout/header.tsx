'use client'

import Link from 'next/link'
import { Menu, Zap, Crown } from 'lucide-react'
import { useBranding } from '@/components/brand/brand-provider'
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
  const dashboardHref =
    user.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard'

  const branding = useBranding()
  const schoolName = branding.schoolName?.trim() || 'Dashboard'
  const tagline = branding.tagline?.trim()

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:h-[70px] sm:gap-4 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-foreground transition hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <Link
          href={dashboardHref}
          aria-label={`${schoolName} — Go to Dashboard`}
          className="flex min-w-0 flex-col justify-center transition-opacity hover:opacity-80 lg:hidden"
        >
          <span className="truncate text-sm font-medium leading-tight text-foreground">
            {schoolName}
          </span>
          {tagline && (
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              {tagline}
            </span>
          )}
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {user.role !== 'teacher' &&
          (isPro ? (
            <div
              className="flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11px] text-white shadow-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--success-border) 70%, transparent)',
              }}
            >
              <Crown size={12} className="shrink-0" />
              <span>Pro</span>
            </div>
          ) : (
            <Link
              href="/learner/subscription"
              className="flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] text-white shadow-sm transition hover:opacity-80 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--success-border) 70%, transparent)',
              }}
            >
              <Zap size={12} className="shrink-0" />
              <span>Upgrade</span>
            </Link>
          ))}
        <NotificationBell compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}