import 'server-only'
import { serverApiRequest } from './server-api'
import type { SubscriptionPlan } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listPlansServer(params: {
  page?: number
  per_page?: number
  q?: string
} = {}): Promise<SubscriptionPlan[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.q) search.set('q', params.q)
  const query = search.toString()
  const path = query
    ? `/api/v1/subscription-plans?${query}`
    : '/api/v1/subscription-plans?per_page=100'
  const res = await serverApiRequest<unknown>(path)
  return unwrap<SubscriptionPlan>(res)
}