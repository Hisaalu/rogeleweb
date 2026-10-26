'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { GraduationCap } from 'lucide-react'
import type { ClassLearnerCount } from '@/lib/admin.server'

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

export function LearnersByClassChart({ data }: { data: ClassLearnerCount[] }) {
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.learner_count - a.learner_count)
      .slice(0, 7) 
      .map((c) => ({
        name: c.class_name.length > 10 ? `${c.class_name.slice(0, 10)}...` : c.class_name,
        learners: c.learner_count,
      }))
  }, [data])

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-2 border-b border-border px-5 py-4">
        <GraduationCap size={16} className="text-[var(--brand-accent)]" />
        <div>
          <h3 className="text-sm font-semibold">Learners by Class</h3>
          <p className="text-xs text-muted-foreground">Distribution across active classes</p>
        </div>
      </header>

      <div className="h-[280px] w-full p-4 sm:p-5">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No class data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
              <defs>
                <linearGradient id="colorLearners" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                width={40}
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
              
              <Bar
                dataKey="learners"
                name="Learners"
                fill="url(#colorLearners)"
                radius={0} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}