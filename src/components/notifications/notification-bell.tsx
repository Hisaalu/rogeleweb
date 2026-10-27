'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listNotificationsClient,
  getUnreadCountClient,
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from '@/lib/notifications.client'
import { cn } from '@/lib/utils'
import { NotificationList } from './notification-list'

export function NotificationBell({
  compact = false,
  viewAllHref = '/notifications',
}: {
  compact?: boolean
  viewAllHref?: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCountClient,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => listNotificationsClient({ per_page: 10 }),
    enabled: open,
    staleTime: 10_000,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsReadClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: markNotificationReadClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleNotificationClick(notification: any) {
    if (!notification.is_read) {
      markOneMutation.mutate(notification.id)
    }
    setOpen(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:h-10 sm:w-10',
          compact && 'h-8 w-8 sm:h-9 sm:w-9',
        )}
      >
        <Bell size={compact ? 18 : 20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-fg px-1 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden" 
            onClick={() => setOpen(false)} 
          />

          <div
            role="menu"
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl',
              'sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl sm:border',
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                    className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline disabled:opacity-50"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground sm:hidden"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                <NotificationList
                  notifications={notifications}
                  onItemClick={handleNotificationClick}
                  compact
                />
              )}
            </div>

            <div className="shrink-0 border-t border-border p-3 sm:p-2">
              <Link
                href={viewAllHref}
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg py-2 text-center text-sm font-medium text-brand-primary transition hover:bg-muted"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}