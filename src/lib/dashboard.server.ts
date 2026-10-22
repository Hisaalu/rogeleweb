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

function formatTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
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
    percentage_used:
      totalDays > 0
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

type RawQuiz = {
  id: number
  title?: string
  subject_name?: string | null
  class_id?: number | null
  is_published?: boolean
  start_date?: string | null
  end_date?: string | null
  created_at?: string | null
}

type RawHomework = {
  id: number
  title?: string
  subject_name?: string | null
  class_id?: number | null
  is_active?: boolean
  due_date?: string | null
  created_at?: string | null
}

const HORIZON_DAYS = 60

export async function getCalendarEventsServer(): Promise<CalendarEvent[]> {
  const [quizzesRes, homeworkRes] = await Promise.all([
    safeRequest<unknown>('/api/v1/quizzes?per_page=100'),
    safeRequest<unknown>('/api/v1/homework?per_page=100'),
  ])

  const quizzes = unwrapList<RawQuiz>(quizzesRes)
  const homework = unwrapList<RawHomework>(homeworkRes)

  const now = new Date()
  const horizon = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000)

  const events: CalendarEvent[] = []

  for (const q of quizzes) {
    if (q.is_published === false) continue
    const when = q.start_date ?? q.created_at
    if (!when) continue
    const d = new Date(when)
    if (Number.isNaN(d.getTime())) continue
    if (d < now || d > horizon) continue

    events.push({
      id: `quiz-${q.id}`,
      date: d.toISOString(),
      time: formatTime(when),
      title: q.title ?? 'Quiz',
      subject: q.subject_name ?? undefined,
      url: `/learner/quizzes/${q.id}`,
    })
  }

  for (const h of homework) {
    if (h.is_active === false) continue
    const when = h.due_date
    if (!when) continue
    const d = new Date(when)
    if (Number.isNaN(d.getTime())) continue
    if (d < now || d > horizon) continue

    events.push({
      id: `hw-${h.id}`,
      date: d.toISOString(),
      time: formatTime(when),
      title: h.title ?? 'Homework',
      subject: h.subject_name ?? undefined,
      url: `/learner/homework/${h.id}`,
    })
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return events
}

export async function getLearnerDashboardDataServer(): Promise<DashboardData> {
  const [trial, subscription, events] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
    getCalendarEventsServer(),
  ])
  return { trial, subscription, events }
}