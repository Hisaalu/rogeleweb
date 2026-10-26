'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users, BarChart2, TrendingUp, AlertTriangle, ShieldCheck, Lightbulb,
  Eye
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'

const customTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

const StatCard = React.memo(function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-4 sm:p-5 transition-shadow hover:shadow-md">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        <Icon size={20} className="sm:hidden" />
        <Icon size={22} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-xl font-bold text-foreground sm:text-2xl">{value}</p>
      </div>
    </div>
  )
})

export function AnalyticsView({
  stats,
  lessons,
  classCounts,
  enrollment,
  atRisk,
  scores,
  initialRange,
}: {
  stats: any
  lessons: any[]
  classCounts: any[]
  enrollment: any
  atRisk: any
  scores: any
  initialRange: string
}) {
  const router = useRouter()
  const [range, setRange] = useState(initialRange)

  const totalEnrollment = enrollment?.total || 0
  const averageScore = scores?.average || 0
  const atRiskCount = atRisk?.summary?.at_risk || 0
  const totalStudents = (stats?.users_by_role?.learner ?? 0) + (stats?.users_by_role?.external ?? 0)

  const enrollmentChartData = useMemo(() => {
    return (enrollment?.points || []).map((p: any) => ({
      period: new Date(p.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: p.count,
      moving_average: p.moving_average,
    }))
  }, [enrollment])

  const enrollmentByClassData = useMemo(() => {
    return [...classCounts]
      .sort((a, b) => b.learner_count - a.learner_count)
      .slice(0, 8)
      .map((c) => ({
        name: c.class_name.length > 12 ? c.class_name.slice(0, 12) + '...' : c.class_name,
        students: c.learner_count,
      }))
  }, [classCounts])

  const topLessonsData = useMemo(() => {
    return [...lessons]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((l) => ({
        name: l.title.length > 10 ? l.title.slice(0, 10) + '...' : l.title,
        views: l.views || 0,
      }))
  }, [lessons])

  const recommendations = useMemo(() => {
    const recs = []
    if (atRiskCount > 0) {
      recs.push({
        tone: 'danger',
        title: `${atRiskCount} students at high risk`,
        description: "These learners haven't engaged in days or are struggling. Consider a check-in.",
      })
    }
    if (atRisk?.summary?.watch > 0) {
      recs.push({
        tone: 'warning',
        title: `${atRisk.summary.watch} students to watch`,
        description: "These learners are starting to slip. A gentle nudge might help.",
      })
    }
    if (scores?.passing_pct < 50 && scores?.total > 0) {
      recs.push({
        tone: 'warning',
        title: 'Low pass rate',
        description: `Only ${scores.passing_pct}% of attempts are passing. Consider reviewing difficult topics.`,
      })
    }
    return recs
  }, [atRisk, atRiskCount, scores])

  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRange(e.target.value)
    router.push(`/teacher/analytics?range=${e.target.value}`, { scroll: false })
  }, [router])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <BarChart2 size={24} className="shrink-0 sm:hidden" />
            <BarChart2 size={28} className="hidden shrink-0 sm:block" />
            <span className="truncate">Analytics</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Track Performance and Engagement</p>
        </div>
        <select
          value={range}
          onChange={handleRangeChange}
          className="w-full shrink-0 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent sm:w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">This year</option>
        </select>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {recommendations.map((rec: any, i) => {
            const isDanger = rec.tone === 'danger'
            return (
              <div 
                key={i} 
                className={`flex gap-3 rounded-xl border p-4 ${
                  isDanger ? 'border-destructive/20' : 'border-warning/20'
                }`}
                style={{ backgroundColor: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)' }}
              >
                <Lightbulb 
                  size={20} 
                  className={`shrink-0 ${isDanger ? 'text-destructive' : 'text-warning'}`} 
                  style={{ color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)' }}
                />
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)' }}>
                    {rec.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)', opacity: 0.9 }}>
                    {rec.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="New Enrollments" value={totalEnrollment} />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        <StatCard icon={TrendingUp} label="Avg. Score" value={`${Math.round(averageScore)}%`} />
        <StatCard icon={AlertTriangle} label="At-Risk Students" value={atRiskCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <TrendingUp size={18} style={{ color: 'var(--brand-accent)' }} /> Enrollment Trend
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            {enrollmentChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No enrollment data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Area type="monotone" dataKey="count" name="Signups" stroke="var(--brand-primary)" strokeWidth={1} fillOpacity={1} fill="url(#colorCount)" />
                  <Area type="monotone" dataKey="moving_average" name="Trend" stroke="var(--brand-accent)" strokeWidth={1} strokeDasharray="4 4" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <Users size={18} style={{ color: 'var(--brand-accent)' }} /> Enrollment by Class
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            {enrollmentByClassData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No class data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentByClassData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }} barCategoryGap="25%">
                  <defs>
                    <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                  <Bar dataKey="students" name="Students" fill="url(#barPrimary)" radius={[0, 0, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <Eye size={18} style={{ color: 'var(--brand-accent)' }} /> Top 5 Viewed Lessons
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            {topLessonsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No lesson views.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLessonsData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }} barCategoryGap="25%">
                  <defs>
                    <linearGradient id="barAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                  <Bar dataKey="views" name="Views" fill="url(#barAccent)" radius={[0, 0, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle size={18} style={{ color: 'var(--danger-border)' }} /> Students Needing Attention
              </h3>
              <p className="text-xs text-muted-foreground">Ranked by risk score.</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}
            >
              {atRiskCount} At Risk
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!atRisk?.learners || atRisk.learners.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <ShieldCheck size={32} className="mb-2 opacity-50" style={{ color: 'var(--success-border)' }} />
                <p className="text-sm font-semibold text-foreground">All Clear!</p>
                <p className="text-xs text-muted-foreground">No students at risk.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {atRisk.learners.slice(0, 5).map((l: any) => (
                  <div key={l.user_id} className="flex items-center justify-between px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{l.first_name} {l.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{l.reasons[0] || 'Multiple issues'}</p>
                    </div>
                    <Link
                      href={`/teacher/students/${l.user_id}`}
                      className="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-white ml-3 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}