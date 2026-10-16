'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getAtRiskClient,
  getEnrollmentTrendClient,
  getForecastClient,
  getHeatmapClient,
  getRetentionClient,
  getRevenueSeriesClient,
  getScoreDistributionClient,
  type AtRiskData,
  type EnrollmentTrend,
  type HeatmapData,
  type RetentionData,
  type RevenueForecast,
  type RevenueSeries,
  type ScoreDistribution,
} from '@/lib/analytics.client'
import { KpiCards } from './components/kpi-cards'
import { EnrollmentChart } from './components/enrollment-chart'
import { RevenueChart } from './components/revenue-chart'
import { ScoreDistributionChart } from './components/score-distribution-chart'
import { ActivityHeatmap } from './components/activity-heatmap'
import { RetentionTable } from './components/retention-table'
import { AtRiskTable } from './components/at-risk-table'
import { ForecastChart } from './components/forecast-chart'

export interface AnalyticsData {
  enrollment: EnrollmentTrend | null
  revenue: RevenueSeries | null
  scores: ScoreDistribution | null
  heatmap: HeatmapData | null
  retention: RetentionData | null
  atRisk: AtRiskData | null
  forecast: RevenueForecast | null
}

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData>({
    enrollment: null,
    revenue: null,
    scores: null,
    heatmap: null,
    retention: null,
    atRisk: null,
    forecast: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([
        getEnrollmentTrendClient('month'),
        getRevenueSeriesClient('month'),
        getScoreDistributionClient(),
        getHeatmapClient(),
        getRetentionClient(),
        getAtRiskClient(),
        getForecastClient(),
      ])

      const [enrollment, revenue, scores, heatmap, retention, atRisk, forecast] = results

      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed === results.length) {
        setError('Analytics service is unreachable. Ensure the Python service is running.')
      } else if (failed > 0) {
        setError(`${failed} of ${results.length} analytics sections failed to load.`)
      }

      setData({
        enrollment: enrollment.status === 'fulfilled' ? enrollment.value : null,
        revenue: revenue.status === 'fulfilled' ? revenue.value : null,
        scores: scores.status === 'fulfilled' ? scores.value : null,
        heatmap: heatmap.status === 'fulfilled' ? heatmap.value : null,
        retention: retention.status === 'fulfilled' ? retention.value : null,
        atRisk: atRisk.status === 'fulfilled' ? atRisk.value : null,
        forecast: forecast.status === 'fulfilled' ? forecast.value : null,
      })

      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <BarChart3 size={24} className="text-brand-accent" />
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Decision-making insights across users, content, revenue, and engagement.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Loading analytics...
        </div>
      ) : (
        <>
          <KpiCards data={data} />

          <Tabs defaultValue="trends">
            <TabsList>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <EnrollmentChart data={data.enrollment} />
                <ScoreDistributionChart data={data.scores} />
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <ActivityHeatmap data={data.heatmap} />
              <RetentionTable data={data.retention} />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueChart data={data.revenue} />
              <ForecastChart data={data.forecast} />
            </TabsContent>

            <TabsContent value="risk" className="space-y-6">
              <AtRiskTable data={data.atRisk} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}