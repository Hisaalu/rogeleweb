import Link from 'next/link'
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
            <div className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              compact ? "h-8 w-8" : "h-10 w-10",
              n.is_read ? "bg-muted text-muted-foreground" : "bg-brand-primary/10 text-brand-primary"
            )}>
              <Icon size={compact ? 14 : 18} />
            </div>
            
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={cn(
                "text-sm leading-tight text-foreground",
                !n.is_read && "font-semibold"
              )}>
                {n.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {n.message}
              </p>
            </div>
            
            {!n.is_read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}