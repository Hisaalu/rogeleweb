'use client'

import { TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { RevenueForecast } from '@/lib/analytics.client'

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: 8,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

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
            description={data?.note ?? 'At least two months of completed payments are required to produce a projection.'}
          />
        </CardContent>
      </Card>
    )
  }

  const historyPoints = data.history.map((p) => ({
    period: formatPeriod(p.period),
    actual: p.amount,
    projected: null as number | null,
  }))

  const lastHistoryAmount = data.history.length > 0 ? data.history[data.history.length - 1].amount : 0

  const forecastPoints = data.forecast.map((p) => ({
    period: formatPeriod(p.period),
    actual: null as number | null,
    projected: p.amount,
  }))

  if (historyPoints.length > 0 && forecastPoints.length > 0) {
    forecastPoints[0].projected = lastHistoryAmount
  }

  const chartData = [...historyPoints, ...forecastPoints]
  const growth = data.trend.slope
  const growthTone = growth > 0 ? 'text-success-fg' : growth < 0 ? 'text-danger-fg' : 'text-muted-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue forecast</CardTitle>
        <CardDescription>
          Projected using a linear trend · slope
          <span className={`${growthTone} ml-1 font-semibold`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(2)}
          </span>{' '}
          per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="hsl(var(--muted-foreground))" 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--brand-primary)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorForecast)" />
              <Area type="monotone" dataKey="projected" name="Projected" stroke="var(--brand-accent)" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}