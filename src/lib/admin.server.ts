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

export async function getRecentActivityServer(limit = 20): Promise<AdminActivityItem[]> {
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/activity?limit=${limit}`,
  )
  if (Array.isArray(res)) return res as AdminActivityItem[]
  return []
}