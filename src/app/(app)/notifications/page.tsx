import type { Metadata } from 'next'
import { listNotificationsServer } from '@/lib/notifications.server'
import type { Notification } from '@/types/notification'
import { NotificationsView } from './notifications-view'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default async function NotificationsPage() {
  let notifications: Notification[] = []
  try {
    notifications = await listNotificationsServer({ per_page: 100 })
  } catch {
    notifications = []
  }

  return <NotificationsView initialNotifications={notifications} />
}