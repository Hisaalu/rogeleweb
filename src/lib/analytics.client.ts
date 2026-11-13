export interface EnrollmentPoint {
  period: string
  count: number
  moving_average: number | null
}

export interface EnrollmentTrend {
  interval: string
  from: string
  to: string
  points: EnrollmentPoint[]
  total: number
}

export interface RevenuePoint {
  period: string
  amount: number
  count: number
  cumulative: number
}

export interface RevenueSeries {
  interval: string
  from: string
  to: string
  points: RevenuePoint[]
  total: number
  total_count: number
}

export interface ScoreBucket {
  label: string
  min: number
  max: number
  count: number
}

export interface ScoreDistribution {
  buckets: ScoreBucket[]
  total: number
  average: number
  median: number
  pass_count: number
  fail_count: number
  passing_pct: number
}

export interface HeatmapData {
  grid: number[][]
  max: number
  total: number
}

export interface RetentionWeek {
  week: number
  active: number
  pct: number
}

export interface RetentionCohort {
  cohort_week: string
  cohort_size: number
  weeks: RetentionWeek[]
}

export interface RetentionData {
  cohorts: RetentionCohort[]
  weeks: number
}

export interface AtRiskLearner {
  user_id: number
  email: string
  first_name: string | null
  last_name: string | null
  class_id: number | null
  class_name: string | null
  last_activity: string | null
  days_since_last_activity: number | null
  quiz_attempts: number
  quiz_average: number | null
  homework_submitted: number
  homework_graded: number
  homework_average_grade: number | null
  missing_assignments: number
  risk_score: number
  risk_band: 'at_risk' | 'watch' | 'healthy'
  reasons: string[]
}

export interface AtRiskData {
  learners: AtRiskLearner[]
  summary: {
    at_risk: number
    watch: number
    healthy: number
    total: number
  }
}

export interface ForecastPoint {
  period: string
  amount: number
}

export interface RevenueForecast {
  history: RevenuePoint[]
  forecast: ForecastPoint[]
  trend: { slope: number; intercept: number }
  note?: string
}

export type AnalyticsInterval = 'day' | 'week' | 'month'

export interface AnalyticsRange {
  from: string
  to: string
  interval?: AnalyticsInterval
}

export function deriveInterval(from: string, to: string): AnalyticsInterval {
  const f = new Date(from).getTime()
  const t = new Date(to).getTime()
  if (!Number.isFinite(f) || !Number.isFinite(t) || t <= f) return 'day'
  const days = Math.round((t - f) / 86_400_000)
  if (days <= 31) return 'day'
  if (days <= 180) return 'week'
  return 'month'
}

function buildRangeParams(range?: AnalyticsRange): URLSearchParams {
  const params = new URLSearchParams()
  if (range?.from) params.set('from', range.from)
  if (range?.to) params.set('to', range.to)
  if (range?.interval) params.set('interval', range.interval)
  return params
}

async function analyticsFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const isServer = typeof window === 'undefined'

  const url = isServer
    ? `${process.env.ANALYTICS_API_URL || 'http://localhost:9000'}/analytics${path}`
    : `/api/analytics${path}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(
      data?.error?.message ?? data?.detail ?? `Request failed (${res.status})`,
    )
  }

  return data as T
}

function toRange(input: number | AnalyticsRange): AnalyticsRange {
  if (typeof input === 'number') {
    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - input * 86_400_000)
    return {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      interval: 'day',
    }
  }
  return {
    from: input.from,
    to: input.to,
    interval: input.interval ?? deriveInterval(input.from, input.to),
  }
}

export async function getEnrollmentTrendClient(
  range: number | AnalyticsRange,
  signal?: AbortSignal,
): Promise<EnrollmentTrend> {
  const r = toRange(range)
  const params = buildRangeParams(r)
  return analyticsFetch<EnrollmentTrend>(
    `/enrollment-trend?${params.toString()}`,
    signal,
  )
}

export async function getRevenueSeriesClient(
  range: number | AnalyticsRange,
  signal?: AbortSignal,
): Promise<RevenueSeries> {
  const r = toRange(range)
  const params = buildRangeParams(r)
  return analyticsFetch<RevenueSeries>(
    `/revenue-over-time?${params.toString()}`,
    signal,
  )
}

export async function getScoreDistributionClient(
  signal?: AbortSignal,
): Promise<ScoreDistribution> {
  return analyticsFetch<ScoreDistribution>('/score-distribution', signal)
}

export async function getHeatmapClient(
  range?: AnalyticsRange,
): Promise<HeatmapData> {
  const params = buildRangeParams(range)
  const suffix = params.toString()
  return analyticsFetch<HeatmapData>(
    `/activity-heatmap${suffix ? `?${suffix}` : ''}`,
  )
}

export async function getRetentionClient(
  range?: AnalyticsRange,
): Promise<RetentionData> {
  const params = buildRangeParams(range)
  const suffix = params.toString()
  return analyticsFetch<RetentionData>(
    `/retention${suffix ? `?${suffix}` : ''}`,
  )
}

export async function getAtRiskClient(signal?: AbortSignal): Promise<AtRiskData> {
  return analyticsFetch<AtRiskData>('/at-risk-learners', signal)
}

export async function getForecastClient(): Promise<RevenueForecast> {
  return analyticsFetch<RevenueForecast>('/revenue-forecast')
}

export interface TeacherOverview {
  average_score: number
  total_students: number
  total_quizzes: number
  attempts_counted: number
}

export async function getTeacherOverviewClient(
  teacherId: number,
  signal?: AbortSignal,
): Promise<TeacherOverview> {
  return analyticsFetch<TeacherOverview>(`/teacher-overview?teacher_id=${teacherId}`, signal)
}