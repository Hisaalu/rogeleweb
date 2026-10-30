'use client'

import { useMemo, useState } from 'react'
import { Check, Bell, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <Bell size={26} className="shrink-0" />
            <span>Notifications</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : "You're all caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAll}
            disabled={marking}
            className="w-full shrink-0 sm:w-auto"
          >
            <Check size={14} className="mr-2" />
            {marking ? 'Marking...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full overflow-x-auto pb-2 lg:w-auto lg:pb-0">
            <div className="flex gap-2">
              {FILTERS.map((f) => {
                const isActive = filter === f.value
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className="shrink-0 rounded-sm border px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      backgroundColor: isActive
                        ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)'
                        : 'hsl(var(--background))',
                      borderColor: isActive ? 'var(--brand-primary)' : 'hsl(var(--border))',
                      color: isActive ? 'var(--brand-primary)' : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border pt-4 lg:justify-end lg:border-t-0 lg:pt-0">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="h-4 w-4 rounded-sm border-input"
                style={{ accentColor: 'var(--brand-primary)' }}
              />
              Show unread only
            </label>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            icon={showUnreadOnly || filter !== 'all' ? CheckCircle2 : Bell}
            title={showUnreadOnly || filter !== 'all' ? "No matching notifications" : "No notifications yet"}
            description={
              showUnreadOnly
                ? 'You have no unread notifications.'
                : filter !== 'all'
                  ? 'No notifications match the selected filter.'
                  : 'When you receive updates about lessons or quizzes, they will appear here.'
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <NotificationList
            notifications={filtered}
            onItemClick={handleMarkOne}
          />
        </Card>
      )}
    </div>
  )
}