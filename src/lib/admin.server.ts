import 'server-only'
import { serverApiRequest } from './server-api'
import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

export async function getAdminOverviewServer(): Promise<AdminOverview> {
  return serverApiRequest<AdminOverview>('/api/v1/admin/stats')
}

export async function getRecentSignupsServer(limit = 10): Promise<AdminUserSummary[]> {
  const res = await serverApiRequest<unknown>(`/api/v1/admin/recent-signups?limit=${limit}`)
  return unwrapList<AdminUserSummary>(res)
}

export async function getRecentPaymentsServer(limit = 10): Promise<AdminPaymentSummary[]> {
  const res = await serverApiRequest<unknown>(`/api/v1/admin/recent-payments?limit=${limit}`)
  return unwrapList<AdminPaymentSummary>(res)
}

export interface ActivityPage {
  items: AdminActivityItem[]
  nextCursor: string | null
  hasMore: boolean
}

export async function getRecentActivityServer(
  limit = 25,
  cursor: string | null = null,
): Promise<ActivityPage> {
  let url = `/api/v1/admin/activity?limit=${limit}`
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`

  const res = await serverApiRequest<unknown>(url)

  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const obj = res as Record<string, any>
    const items = Array.isArray(obj.data) ? (obj.data as AdminActivityItem[]) : []
    return {
      items,
      nextCursor: typeof obj.next_cursor === 'string' ? obj.next_cursor : null,
      hasMore: Boolean(obj.has_more),
    }
  }

  const items = unwrapList<AdminActivityItem>(res)
  return {
    items,
    nextCursor: null,
    hasMore: items.length === limit,
  }
}

export interface ClassLearnerCount {
  class_id: number
  class_name: string
  learner_count: number
}

export async function getLearnersByClassServer(): Promise<ClassLearnerCount[]> {
  const res = await serverApiRequest<unknown>('/api/v1/admin/learners-by-class')
  return unwrapList<ClassLearnerCount>(res)
}