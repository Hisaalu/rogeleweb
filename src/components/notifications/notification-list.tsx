'use client'

import { useRouter } from 'next/navigation'
import {
  Bell,
  CreditCard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Megaphone,
  Sparkles,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notification'

const ICONS: Record<NotificationType, LucideIcon> = {
  homework: ClipboardList,
  quiz: HelpCircle,
  lesson: BookOpen,
  payment: CreditCard,
  subscription: CreditCard,
  trial: Clock,
  announcement: Megaphone,
  system: Sparkles,
}

function relativeTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationList({
  notifications,
  onItemClick,
  emptyLabel = 'No notifications yet',
  compact = false,
}: {
  notifications: Notification[]
  onItemClick?: (n: Notification) => void
  emptyLabel?: string
  compact?: boolean
}) {
  const router = useRouter()

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <Bell size={20} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  function handleClick(n: Notification) {
    onItemClick?.(n)
    if (n.link && n.link.trim() !== '') {
      router.push(n.link)
    }
  }

  return (
    <ul className="divide-y divide-border">
      {notifications.map((n) => {
        const Icon = ICONS[n.type] ?? Bell
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => handleClick(n)}
              className={cn(
                'flex w-full items-start gap-3 text-left transition hover:bg-muted/60',
                compact ? 'px-4 py-3' : 'px-4 py-4',
                !n.is_read && 'bg-brand-primary/5',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  n.is_read ? 'bg-muted' : 'bg-brand-primary/15',
                )}
              >
                <Icon
                  size={14}
                  className={n.is_read ? 'text-muted-foreground' : 'text-brand-primary'}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'truncate text-sm',
                      n.is_read ? 'text-foreground' : 'font-semibold text-foreground',
                    )}
                  >
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                  )}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                  {n.message}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
                  {relativeTime(n.created_at)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}