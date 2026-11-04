'use client'

import React, { useState } from 'react'
import {
  BarChart3, Download, BookOpen, HelpCircle, Award, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast-provider'
import { PremiumGate } from '@/components/premium-gate'
import { KpiCard } from './components/kpi-card'
import { TrendCard } from './components/trend-card'
import { ActivityHeatmap } from './components/activity-heatmap'
import { WeeklyActivityChart } from './components/weekly-activity-chart'
import { RecommendationsPanel } from './components/recommendations-panel'
import { DateFilterBar } from './components/date-filter-bar'
import type {
  LearnerAnalyticsData,
  LearnerSubscriptionState,
} from '@/lib/learner-analytics.server'

function exportCsv(data: LearnerAnalyticsData) {
  const lines: string[][] = [
    ['Metric', 'Value'],
    ['Period', `${data.from} to ${data.to}`],
    ['Homework submitted', String(data.homework.submitted)],
    ['Homework graded', String(data.homework.graded)],
    ['Homework average', data.homework.average != null ? String(data.homework.average) : '—'],
    ['Homework highest', data.homework.highest != null ? String(data.homework.highest) : '—'],
    ['Homework lowest', data.homework.lowest != null ? String(data.homework.lowest) : '—'],
    ['Quizzes attempted', String(data.quizzes.attempted)],
    ['Quiz average', data.quizzes.average != null ? String(data.quizzes.average) : '—'],
    ['Quiz highest', data.quizzes.highest != null ? String(data.quizzes.highest) : '—'],
    ['Quiz lowest', data.quizzes.lowest != null ? String(data.quizzes.lowest) : '—'],
    ['Active days', String(data.activity.active_days)],
    [],
    ['Daily activity'],
    ['Date', 'Count'],
    ...data.activity.daily_counts.map((d) => [d.date, String(d.count)]),
    [],
    ['Homework trend'],
    ['Date', 'Grade'],
    ...data.trends.homework.map((p) => [p.date, String(p.value)]),
    [],
    ['Quiz trend'],
    ['Date', 'Score'],
    ...data.trends.quizzes.map((p) => [p.date, String(p.value)]),
  ]
  const csv = lines
    .map((row) =>
      row.map((c) => {
        const s = String(c ?? '')
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(','),
    )
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics_${data.from}_${data.to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function LearnerAnalyticsView({
  data,
  subscription,
  fetching,
}: {
  data: LearnerAnalyticsData | null
  subscription: LearnerSubscriptionState
  fetching: boolean
}) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <PremiumGate
          open
          context="analytics"
          reason={subscription.reason === 'ok' ? 'no_plan' : subscription.reason}
        />
      </div>
    )
  }

  const safeData: LearnerAnalyticsData = data

  const totalActivities = safeData.activity.daily_counts.reduce(
    (sum, d) => sum + d.count,
    0,
  )

  const handleExport = () => {
    if (busy) return
    setBusy(true)
    try {
      exportCsv(safeData)
      showToast('Analytics exported as CSV.', 'success', {
        title: 'Download ready',
      })
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to export analytics.',
        'error',
        { title: 'Export failed' },
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-primary sm:text-3xl">
            <BarChart3 size={26} className="shrink-0 sm:h-7 sm:w-7" />
            <span>Analytics</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track of {safeData.from} to {safeData.to}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">Subscribed</Badge>
          <Button variant="outline" onClick={handleExport} disabled={busy}>
            <Download size={14} />
          </Button>
        </div>
      </div>

      <DateFilterBar busy={fetching} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          icon={BookOpen}
          label="Homework submitted"
          value={String(safeData.homework.submitted)}
          hint={
            safeData.homework.graded > 0
              ? `${safeData.homework.graded} graded`
              : 'Not graded yet'
          }
          tone="info"
        />
        <KpiCard
          icon={Award}
          label="Homework average"
          value={
            safeData.homework.average != null
              ? `${safeData.homework.average.toFixed(1)}%`
              : '—'
          }
          hint={
            safeData.homework.highest != null
              ? `Best ${safeData.homework.highest.toFixed(0)}%`
              : undefined
          }
          tone="success"
        />
        <KpiCard
          icon={HelpCircle}
          label="Quizzes attempted"
          value={String(safeData.quizzes.attempted)}
          hint={
            safeData.quizzes.average != null
              ? `Avg ${safeData.quizzes.average.toFixed(1)}%`
              : 'No attempts yet'
          }
          tone="default"
        />
        <KpiCard
          icon={Award}
          label="Quiz average"
          value={
            safeData.quizzes.average != null
              ? `${safeData.quizzes.average.toFixed(1)}%`
              : '—'
          }
          hint={
            safeData.quizzes.highest != null
              ? `Best ${safeData.quizzes.highest.toFixed(0)}%`
              : undefined
          }
          tone="success"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Award}
          label="Homework best"
          value={
            safeData.homework.highest != null
              ? `${safeData.homework.highest.toFixed(0)}%`
              : '—'
          }
          hint={
            safeData.homework.lowest != null
              ? `Lowest ${safeData.homework.lowest.toFixed(0)}%`
              : undefined
          }
          tone="success"
        />
        <KpiCard
          icon={Award}
          label="Quiz best"
          value={
            safeData.quizzes.highest != null
              ? `${safeData.quizzes.highest.toFixed(0)}%`
              : '—'
          }
          hint={
            safeData.quizzes.lowest != null
              ? `Lowest ${safeData.quizzes.lowest.toFixed(0)}%`
              : undefined
          }
          tone="info"
        />
        <KpiCard
          icon={Activity}
          label="Active days"
          value={String(safeData.activity.active_days)}
          hint={`from ${safeData.from}`}
          tone="default"
        />
        <KpiCard
          icon={BarChart3}
          label="Total activities"
          value={String(totalActivities)}
          hint="Homework + quizzes"
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <TrendCard
          icon={BookOpen}
          title="Homework grades over time"
          emptyTitle="No graded homework yet"
          emptyDescription="Grades appear once your teacher reviews your work."
          points={safeData.trends.homework}
          color="primary"
        />
        <TrendCard
          icon={HelpCircle}
          title="Quiz scores over time"
          emptyTitle="No completed quizzes yet"
          emptyDescription="Scores appear after you finish a quiz."
          points={safeData.trends.quizzes}
          color="accent"
        />
      </div>

      <WeeklyActivityChart points={safeData.activity.weekly_counts} />

      <ActivityHeatmap
        grid={safeData.activity.heatmap}
        max={safeData.activity.heatmap_max}
        activeDays={safeData.activity.active_days}
      />

      <RecommendationsPanel recommendations={safeData.recommendations} />
    </div>
  )
}