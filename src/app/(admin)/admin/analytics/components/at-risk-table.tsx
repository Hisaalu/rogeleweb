'use client'

import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import type { AtRiskData, AtRiskLearner } from '@/lib/analytics.client'

function bandTone(band: AtRiskLearner['risk_band']) {
  switch (band) {
    case 'at_risk':
      return 'danger' as const
    case 'watch':
      return 'warning' as const
    default:
      return 'success' as const
  }
}

function bandIcon(band: AtRiskLearner['risk_band']) {
  switch (band) {
    case 'at_risk':
      return ShieldAlert
    case 'watch':
      return AlertTriangle
    default:
      return ShieldCheck
  }
}

function bandLabel(band: AtRiskLearner['risk_band']): string {
  switch (band) {
    case 'at_risk':
      return 'At risk'
    case 'watch':
      return 'Watch'
    default:
      return 'Healthy'
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
  return `${days} days ago`
}

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
    <Card>
      <CardHeader>
        <CardTitle>At-risk learners</CardTitle>
        <CardDescription>
          {summary.at_risk} at risk · {summary.watch} to watch · {summary.healthy} healthy
          {' '}
          (of {summary.total})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No learners flagged"
            description="Everyone is currently in the healthy band."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Learner', 'Class', 'Last active', 'Missing', 'Quiz avg', 'Risk', 'Reasons'].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {learners.map((l) => {
                  const Icon = bandIcon(l.risk_band)
                  return (
                    <tr key={l.user_id} className="transition hover:bg-muted/30">
                      <td className="max-w-[200px] px-3 py-3">
                        <p className="truncate font-medium">{learnerName(l)}</p>
                        <p className="truncate text-xs text-muted-foreground">{l.email}</p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {l.class_name ?? '—'}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-3',
                          l.days_since_last_activity === null ||
                            l.days_since_last_activity >= 7
                            ? 'font-medium text-red-600'
                            : 'text-muted-foreground',
                        )}
                      >
                        {activityLabel(l.days_since_last_activity)}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-3',
                          l.missing_assignments >= 3
                            ? 'font-semibold text-red-600'
                            : l.missing_assignments > 0
                              ? 'font-medium text-amber-600'
                              : 'text-muted-foreground',
                        )}
                      >
                        {l.missing_assignments}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {l.quiz_average !== null ? `${l.quiz_average.toFixed(0)}%` : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={bandTone(l.risk_band)}>
                            <Icon size={12} className="mr-1" />
                            {bandLabel(l.risk_band)}
                          </Badge>
                          <span className="text-xs font-semibold">{l.risk_score}</span>
                        </div>
                      </td>
                      <td className="max-w-[280px] px-3 py-3">
                        {l.reasons.length > 0 ? (
                          <ul className="space-y-0.5 text-xs text-muted-foreground">
                            {l.reasons.map((r, i) => (
                              <li key={i}>· {r}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}