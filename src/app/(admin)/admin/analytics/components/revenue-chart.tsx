'use client'

import { DollarSign } from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { RevenueSeries } from '@/lib/analytics.client'

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

export function RevenueChart({ data }: { data: RevenueSeries | null }) {
  if (!data || data.points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
          <CardDescription>Completed payments per period</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={DollarSign} title="No revenue data yet" description="Completed payments will appear here." />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.points.map((p) => ({
    period: new Date(p.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    amount: p.amount,
    cumulative: p.cumulative,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
        <CardDescription>
          {currencyFormatter.format(data.total)} from {data.total_count} completed payment{data.total_count === 1 ? '' : 's'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="amount" name="Period Revenue" stroke="var(--brand-primary)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="var(--brand-accent)" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}