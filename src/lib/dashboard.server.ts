import 'server-only'
import { serverApiRequest } from './server-api'
import type {
  CalendarEvent,
  DashboardData,
  SubscriptionSummary,
  TrialStatus,
} from '@/types/dashboard'

async function safeRequest<T>(path: string): Promise<T | null> {
  try {
    return await serverApiRequest<T>(path)
  } catch {
    return null
  }
}

export async function getTrialStatusServer(): Promise<TrialStatus | null> {
  const res = await safeRequest<unknown>('/api/v1/trials/me')
  if (!res || typeof res !== 'object') return null

  const r = res as Record<string, unknown>
  const daysRemaining = Number(r.days_remaining ?? r.days ?? 0)
  const totalDays = Number(r.total_days ?? 60)
  const endDate = (r.end_date as string | undefined) ?? null
  const isInTrial = Boolean(r.is_in_trial ?? (daysRemaining > 0 && !!endDate))

  return {
    is_in_trial: isInTrial,
    days_remaining: Number.isFinite(daysRemaining) ? daysRemaining : 0,
    end_date: endDate,
    total_days: totalDays > 0 ? totalDays : 60,
    percentage_used: totalDays > 0
      ? Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100))
      : 0,
  }
}

export async function getActiveSubscriptionServer(): Promise<SubscriptionSummary | null> {
  const res = await safeRequest<unknown>('/api/v1/subscriptions/me')
  if (!res || typeof res !== 'object') return null

  const r = res as Record<string, unknown>
  if (!r.id || !r.status) return null

  return {
    id: Number(r.id),
    plan_type: String(r.plan_type ?? 'plan'),
    status: String(r.status),
    amount: r.amount != null ? Number(r.amount) : undefined,
    start_date: String(r.start_date ?? ''),
    end_date: String(r.end_date ?? ''),
    payment_method: r.payment_method as string | undefined,
    transaction_id: r.transaction_id as string | undefined,
  }
}

export async function getCalendarEventsServer(): Promise<CalendarEvent[]> {
  const res = await safeRequest<unknown>('/api/v1/dashboard/events')
  if (Array.isArray(res)) return res as CalendarEvent[]
  return []
}

export async function getDashboardDataServer(): Promise<DashboardData> {
  const [trial, subscription, events] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
    getCalendarEventsServer(),
  ])
  return { trial, subscription, events }
}