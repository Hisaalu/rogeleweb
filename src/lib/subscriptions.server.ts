import 'server-only'
import { serverApiRequest } from './server-api'
import type { AdminSubscription } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>
      if (Array.isArray(nested.items)) return nested.items as T[]
      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }
  return []
}

export async function listSubscriptionsServer(params: {
  page?: number
  per_page?: number
  status?: string
} = {}): Promise<AdminSubscription[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  search.set('per_page', String(params.per_page ?? 200))
  if (params.status) search.set('status', params.status)
  
  const query = search.toString()
  const path = query ? `/api/v1/subscriptions/all?${query}` : '/api/v1/subscriptions/all'

  const res = await serverApiRequest<unknown>(path)
  return unwrap<AdminSubscription>(res)
}