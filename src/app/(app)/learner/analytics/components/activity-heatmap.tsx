'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const ActivityHeatmap = React.memo(function ActivityHeatmap({
  grid,
  max,
  activeDays,
}: {
  grid: number[][]
  max: number
  activeDays: number
}) {
  const safeMax = Math.max(1, max)

  function opacity(v: number) {
    if (v === 0) return 0.04
    return 0.15 + (v / safeMax) * 0.85
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <BarChart3 size={18} className="shrink-0 text-brand-accent" />
          When you learn most
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeDays === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No activity yet"
            description="Submit homework or take a quiz to see your pattern."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="mb-1 flex gap-0.5 pl-10 text-[10px] text-muted-foreground">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="flex-1 text-center">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {grid.map((row, d) => (
                <div key={d} className="flex items-center gap-1">
                  <div className="w-9 text-right text-[10px] font-medium text-muted-foreground">
                    {DAYS[d]}
                  </div>
                  <div className="flex flex-1 gap-0.5">
                    {row.map((count, h) => (
                      <div
                        key={h}
                        title={`${DAYS[d]} ${h}:00 — ${count} activities`}
                        className="h-5 flex-1 rounded-sm sm:h-6"
                        style={{
                          backgroundColor: 'hsl(var(--brand-primary))',
                          opacity: opacity(count),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})