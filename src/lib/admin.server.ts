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

export async function getRecentActivityServer(limit = 25): Promise<AdminActivityItem[]> {
  const res = await serverApiRequest<unknown>(`/api/v1/admin/activity?limit=${limit}`)
  return unwrapList<AdminActivityItem>(res)
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