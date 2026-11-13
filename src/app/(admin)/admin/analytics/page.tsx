import type { Metadata } from 'next'
import {
  getAtRiskClient,
  getEnrollmentTrendClient,
  getForecastClient,
  getHeatmapClient,
  getRetentionClient,
  getRevenueSeriesClient,
  getScoreDistributionClient,
} from '@/lib/analytics.client'
import { getAdminOverviewServer } from '@/lib/admin.server'
import type { AdminOverview } from '@/types/admin'
import { AnalyticsView } from './analytics-view'

export const metadata: Metadata = {
  title: 'Analytics',
}

export const dynamic = 'force-dynamic'

type Interval = 'day' | 'week' | 'month'

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 86_400_000)
  return { from: isoDay(from), to: isoDay(to) }
}

function isValidIsoDate(v: string | undefined): v is string {
  if (!v) return false
  const d = new Date(v)
  return Number.isFinite(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

function deriveInterval(from: string, to: string): Interval {
  const f = new Date(from).getTime()
  const t = new Date(to).getTime()
  if (!Number.isFinite(f) || !Number.isFinite(t) || t <= f) return 'day'
  const days = Math.round((t - f) / 86_400_000)
  if (days <= 31) return 'day'
  if (days <= 180) return 'week'
  return 'month'
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string }
}) {
  const defaults = defaultRange()
  const from = isValidIsoDate(searchParams?.from) ? searchParams.from : defaults.from
  const to = isValidIsoDate(searchParams?.to) ? searchParams.to : defaults.to
  const interval = deriveInterval(from, to)
  const range = { from, to, interval }

  const [
    overview,
    enrollment,
    revenue,
    scores,
    heatmap,
    retention,
    atRisk,
    forecast,
  ] = await Promise.all([
    getAdminOverviewServer().catch<AdminOverview | null>(() => null),
    getEnrollmentTrendClient(range).catch(() => null),
    getRevenueSeriesClient(range).catch(() => null),
    getScoreDistributionClient().catch(() => null),
    getHeatmapClient(range).catch(() => null),
    getRetentionClient(range).catch(() => null),
    getAtRiskClient().catch(() => null),
    getForecastClient().catch(() => null),
  ])

  const data = {
    enrollment,
    revenue,
    scores,
    heatmap,
    retention,
    atRisk,
    forecast,
  }

  const rangeLabel = `${from} → ${to}`

  return (
    <AnalyticsView
      data={data}
      overview={overview}
      rangeLabel={rangeLabel}
      fetching={false}
    />
  )
}