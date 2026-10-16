'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { ClassLearnerCount } from '@/lib/admin.server'

export function LearnersByClassChart({ data }: { data: ClassLearnerCount[] }) {
  const total = data.reduce((sum, c) => sum + c.learner_count, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learners by class</CardTitle>
          <CardDescription>Learner count per class</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={GraduationCap}
            title="No classes yet"
            description="Create classes and assign learners to see the distribution here."
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((c) => ({
    name: c.class_name,
    count: c.learner_count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learners by class</CardTitle>
        <CardDescription>
          {total} learner{total === 1 ? '' : 's'} across {data.length} class
          {data.length === 1 ? '' : 'es'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(229 231 235)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" />
              <YAxis tick={{ fontSize: 11 }} stroke="rgb(156 163 175)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--brand-primary)"
                radius={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}