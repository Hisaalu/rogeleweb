'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { HelpCircle } from 'lucide-react'
import type { ScoreDistribution } from '@/lib/analytics.client'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export function ScoreDistributionChart({ data }: { data: ScoreDistribution | null }) {
  if (!data || data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score distribution</CardTitle>
          <CardDescription>Across all completed quiz attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={HelpCircle}
            title="No quiz data yet"
            description="Score buckets will appear once learners complete quizzes."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score distribution</CardTitle>
        <CardDescription>
          {data.total} attempt{data.total === 1 ? '' : 's'} · average {data.average.toFixed(0)}% · median {data.median}% · {data.passing_pct.toFixed(0)}% passing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.buckets} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(229 231 235)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" />
              <YAxis tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={0}>
                {data.buckets.map((_, i) => (
                  <Cell key={i} fill={COLORS[i] ?? COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}