'use client'

import { TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { RevenueForecast } from '@/lib/analytics.client'

function formatPeriod(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function ForecastChart({ data }: { data: RevenueForecast | null }) {
  if (!data || data.forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue forecast</CardTitle>
          <CardDescription>Projected revenue for the next months</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="Not enough data to forecast"
            description={
              data?.note ??
              'At least two months of completed payments are required to produce a projection.'
            }
          />
        </CardContent>
      </Card>
    )
  }

  // Combine history and forecast into one series with an overlap point at
  // the "today" boundary so the line is continuous.
  const historyPoints = data.history.map((p) => ({
    period: formatPeriod(p.period),
    actual: p.amount,
    projected: null as number | null,
  }))

  const lastHistoryAmount =
    data.history.length > 0 ? data.history[data.history.length - 1].amount : 0

  const forecastPoints = data.forecast.map((p) => ({
    period: formatPeriod(p.period),
    actual: null as number | null,
    projected: p.amount,
  }))

  // Bridge: repeat the last actual value as the first forecast value
  if (historyPoints.length > 0 && forecastPoints.length > 0) {
    forecastPoints[0].projected = lastHistoryAmount
  }

  const chartData = [...historyPoints, ...forecastPoints]

  const growth = data.trend.slope
  const growthTone = growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue forecast</CardTitle>
        <CardDescription>
          Projected using a linear trend · slope
          <span className={growthTone + ' ml-1 font-semibold'}>
            {growth >= 0 ? '+' : ''}
            {growth.toFixed(2)}
          </span>{' '}
          per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(229 231 235)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" />
              <YAxis tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={0}
                stroke="rgb(229 231 235)"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="var(--brand-accent)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
                name="Projected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}