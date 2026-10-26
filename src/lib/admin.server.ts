import 'server-only'
import { serverApiRequest } from './server-api'
import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'

export async function getAdminOverviewServer(): Promise<AdminOverview> {
  return serverApiRequest<AdminOverview>('/api/v1/admin/stats')
}

export async function getRecentSignupsServer(limit = 10): Promise<AdminUserSummary[]> {
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/recent-signups?limit=${limit}`,
  )
  if (Array.isArray(res)) return res as AdminUserSummary[]
  return []
}

export async function getRecentPaymentsServer(limit = 10): Promise<AdminPaymentSummary[]> {
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/recent-payments?limit=${limit}`,
  )
  if (Array.isArray(res)) return res as AdminPaymentSummary[]
  return []
}

export async function getRecentActivityServer(
  limit: number = 25, 
  cursor: string | null = null
): Promise<AdminActivityItem[]> {
  let url = `/api/v1/admin/activity?limit=${limit}`
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`
  }
  
  const res = await serverApiRequest<unknown>(url)
  return Array.isArray(res) ? (res as AdminActivityItem[]) : []
}

export interface ClassLearnerCount {
  class_id: number
  class_name: string
  learner_count: number
}

export async function getLearnersByClassServer(): Promise<ClassLearnerCount[]> {
  const res = await serverApiRequest<unknown>('/api/v1/admin/learners-by-class')
  return Array.isArray(res) ? (res as ClassLearnerCount[]) : []
}

export async function getRecentActivityServerV2(limit = 20): Promise<AdminActivityItem[]> {
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/activity?limit=${limit}`,
  )
  return Array.isArray(res) ? (res as AdminActivityItem[]) : []
}