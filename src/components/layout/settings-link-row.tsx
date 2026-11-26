'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function SettingsLinkRow({
  icon: Icon,
  label,
  href,
}: {
  icon?: LucideIcon
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-md px-2 py-3.5 transition hover:bg-muted/60"
    >
      <div className="flex min-w-0 items-center gap-4">
        {Icon && (
          <Icon size={22} strokeWidth={1.9} className="shrink-0 text-foreground" />
        )}
        <span className="truncate text-[16px] text-foreground">
          {label}
        </span>
      </div>
      <ChevronRight size={20} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
    </Link>
  )
}