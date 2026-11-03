import 'server-only'
import { serverApiRequest } from './server-api'
import type { AdminPayment } from '@/types/admin'

export interface AdminPaymentsPage {
  payments: AdminPayment[]
  meta: {
    page: number
    per_page: number
    total: number
    last_page: number
  }
}

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

export async function listPaymentsServer(params: {
  user_id?: number
  status?: string
  page?: number
  per_page?: number
} = {}): Promise<AdminPaymentsPage> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  if (params.user_id) search.set('user_id', String(params.user_id))
  if (params.status) search.set('status', params.status)

  const res = await serverApiRequest<unknown>(`/api/v1/payments/all?${search.toString()}`)
  const payments = unwrapList<AdminPayment>(res)

  let meta = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 50,
    total: payments.length,
    last_page: 1,
  }
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const obj = res as Record<string, any>
    if (obj.meta) {
      meta = {
        page: Number(obj.meta.page ?? meta.page),
        per_page: Number(obj.meta.per_page ?? meta.per_page),
        total: Number(obj.meta.total ?? payments.length),
        last_page: Number(obj.meta.last_page ?? 1),
      }
    }
  }

  return { payments, meta }
}