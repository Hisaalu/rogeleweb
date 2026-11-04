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

export interface LearnerSubscriptionState {
  isPaid: boolean
  reason: 'ok' | 'no_plan' | 'trial_expired'
}

export async function getLearnerSubscriptionState(): Promise<LearnerSubscriptionState> {
  const sub = await serverApiRequest<{ id?: number; status?: string }>(
    '/api/v1/subscriptions/me',
  ).catch(() => null)

  if (sub && sub.status === 'active' && sub.id) {
    return { isPaid: true, reason: 'ok' }
  }

  const trial = await serverApiRequest<{ is_in_trial?: boolean }>(
    '/api/v1/trials/me',
  ).catch(() => null)

  if (trial && trial.is_in_trial === false) {
    return { isPaid: false, reason: 'trial_expired' }
  }

  return { isPaid: false, reason: 'no_plan' }
}

export async function getLearnerAnalyticsServer(
  from: string,
  to: string,
): Promise<LearnerAnalyticsData | null> {
  const session = await getSessionUser()
  if (!session) return null

  const state = await getLearnerSubscriptionState()
  if (!state.isPaid) return null

  const url = new URL(`${ANALYTICS_URL}/analytics/learner/overview`)
  url.searchParams.set('learner_id', String(session.id))
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('interval', 'day')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })

  if (!res.ok) return null
  return (await res.json()) as LearnerAnalyticsData
}