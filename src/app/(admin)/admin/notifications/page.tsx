import type { Metadata } from 'next'
import { listBroadcastsServer } from '@/lib/notifications.server'
import { listClassesForFilterServer } from '@/lib/users.server'
import type { Notification } from '@/types/notification'
import type { Class } from '@/types/admin'
import { NotificationsAdminView } from './notifications-admin-view'

export const metadata: Metadata = {
  title: 'Notifications',
}

export const revalidate = 60

export default async function AdminNotificationsPage() {
  const [broadcastsRes, classesRes] = await Promise.allSettled([
    listBroadcastsServer({ per_page: 100 }),
    listClassesForFilterServer(),
  ])

  const broadcasts: Notification[] = broadcastsRes.status === 'fulfilled' ? broadcastsRes.value : []
  const classes: Class[] = classesRes.status === 'fulfilled' ? classesRes.value : []

  return <NotificationsAdminView initialBroadcasts={broadcasts} classes={classes} />
}