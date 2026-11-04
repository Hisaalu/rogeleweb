import 'server-only'
import { getSessionUser } from './auth'
import { serverApiRequest } from './server-api'

const ANALYTICS_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

export type RecommendationTone = 'success' | 'warning' | 'info'

export interface LearnerRecommendation {
  tone: RecommendationTone
  title: string
  body: string
}

export interface LearnerAnalyticsData {
  learner_id: number
  from: string
  to: string
  interval: string
  homework: {
    submitted: number
    graded: number
    average: number | null
    highest: number | null
    lowest: number | null
  }
  quizzes: {
    attempted: number
    average: number | null
    highest: number | null
    lowest: number | null
  }
  activity: {
    heatmap: number[][]
    heatmap_max: number
    daily_counts: { date: string; count: number }[]
    weekly_counts: { week: string; activities: number }[]
    active_days: number
  }
  trends: {
    homework: { date: string; value: number }[]
    quizzes: { date: string; value: number }[]
  }
  recommendations: LearnerRecommendation[]
}

export type AccessReason = 'ok' | 'trial' | 'trial_expired' | 'no_plan'

export interface LearnerAccessState {
  hasAccess: boolean
  reason: AccessReason
}

export async function getLearnerSubscriptionState(): Promise<LearnerAccessState> {
  const [sub, trial] = await Promise.all([
    serverApiRequest<{ id?: number; status?: string }>(
      '/api/v1/subscriptions/me',
    ).catch(() => null),
    serverApiRequest<{
      is_in_trial?: boolean
      days_remaining?: number
      end_date?: string | null
    }>('/api/v1/trials/me').catch(() => null),
  ])

  console.log('[analytics access] sub =', sub, 'trial =', trial)

  if (sub && sub.status === 'active' && sub.id) {
    return { hasAccess: true, reason: 'ok' }
  }

  if (trial) {
    const endDateMs = trial.end_date ? new Date(trial.end_date).getTime() : NaN
    const endDateLive = Number.isFinite(endDateMs) && endDateMs > Date.now()

    if (trial.is_in_trial === true || endDateLive) {
      return { hasAccess: true, reason: 'trial' }
    }

    if (trial.is_in_trial === false || Number.isFinite(endDateMs)) {
      return { hasAccess: false, reason: 'trial_expired' }
    }
  }

  return { hasAccess: false, reason: 'no_plan' }
}

export async function getLearnerAnalyticsServer(
  from: string,
  to: string,
): Promise<LearnerAnalyticsData | null> {
  const session = await getSessionUser()
  if (!session) {
    console.log('[analytics access] no session')
    return null
  }

  const state = await getLearnerSubscriptionState()
  console.log('[analytics access] decision =', state)
  if (!state.hasAccess) return null

  const url = new URL(`${ANALYTICS_URL}/analytics/learner/overview`)
  url.searchParams.set('learner_id', String(session.id))
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('interval', 'day')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    console.log('[analytics access] python fetch failed', res.status)
    return null
  }
  return (await res.json()) as LearnerAnalyticsData
}