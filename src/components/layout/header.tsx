'use client'

import { Menu } from 'lucide-react'
import { UserMenu } from './user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { useBranding } from '@/components/brand/brand-provider'
import type { SessionUser } from '@/lib/auth'

export function Header({
  user,
  onMenuClick,
}: {
  user: SessionUser
  onMenuClick: () => void
}) {
  const branding = useBranding()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-muted-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="hidden text-sm font-medium text-muted-foreground sm:block">
          {branding.tagline}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <UserMenu user={user} />
      </div>
    </header>
  )
}