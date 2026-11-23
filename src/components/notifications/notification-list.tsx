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

function isLongMessage(message: string) {
  return message.length > 110 || message.includes('\n')
}

export function NotificationList({
  notifications,
  onItemClick,
  compact = false,
  expandedIds,
  onToggleExpand,
}: {
  notifications: Notification[]
  onItemClick: (n: Notification) => void
  compact?: boolean
  expandedIds?: Record<number, boolean>
  onToggleExpand?: (id: number, e?: React.MouseEvent) => void
}) {
  return (
    <div className="divide-y divide-border">
      {notifications.map((n) => {
        const Icon = ICON_MAP[n.type] || Bell
        const isExpanded = !!expandedIds?.[n.id]
        const canExpand = Boolean(onToggleExpand && isLongMessage(n.message))

        return (
          <div
            key={n.id}
            role="button"
            tabIndex={0}
            onClick={() => onItemClick(n)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onItemClick(n)
              }
            }}
            className={cn(
              'flex w-full cursor-pointer items-start gap-3 text-left transition hover:bg-muted/50',
              compact ? 'px-4 py-3' : 'p-4',
              !n.is_read && 'bg-brand-primary/[0.03]'
            )}
          >
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-sm',
                compact ? 'h-8 w-8' : 'h-10 w-10'
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
                <p
                  className={cn(
                    'text-sm leading-tight text-foreground',
                    !isExpanded && 'line-clamp-1',
                    !n.is_read && 'font-semibold'
                  )}
                >
                  {n.title}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatTimeAgo(n.created_at)}
                </span>
              </div>

              <p
                className={cn(
                  'mt-1 text-xs leading-relaxed text-muted-foreground',
                  isExpanded ? 'whitespace-pre-wrap break-words' : 'line-clamp-2 break-words'
                )}
              >
                {n.message}
              </p>

              {canExpand && (
                <button
                  type="button"
                  onClick={(e) => onToggleExpand?.(n.id, e)}
                  className="mt-1.5 inline-block text-xs font-semibold transition hover:underline"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {!n.is_read && (
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}