import type { Metadata } from 'next'
import { getRecentActivityServer, type ActivityPage } from '@/lib/admin.server'
import { ActivityView } from './activity-view'

export const metadata: Metadata = {
  title: 'Activity',
}

export default async function AdminActivityPage() {
  let initial: ActivityPage = { items: [], nextCursor: null, hasMore: false }
  try {
    initial = await getRecentActivityServer(25, null)
  } catch {
    initial = { items: [], nextCursor: null, hasMore: false }
  }

  return (
    <ActivityView
      initialActivity={initial.items}
      initialNextCursor={initial.nextCursor}
      initialHasMore={initial.hasMore}
    />
  )
}