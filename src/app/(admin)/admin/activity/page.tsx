import type { Metadata } from 'next'
import { getRecentActivityServer } from '@/lib/admin.server'
import type { AdminActivityItem } from '@/types/admin'
import { ActivityView } from './activity-view'

export const metadata: Metadata = {
  title: 'Activity',
}

export default async function AdminActivityPage() {
  let initialActivity: AdminActivityItem[] = []
  try {
    // Only load the first 25 items on initial load
    initialActivity = await getRecentActivityServer(25, null)
  } catch {
    initialActivity = []
  }

  return <ActivityView initialActivity={initialActivity} />
}