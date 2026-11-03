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
import { AnalyticsView } from './analytics-view'

export const metadata: Metadata = {
  title: 'Analytics',
}

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const [
    enrollment,
    revenue,
    scores,
    heatmap,
    retention,
    atRisk,
    forecast,
  ] = await Promise.all([
    getEnrollmentTrendClient(30).catch(() => null),
    getRevenueSeriesClient(30).catch(() => null),
    getScoreDistributionClient().catch(() => null),
    getHeatmapClient().catch(() => null),
    getRetentionClient().catch(() => null),
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

  return <AnalyticsView data={data} />
}