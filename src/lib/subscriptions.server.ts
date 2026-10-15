import 'server-only'
import { serverApiRequest } from './server-api'
import type { AdminSubscription } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listSubscriptionsServer(params: {
  user_id?: number
  status?: string
  per_page?: number
} = {}): Promise<AdminSubscription[]> {
  const search = new URLSearchParams()
  search.set('per_page', String(params.per_page ?? 200))
  if (params.user_id) search.set('user_id', String(params.user_id))
  if (params.status) search.set('status', params.status)
  const res = await serverApiRequest<unknown>(
    `/api/v1/subscriptions/all?${search.toString()}`,
  )
  return unwrap<AdminSubscription>(res)
}