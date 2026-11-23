'use client'

import Link from 'next/link'
import { Menu, Rocket } from 'lucide-react'
import { useBranding } from '@/components/brand/brand-provider'
import { UserMenu } from './user-menu'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { SessionUser } from '@/lib/auth'

export function Header({
  user,
  onMenuClick,
  hasActiveSubscription,
}: {
  user: SessionUser
  onMenuClick: () => void
  isInTrial?: boolean
  hasActiveSubscription?: boolean
}) {
  const dashboardHref =
    user.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard'

  const branding = useBranding()
  const schoolName = branding.schoolName?.trim() || 'Dashboard'
  const tagline = branding.tagline?.trim()

  const showUpgrade = user.role !== 'teacher' && !hasActiveSubscription

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-border/60 bg-background/70 px-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-background/60 sm:h-[70px] sm:gap-4 sm:px-5 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20"
      />

      <div className="relative flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/40 text-foreground ring-1 ring-inset ring-white/20 transition hover:bg-muted/80 lg:hidden"
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

      <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-3">
        {showUpgrade && (
          <Link
            href="/learner/subscription"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ring-inset ring-white/30 backdrop-blur-md transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-accent) 18%, transparent)',
              color: 'var(--brand-accent)',
            }}
          >
            <Rocket size={12} className="shrink-0" />
            <span>Upgrade</span>
          </Link>
        )}

        <NotificationBell compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}