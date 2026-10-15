import 'server-only'
import { serverApiRequest } from './server-api'
import type { AdminPayment } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listPaymentsServer(params: {
  user_id?: number
  status?: string
  per_page?: number
} = {}): Promise<AdminPayment[]> {
  const search = new URLSearchParams()
  search.set('per_page', String(params.per_page ?? 100))
  if (params.user_id) search.set('user_id', String(params.user_id))
  if (params.status) search.set('status', params.status)
  const res = await serverApiRequest<unknown>(
    `/api/v1/payments/all?${search.toString()}`,
  )
  return unwrap<AdminPayment>(res)
}