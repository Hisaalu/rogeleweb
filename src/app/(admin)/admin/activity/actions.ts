'use server'

import { getRecentActivityServer, type ActivityPage } from '@/lib/admin.server'

export async function fetchMoreActivity(cursor: string | null): Promise<ActivityPage> {
  try {
    return await getRecentActivityServer(25, cursor)
  } catch {
    return { items: [], nextCursor: null, hasMore: false }
  }
}