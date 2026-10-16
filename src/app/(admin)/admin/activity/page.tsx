import type { Metadata } from 'next'
import { getRecentActivityServer } from '@/lib/admin.server'
import type { AdminActivityItem } from '@/types/admin'
import { ActivityView } from './activity-view'

export const metadata: Metadata = {
  title: 'Activity',
}

export default async function AdminActivityPage() {
  let activity: AdminActivityItem[] = []
  try {
    activity = await getRecentActivityServer(500)
  } catch {
    activity = []
  }

  return <ActivityView initialActivity={activity} />
}