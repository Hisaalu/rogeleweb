'use client'

import { DollarSign } from 'lucide-react'
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
import type { RevenueSeries } from '@/lib/analytics.client'

export function RevenueChart({ data }: { data: RevenueSeries | null }) {
  if (!data || data.points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
          <CardDescription>Completed payments per period</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={DollarSign}
            title="No revenue data yet"
            description="Completed payments will appear here."
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.points.map((p) => ({
    period: new Date(p.period).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    amount: p.amount,
    cumulative: p.cumulative,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
        <CardDescription>
          ${data.total.toFixed(2)} from {data.total_count} completed payment
          {data.total_count === 1 ? '' : 's'}
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
              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
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