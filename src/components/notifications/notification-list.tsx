'use client'

import { Bell, BookOpen, CreditCard, HelpCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notification'

const ICON_MAP: Record<string, any> = {
  homework: BookOpen,
  quiz: HelpCircle,
  lesson: BookOpen,
  payment: CreditCard,
  subscription: CreditCard,
  trial: Info,
  announcement: Bell,
  system: Info,
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`

  const years = Math.floor(days / 365)
  return `${years}y`
}

export function NotificationList({
  notifications,
  onItemClick,
  compact = false,
}: {
  notifications: Notification[]
  onItemClick: (n: Notification) => void
  compact?: boolean
}) {
  return (
    <div className="divide-y divide-border">
      {notifications.map((n) => {
        const Icon = ICON_MAP[n.type] || Bell
        
        return (
          <button
            key={n.id}
            onClick={() => onItemClick(n)}
            className={cn(
              'flex w-full items-start gap-3 text-left transition hover:bg-muted/50',
              compact ? 'px-4 py-3' : 'p-4',
              !n.is_read && 'bg-brand-primary/[0.03]'
            )}
          >
            <div 
              className={cn(
                "flex shrink-0 items-center justify-center rounded-sm",
                compact ? "h-8 w-8" : "h-10 w-10"
              )}
              style={{
                backgroundColor: !n.is_read 
                  ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' 
                  : 'hsl(var(--muted))',
                color: !n.is_read ? 'var(--brand-primary)' : 'hsl(var(--muted-foreground))',
              }}
            >
              <Icon size={compact ? 14 : 18} />
            </div>
            
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn(
                  "line-clamp-1 text-sm leading-tight text-foreground",
                  !n.is_read && "font-semibold"
                )}>
                  {n.title}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatTimeAgo(n.created_at)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {n.message}
              </p>
            </div>
            
            {!n.is_read && (
              <span 
                className="mt-2 h-2 w-2 shrink-0 rounded-full" 
                style={{ backgroundColor: 'var(--brand-accent)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}