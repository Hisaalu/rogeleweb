'use client'

import { Users } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { EnrollmentTrend } from '@/lib/analytics.client'

export function EnrollmentChart({ data }: { data: EnrollmentTrend | null }) {
  if (!data || data.points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enrollment trend</CardTitle>
          <CardDescription>New signups over time</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No enrollment data yet"
            description="Signups will appear here as new users register."
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.points.map((p) => ({
    period: new Date(p.period).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    count: p.count,
    moving_average: p.moving_average,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment trend</CardTitle>
        <CardDescription>
          {data.total} new user{data.total === 1 ? '' : 's'} in the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(229 231 235)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                stroke="rgb(156 163 175)"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="moving_average"
                stroke="var(--brand-accent)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}