'use client'

import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { HeatmapData } from '@/lib/analytics.client'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ActivityHeatmap({ data }: { data: HeatmapData | null }) {
  if (!data || data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity heatmap</CardTitle>
          <CardDescription>Event distribution by day and hour</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Once users start interacting, patterns will appear here."
          />
        </CardContent>
      </Card>
    )
  }

  const max = Math.max(1, data.max)

  function cellOpacity(count: number): number {
    if (count === 0) return 0.04
    return 0.15 + (count / max) * 0.85
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity heatmap</CardTitle>
        <CardDescription>
          {data.total} event{data.total === 1 ? '' : 's'} · busiest hour has {data.max}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Hour labels */}
            <div className="ml-10 flex gap-0.5 text-[10px] text-muted-foreground">
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="flex-1 text-center">
                  {h % 2 === 0 ? h : ''}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="mt-1 space-y-0.5">
              {data.grid.map((row, d) => (
                <div key={d} className="flex items-center gap-1">
                  <div className="w-9 text-right text-[10px] font-medium text-muted-foreground">
                    {DAYS[d] ?? d}
                  </div>
                  <div className="flex flex-1 gap-0.5">
                    {row.map((count, h) => (
                      <div
                        key={h}
                        title={`${DAYS[d] ?? d} ${h}:00 — ${count} event${count === 1 ? '' : 's'}`}
                        className="h-6 flex-1 rounded transition-transform hover:scale-110"
                        style={{
                          backgroundColor: 'var(--brand-primary)',
                          opacity: cellOpacity(count),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <div
                    key={v}
                    className="h-3 w-3 rounded"
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                      opacity: v === 0 ? 0.04 : 0.15 + v * 0.85,
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}