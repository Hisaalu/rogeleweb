'use client'

import { Users } from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { EnrollmentTrend } from '@/lib/analytics.client'

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: 8,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

export function EnrollmentChart({ data }: { data: EnrollmentTrend | null }) {
  if (!data || data.points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enrollment trend</CardTitle>
          <CardDescription>New signups over time</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Users} title="No enrollment data yet" description="Signups will appear here as new users register." />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.points.map((p) => ({
    period: new Date(p.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" name="Signups" stroke="var(--brand-primary)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorEnroll)" />
              <Area type="monotone" dataKey="moving_average" name="Trend" stroke="var(--brand-accent)" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}