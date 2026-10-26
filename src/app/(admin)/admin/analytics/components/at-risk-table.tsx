'use client'

import React from 'react'
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import type { AtRiskData, AtRiskLearner } from '@/lib/analytics.client'

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function bandTone(band: AtRiskLearner['risk_band']) {
  switch (band) {
    case 'at_risk': return 'danger' as const
    case 'watch': return 'warning' as const
    default: return 'success' as const
  }
}

function bandIcon(band: AtRiskLearner['risk_band']) {
  switch (band) {
    case 'at_risk': return ShieldAlert
    case 'watch': return AlertTriangle
    default: return ShieldCheck
  }
}

function bandLabel(band: AtRiskLearner['risk_band']): string {
  switch (band) {
    case 'at_risk': return 'At risk'
    case 'watch': return 'Watch'
    default: return 'Healthy'
  }
}

function learnerName(l: AtRiskLearner): string {
  const name = [l.first_name, l.last_name].filter(Boolean).join(' ')
  return name || l.email
}

function activityLabel(days: number | null): string {
  if (days === null) return 'No recorded activity'
  if (days === 0) return 'Active today'
  if (days === 1) return 'Active yesterday'
  return relativeTimeFormatter.format(-days, 'day')
}

const AtRiskRow = React.memo(function AtRiskRow({ learner }: { learner: AtRiskLearner }) {
  const Icon = bandIcon(learner.risk_band)
  
  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="max-w-[200px] px-3 py-3">
        <p className="truncate font-medium">{learnerName(learner)}</p>
        <p className="truncate text-xs text-muted-foreground">{learner.email}</p>
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        {learner.class_name ?? '—'}
      </td>
      <td
        className={cn(
          'px-3 py-3',
          learner.days_since_last_activity === null || learner.days_since_last_activity >= 7
            ? 'font-medium text-danger-fg'
            : 'text-muted-foreground',
        )}
      >
        {activityLabel(learner.days_since_last_activity)}
      </td>
      <td
        className={cn(
          'px-3 py-3',
          learner.missing_assignments >= 3
            ? 'font-semibold text-danger-fg'
            : learner.missing_assignments > 0
              ? 'font-medium text-warning-fg'
              : 'text-muted-foreground',
        )}
      >
        {learner.missing_assignments}
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        {learner.quiz_average !== null ? `${learner.quiz_average.toFixed(0)}%` : '—'}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Badge tone={bandTone(learner.risk_band)}>
            <Icon size={12} className="mr-1" />
            {bandLabel(learner.risk_band)}
          </Badge>
          <span className="text-xs font-semibold">{learner.risk_score}</span>
        </div>
      </td>
      <td className="max-w-[280px] px-3 py-3">
        {learner.reasons.length > 0 ? (
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {learner.reasons.map((r, i) => (
              <li key={i}>· {r}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
})

const MobileAtRiskCard = React.memo(function MobileAtRiskCard({ learner }: { learner: AtRiskLearner }) {
  const Icon = bandIcon(learner.risk_band)
  
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="truncate font-medium text-foreground">{learnerName(learner)}</span>
          <span className="truncate text-xs text-muted-foreground">{learner.email}</span>
        </div>
        <Badge tone={bandTone(learner.risk_band)} className="shrink-0">
          <Icon size={12} className="mr-1" />
          {bandLabel(learner.risk_band)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="font-medium">{learner.class_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Risk Score</p>
          <p className="font-medium">{learner.risk_score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Active</p>
          <p className={cn(
            'font-medium',
            learner.days_since_last_activity === null || learner.days_since_last_activity >= 7
              ? 'text-danger-fg'
              : 'text-foreground'
          )}>
            {activityLabel(learner.days_since_last_activity)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Missing</p>
          <p className={cn(
            'font-medium',
            learner.missing_assignments >= 3
              ? 'text-danger-fg'
              : learner.missing_assignments > 0
                ? 'text-warning-fg'
                : 'text-foreground'
          )}>
            {learner.missing_assignments} assignments
          </p>
        </div>
      </div>

      {learner.reasons.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Reasons: </span>
          {learner.reasons.join(', ')}
        </div>
      )}
    </div>
  )
})

export function AtRiskTable({ data }: { data: AtRiskData | null }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>At-risk learners</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={AlertTriangle}
            title="No data"
            description="The analytics service did not return learner signals."
          />
        </CardContent>
      </Card>
    )
  }

  const { learners, summary } = data

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/10">
        <CardTitle>At-risk learners</CardTitle>
        <CardDescription>
          {summary.at_risk} at risk · {summary.watch} to watch · {summary.healthy} healthy (of {summary.total})
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {learners.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              icon={ShieldCheck}
              title="No learners flagged"
              description="Everyone is currently in the healthy band."
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {['Learner', 'Class', 'Last active', 'Missing', 'Quiz avg', 'Risk', 'Reasons'].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-3 text-left font-semibold tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {learners.map((l) => (
                    <AtRiskRow key={l.user_id} learner={l} />
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:hidden">
              {learners.map((l) => (
                <MobileAtRiskCard key={l.user_id} learner={l} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}