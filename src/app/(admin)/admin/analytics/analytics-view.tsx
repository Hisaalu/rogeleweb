'use client'

import { BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiCards } from './components/kpi-cards'
import { EnrollmentChart } from './components/enrollment-chart'
import { RevenueChart } from './components/revenue-chart'
import { ScoreDistributionChart } from './components/score-distribution-chart'
import { ActivityHeatmap } from './components/activity-heatmap'
import { RetentionTable } from './components/retention-table'
import { AtRiskTable } from './components/at-risk-table'
import { ForecastChart } from './components/forecast-chart'
import type {
  AtRiskData,
  EnrollmentTrend,
  HeatmapData,
  RetentionData,
  RevenueForecast,
  RevenueSeries,
  ScoreDistribution,
} from '@/lib/analytics.client'

export interface AnalyticsData {
  enrollment: EnrollmentTrend | null
  revenue: RevenueSeries | null
  scores: ScoreDistribution | null
  heatmap: HeatmapData | null
  retention: RetentionData | null
  atRisk: AtRiskData | null
  forecast: RevenueForecast | null
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  if (!data) {
    return (
      <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
        Failed to load analytics data. The service may be unreachable.
      </div>
    )
  }

  const dataValues = Object.values(data)
  const failed = dataValues.filter((v) => v === null).length
  const total = dataValues.length
  
  const error = failed === total 
    ? 'Analytics service is unreachable.' 
    : failed > 0 
      ? `${failed} of ${total} analytics sections failed to load.` 
      : null

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
        <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
          {error}
        </div>
      )}

      <KpiCards data={data} />

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <EnrollmentChart data={data.enrollment} />
            <ScoreDistributionChart data={data.scores} />
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6 space-y-6">
          <ActivityHeatmap data={data.heatmap} />
          <RetentionTable data={data.retention} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <RevenueChart data={data.revenue} />
          <ForecastChart data={data.forecast} />
        </TabsContent>

        <TabsContent value="risk" className="mt-6 space-y-6">
          <AtRiskTable data={data.atRisk} />
        </TabsContent>
      </Tabs>
    </div>
  )
}