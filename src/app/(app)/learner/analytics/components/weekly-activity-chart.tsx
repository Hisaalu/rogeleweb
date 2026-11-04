'use client'

import React from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: 8,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

export const WeeklyActivityChart = React.memo(function WeeklyActivityChart({
  points,
}: {
  points: { week: string; activities: number }[]
}) {
  const chartData = points.map((p) => ({
    week: new Date(p.week).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    activities: p.activities,
  }))

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
        <Calendar size={18} style={{ color: 'var(--brand-accent)' }} />
        Weekly activity
      </h3>
      <div className="h-[240px] sm:h-[300px]">
        {chartData.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No activity yet"
            description="Activity will appear as you submit homework and complete quizzes."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient id="learnerActivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                width={30}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              />
              <Bar
                dataKey="activities"
                name="Activities"
                fill="url(#learnerActivityGradient)"
                radius={[0, 0, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
})