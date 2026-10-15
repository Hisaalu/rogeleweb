'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getUnreadCountClient,
  listNotificationsClient,
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from '@/lib/notifications.client'
import type { Notification } from '@/types/notification'
import { NotificationList } from './notification-list'

const POLL_MS = 30_000

export function NotificationBell({
  compact = false,
  viewAllHref = '/notifications',
}: {
  compact?: boolean
  viewAllHref?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const refreshCount = useCallback(async () => {
    try {
      const count = await getUnreadCountClient()
      setUnread(count)
    } catch {
      // silently ignore
    }
  }, [])

  const loadRecent = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listNotificationsClient({ per_page: 10 })
      setNotifications(items)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCount()
    const interval = setInterval(refreshCount, POLL_MS)
    return () => clearInterval(interval)
  }, [refreshCount])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) void loadRecent()
  }

  async function handleItemClick(n: Notification) {
    if (!n.is_read) {
      try {
        await markNotificationReadClient(n.id)
        setNotifications((list) =>
          list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
        )
        setUnread((c) => Math.max(0, c - 1))
      } catch {
        // ignore
      }
    }
    setOpen(false)
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    try {
      await markAllNotificationsReadClient()
      setNotifications((list) => list.map((n) => ({ ...n, is_read: true })))
      await refreshCount()
    } finally {
      setMarkingAll(false)
    }
  }

  function handleViewAll() {
    setOpen(false)
    router.push(viewAllHref)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
        className={cn(
          'relative flex h-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-brand-accent',
          compact ? 'w-9' : 'gap-2 px-3',
        )}
      >
        <Bell size={15} />
        {!compact && <span className="text-xs font-medium">Notifications</span>}
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:w-[400px]">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {notifications.some((n) => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markingAll}
                className="text-xs font-medium text-brand-primary transition hover:underline disabled:opacity-50"
              >
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </header>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                onItemClick={handleItemClick}
                compact
              />
            )}
          </div>

          <footer className="border-t border-border bg-muted/30 px-4 py-2.5">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full text-center text-xs font-medium text-brand-primary transition hover:underline"
            >
              View all notifications
            </button>
          </footer>
        </div>
      )}
    </div>
  )
}