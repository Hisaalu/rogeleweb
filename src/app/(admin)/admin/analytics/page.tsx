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

export default async function AdminAnalyticsPage() {
  const [enrollment, revenue, scores, heatmap, retention, atRisk, forecast] =
    await Promise.allSettled([
      getEnrollmentTrendClient(30),
      getRevenueSeriesClient(30),
      getScoreDistributionClient(),
      getHeatmapClient(),
      getRetentionClient(),
      getAtRiskClient(),
      getForecastClient(),
    ])

  const data = {
    enrollment: enrollment.status === 'fulfilled' ? (enrollment.value ?? null) : null,
    revenue: revenue.status === 'fulfilled' ? (revenue.value ?? null) : null,
    scores: scores.status === 'fulfilled' ? (scores.value ?? null) : null,
    heatmap: heatmap.status === 'fulfilled' ? (heatmap.value ?? null) : null,
    retention: retention.status === 'fulfilled' ? (retention.value ?? null) : null,
    atRisk: atRisk.status === 'fulfilled' ? (atRisk.value ?? null) : null,
    forecast: forecast.status === 'fulfilled' ? (forecast.value ?? null) : null,
  }

  return <AnalyticsView data={data} />
}