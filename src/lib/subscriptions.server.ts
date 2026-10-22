import 'server-only'
import { serverApiRequest } from './server-api'
import { listPlansServer } from './plans.server'
import type { Payment, Subscription, SubscriptionPlan } from '@/types/subscription'

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
    if (Array.isArray(res)) return res as Payment[]
    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>
      if (Array.isArray(obj.data)) return obj.data as Payment[]
      if (Array.isArray(obj.value)) return obj.value as Payment[]
    }
    return []
  } catch {
    return []
  }
}
