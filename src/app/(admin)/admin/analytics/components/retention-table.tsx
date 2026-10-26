'use client'

import { Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import type { RetentionData } from '@/lib/analytics.client'

function cellTone(pct: number): string {
  if (pct === 0) return 'text-muted-foreground'
  if (pct >= 0.75) return 'text-success-fg'
  if (pct >= 0.5) return 'text-success-fg'
  if (pct >= 0.25) return 'text-warning-fg'
  return 'text-danger-fg'
}

function cellBg(pct: number): string {
  if (pct === 0) return 'bg-muted/30'
  if (pct >= 0.75) return 'bg-success-bg'
  if (pct >= 0.5) return 'bg-success-bg/60'
  if (pct >= 0.25) return 'bg-warning-bg'
  return 'bg-danger-bg'
}

function cohortLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RetentionTable({ data }: { data: RetentionData | null }) {
  if (!data || data.cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention</CardTitle>
          <CardDescription>Weekly cohorts by signup week</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No cohorts yet"
            description="Retention will appear once users start signing up."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention</CardTitle>
        <CardDescription>
          {data.cohorts.length} cohort{data.cohorts.length === 1 ? '' : 's'} ·
          {' '}
          each cell shows the % of that cohort active in week N
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cohort
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Size
                </th>
                {Array.from({ length: data.weeks }).map((_, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    W{i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.cohorts.map((cohort) => (
                <tr key={cohort.cohort_week}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">
                    {cohortLabel(cohort.cohort_week)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                    {cohort.cohort_size}
                  </td>
                  {cohort.weeks.map((w) => {
                    const pct = w.pct
                    return (
                      <td
                        key={w.week}
                        title={`${w.active} of ${cohort.cohort_size} active`}
                        className={cn(
                          'rounded px-2 py-2 text-center text-xs font-semibold',
                          cellTone(pct),
                          cellBg(pct),
                        )}
                      >
                        {pct === 0 ? '—' : `${(pct * 100).toFixed(0)}%`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}