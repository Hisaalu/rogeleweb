'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { HelpCircle } from 'lucide-react'
import type { ScoreDistribution } from '@/lib/analytics.client'

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: 8,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

const GRADIENTS = [
  { id: 'gradRed', start: '#ef4444' },
  { id: 'gradOrange', start: '#f97316' },
  { id: 'gradYellow', start: '#eab308' },
  { id: 'gradLime', start: '#84cc16' },
  { id: 'gradGreen', start: '#22c55e' },
]

export function ScoreDistributionChart({ data }: { data: ScoreDistribution | null }) {
  if (!data || data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score distribution</CardTitle>
          <CardDescription>Across all completed quiz attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={HelpCircle} title="No quiz data yet" description="Score buckets will appear once learners complete quizzes." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score distribution</CardTitle>
        <CardDescription>
          {data.total} attempt{data.total === 1 ? '' : 's'} · avg {data.average.toFixed(0)}% · median {data.median}% · {data.passing_pct.toFixed(0)}% passing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.buckets} margin={{ top: 8, right: 16, left: -20, bottom: 0 }} barCategoryGap="20%">
              <defs>
                {GRADIENTS.map((g) => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={g.start} stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--card))" stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} width={40} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Bar dataKey="count" radius={0} maxBarSize={50}>
                {data.buckets.map((_, i) => (
                  <Cell key={i} fill={`url(#${GRADIENTS[i]?.id ?? GRADIENTS[0].id})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}