import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listNotificationsServer } from '@/lib/notifications.server'
import type { Notification } from '@/types/notification'
import { NotificationsView } from './notifications-view'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default async function NotificationsPage() {
  const session = await getSessionUser()
  if (!session) return null

  let notifications: Notification[] = []
  try {
    notifications = await listNotificationsServer({ per_page: 100 })
  } catch {
    notifications = []
  }

  return <NotificationsView initialNotifications={notifications} />
}