import 'server-only'
import { serverApiRequest } from './server-api'
import type { User } from '@/types/api'
import type { Class } from '@/types/admin'
import type { SubscriptionSummary, TrialStatus } from '@/types/dashboard'

export async function getProfileServer(): Promise<User | null> {
  try {
    return await serverApiRequest<User>('/api/v1/auth/me')
  } catch {
    return null
  }
}

export async function getClassesServer(): Promise<Class[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
    if (Array.isArray(res)) return res as Class[]
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}

export async function getTrialStatusServer(): Promise<TrialStatus | null> {
  try {
    const res = await serverApiRequest<any>('/api/v1/trials/me')
    if (!res) return null
    return {
      is_in_trial: Boolean(res.is_in_trial ?? (res.days > 0 && !!res.end_date)),
      days_remaining: Number(res.days_remaining ?? res.days ?? 0),
      end_date: res.end_date ?? null,
      total_days: Number(res.total_days ?? 60),
      percentage_used: 0,
    }
  } catch {
    return null
  }
}

export async function getActiveSubscriptionServer(): Promise<SubscriptionSummary | null> {
  try {
    const res = await serverApiRequest<any>('/api/v1/subscriptions/me')
    if (!res || !res.id) return null
    return {
      id: Number(res.id),
      plan_type: String(res.plan_type),
      status: String(res.status),
      start_date: String(res.start_date),
      end_date: String(res.end_date),
    }
  } catch {
    return null
  }
}