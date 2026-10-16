import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'

async function proxy<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  return data as T
}

export async function getAdminOverviewClient(): Promise<AdminOverview> {
  return proxy<AdminOverview>('/admin/stats')
}

export async function getRecentSignupsClient(limit = 10): Promise<AdminUserSummary[]> {
  const res = await proxy<unknown>(`/admin/recent-signups?limit=${limit}`)
  return Array.isArray(res) ? (res as AdminUserSummary[]) : []
}

export async function getRecentPaymentsClient(limit = 10): Promise<AdminPaymentSummary[]> {
  const res = await proxy<unknown>(`/admin/recent-payments?limit=${limit}`)
  return Array.isArray(res) ? (res as AdminPaymentSummary[]) : []
}

export async function getRecentActivityClient(limit = 200): Promise<AdminActivityItem[]> {
  const res = await proxy<unknown>(`/admin/activity?limit=${limit}`)
  return Array.isArray(res) ? (res as AdminActivityItem[]) : []
}
