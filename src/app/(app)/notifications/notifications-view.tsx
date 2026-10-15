'use client'

import { useMemo, useState } from 'react'
import { Check, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from '@/lib/notifications.client'
import { NotificationList } from '@/components/notifications/notification-list'
import type { Notification, NotificationType } from '@/types/notification'

const FILTERS: Array<{ label: string; value: NotificationType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Homework', value: 'homework' },
  { label: 'Quizzes', value: 'quiz' },
  { label: 'Lessons', value: 'lesson' },
  { label: 'Payments', value: 'payment' },
  { label: 'Announcements', value: 'announcement' },
]

export function NotificationsView({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications,
  )
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [marking, setMarking] = useState(false)

  const filtered = useMemo(() => {
    let list = notifications
    if (filter !== 'all') list = list.filter((n) => n.type === filter)
    if (showUnreadOnly) list = list.filter((n) => !n.is_read)
    return list
  }, [notifications, filter, showUnreadOnly])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function handleMarkAll() {
    setMarking(true)
    try {
      await markAllNotificationsReadClient()
      setNotifications((list) => list.map((n) => ({ ...n, is_read: true })))
    } finally {
      setMarking(false)
    }
  }

  async function handleMarkOne(n: Notification) {
    if (n.is_read) return
    try {
      await markNotificationReadClient(n.id)
      setNotifications((list) =>
        list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      )
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You are all caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll} disabled={marking}>
            <Check size={14} />
            {marking ? 'Marking...' : 'Mark all read'}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              filter === f.value
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-border text-muted-foreground hover:border-brand-accent'
            }`}
          >
            {f.label}
          </button>
        ))}

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Unread only
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing here"
          description={
            showUnreadOnly
              ? 'You have no unread notifications.'
              : 'No notifications match the selected filter.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <NotificationList
            notifications={filtered}
            onItemClick={handleMarkOne}
          />
        </div>
      )}
    </div>
  )
}