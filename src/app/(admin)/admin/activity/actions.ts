'use server'

import { getRecentActivityServer } from '@/lib/admin.server'
import type { AdminActivityItem } from '@/types/admin'

export async function fetchMoreActivity(cursor: string | null): Promise<AdminActivityItem[]> {
  try {
    const activity = await getRecentActivityServer(25, cursor)
    return activity
  } catch {
    return []
  }
}