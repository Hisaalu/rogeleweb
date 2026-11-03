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

async function analyticsFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const isServer = typeof window === 'undefined'

  const baseUrl = isServer
    ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    : ''

  const res = await fetch(`${baseUrl}/api/analytics${path}`, {
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

export async function getEnrollmentTrendClient(
  rangeDays: number,
  signal?: AbortSignal,
): Promise<EnrollmentTrend> {
  const toDate = new Date()
  const fromDate = new Date(toDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
    interval: 'day',
  })

  return analyticsFetch<EnrollmentTrend>(
    `/enrollment-trend?${params.toString()}`,
    signal,
  )
}

export async function getRevenueSeriesClient(
  rangeDays: number,
  signal?: AbortSignal,
): Promise<RevenueSeries> {
  const toDate = new Date()
  const fromDate = new Date(toDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
    interval: 'day',
  })

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

export async function getHeatmapClient(): Promise<HeatmapData> {
  return analyticsFetch<HeatmapData>('/activity-heatmap')
}

export async function getRetentionClient(): Promise<RetentionData> {
  return analyticsFetch<RetentionData>('/retention')
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