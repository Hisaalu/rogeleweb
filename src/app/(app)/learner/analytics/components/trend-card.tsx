'use client'

import React from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { TrendingUp, type LucideIcon } from 'lucide-react'
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

export const TrendCard = React.memo(function TrendCard({
  icon: Icon,
  title,
  emptyTitle,
  emptyDescription,
  points,
  color,
}: {
  icon: LucideIcon
  title: string
  emptyTitle: string
  emptyDescription: string
  points: { date: string; value: number }[]
  color: 'primary' | 'accent'
}) {
  const stroke = color === 'primary' ? 'var(--brand-primary)' : 'var(--brand-accent)'
  const gradientId = color === 'primary' ? 'learnerHwGradient' : 'learnerQuizGradient'

  const chartData = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: p.value,
  }))

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon size={18} style={{ color: 'var(--brand-accent)' }} />
        {title}
      </h3>
      <div className="h-[240px] sm:h-[300px]">
        {chartData.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                width={30}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="value"
                name="Score"
                stroke={stroke}
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
})