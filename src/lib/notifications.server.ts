import 'server-only'
import { serverApiRequest } from './server-api'
import type { Notification } from '@/types/notification'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listNotificationsServer(params: {
  page?: number
  per_page?: number
} = {}): Promise<Notification[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  const res = await serverApiRequest<unknown>(
    `/api/v1/notifications/me?${search.toString()}`,
  )
  return unwrap<Notification>(res)
}

export async function getUnreadCountServer(): Promise<number> {
  const res = await serverApiRequest<{ count: number }>(
    '/api/v1/notifications/me/unread-count',
  )
  return res?.count ?? 0
}

export async function listBroadcastsServer(params: {
  page?: number
  per_page?: number
} = {}): Promise<Notification[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/notifications?${search.toString()}`,
  )
  return unwrap<Notification>(res)
}