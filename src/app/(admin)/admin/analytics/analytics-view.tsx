'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import type { AdminOverview } from '@/types/admin'
import type {
  AtRiskData,
  EnrollmentTrend,
  HeatmapData,
  RetentionData,
  RevenueForecast,
  RevenueSeries,
  ScoreDistribution,
} from '@/lib/analytics.client'
import { KpiCards } from './components/kpi-cards'
import { PlatformKpiCards } from './components/platform-kpi-cards'
import { EnrollmentChart } from './components/enrollment-chart'
import { RevenueChart } from './components/revenue-chart'
import { ScoreDistributionChart } from './components/score-distribution-chart'
import { ActivityHeatmap } from './components/activity-heatmap'
import { RetentionTable } from './components/retention-table'
import { AtRiskTable } from './components/at-risk-table'
import { ForecastChart } from './components/forecast-chart'
import { DateFilterBar } from './components/date-filter-bar'

export interface AnalyticsData {
  enrollment: EnrollmentTrend | null
  revenue: RevenueSeries | null
  scores: ScoreDistribution | null
  heatmap: HeatmapData | null
  retention: RetentionData | null
  atRisk: AtRiskData | null
  forecast: RevenueForecast | null
}

const TAB_KEYS = ['overview', 'growth', 'revenue', 'content', 'engagement', 'risk'] as const
type TabKey = (typeof TAB_KEYS)[number]

function AllTimeChip() {
  return (
    <Badge tone="default" aria-label="Not affected by date filter">
      All-time
    </Badge>
  )
}

function ContentTile({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      <div className="rounded-sm border border-border bg-card p-4 transition-shadow hover:shadow-md">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </Link>
  )
}

export function AnalyticsView({
  data,
  overview,
  rangeLabel,
  fetching,
}: {
  data: AnalyticsData
  overview: AdminOverview | null
  rangeLabel: string
  fetching: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab') ?? 'overview'
  const tab: TabKey = (TAB_KEYS as readonly string[]).includes(rawTab)
    ? (rawTab as TabKey)
    : 'overview'

  function setTab(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (!data) {
    return (
      <div className="rounded-sm border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
        Failed to load analytics data. The service may be unreachable.
      </div>
    )
  }

  const dataValues = Object.values(data)
  const failed = dataValues.filter((v) => v === null).length
  const total = dataValues.length

  const error =
    failed === total
      ? 'Analytics service is unreachable. Please ensure the ANALYTICS_API_URL is set correctly in the Next.js environment.'
      : failed > 0
        ? `${failed} of ${total} analytics sections failed to load.`
        : null

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Full platform insights. Range: {rangeLabel}.
        </p>
      </div>

      <DateFilterBar busy={fetching} />

      {error && (
        <div className="rounded-sm border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
          {error}
        </div>
      )}

      <PlatformKpiCards overview={overview} data={data} />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <KpiCards data={data} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <EnrollmentChart data={data.enrollment} />
            <RevenueChart data={data.revenue} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-2">
                <AllTimeChip />
              </div>
              <ScoreDistributionChart data={data.scores} />
            </div>
            <ActivityHeatmap data={data.heatmap} />
          </div>
        </TabsContent>

        <TabsContent value="growth" className="mt-6 space-y-6">
          <EnrollmentChart data={data.enrollment} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <RevenueChart data={data.revenue} />
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-2">
                <AllTimeChip />
              </div>
              <ForecastChart data={data.forecast} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            <ContentTile label="Classes" value={String(overview?.total_classes ?? 0)} href="/admin/classes" />
            <ContentTile label="Subjects" value={String(overview?.total_subjects ?? 0)} href="/admin/subjects" />
            <ContentTile label="Lessons" value={String(overview?.total_lessons ?? 0)} href="/admin/lessons" />
            <ContentTile label="Homework" value={String(overview?.total_homework ?? 0)} href="/admin/homework" />
            <ContentTile label="Quizzes" value={String(overview?.total_quizzes ?? 0)} href="/admin/quizzes" />
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6 space-y-6">
          <ActivityHeatmap data={data.heatmap} />
          <RetentionTable data={data.retention} />
        </TabsContent>

        <TabsContent value="risk" className="mt-6 space-y-6">
          <div className="flex items-center justify-end gap-2">
            <AllTimeChip />
          </div>
          <AtRiskTable data={data.atRisk} />
        </TabsContent>
      </Tabs>
    </div>
  )
}