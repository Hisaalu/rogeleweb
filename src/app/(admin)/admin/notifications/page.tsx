import type { Metadata } from 'next'
import { listBroadcastsServer } from '@/lib/notifications.server'
import type { Notification } from '@/types/notification'
import { NotificationsAdminView } from './notifications-admin-view'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default async function AdminNotificationsPage() {
  let broadcasts: Notification[] = []
  try {
    broadcasts = await listBroadcastsServer({ per_page: 100 })
  } catch {
    broadcasts = []
  }

  return <NotificationsAdminView initialBroadcasts={broadcasts} />
}