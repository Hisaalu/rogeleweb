import 'server-only'
import { serverApiRequest } from './server-api'
import { listPlansServer } from './plans.server'
import type { Payment, Subscription, SubscriptionPlan } from '@/types/subscription'
import type { AdminSubscription } from '@/types/admin'

export interface SubscriptionsPage {
  subscriptions: AdminSubscription[]
  meta: {
    page: number
    per_page: number
    total: number
    last_page: number
  }
}

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
} = {}): Promise<SubscriptionsPage> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  if (params.status) search.set('status', params.status)

  const res = await serverApiRequest<unknown>(
    `/api/v1/subscriptions/all?${search.toString()}`,
  )
  const subscriptions = unwrap<AdminSubscription>(res)

  let meta = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 50,
    total: subscriptions.length,
    last_page: 1,
  }
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const obj = res as Record<string, any>
    if (obj.meta) {
      meta = {
        page: Number(obj.meta.page ?? meta.page),
        per_page: Number(obj.meta.per_page ?? meta.per_page),
        total: Number(obj.meta.total ?? subscriptions.length),
        last_page: Number(obj.meta.last_page ?? 1),
      }
    }
  }

  return { subscriptions, meta }
}

export async function listActivePlansServer(): Promise<SubscriptionPlan[]> {
  const all = await listPlansServer({ per_page: 100 })
  return all
    .filter((p) => p.is_active !== false)
    .filter((p) => p.price > 0)
    .sort((a, b) => a.price - b.price)
}

export async function getMySubscriptionServer(): Promise<Subscription | null> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/subscriptions/me')
    if (!res || typeof res !== 'object') return null
    const r = res as Record<string, unknown>
    if (!r.id) return null
    return {
      id: Number(r.id),
      user_id: r.user_id != null ? Number(r.user_id) : undefined,
      plan_id: r.plan_id != null ? Number(r.plan_id) : undefined,
      plan_type: String(r.plan_type ?? ''),
      status: String(r.status ?? ''),
      amount: r.amount != null ? Number(r.amount) : undefined,
      start_date: String(r.start_date ?? ''),
      end_date: String(r.end_date ?? ''),
      payment_method: r.payment_method as string | undefined,
      transaction_id: r.transaction_id as string | undefined,
      created_at: r.created_at as string | undefined,
    }
  } catch {
    return null
  }
}

export async function listMyPaymentsServer(): Promise<Payment[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/payments/me')
    return unwrap<Payment>(res)
  } catch {
    return []
  }
}