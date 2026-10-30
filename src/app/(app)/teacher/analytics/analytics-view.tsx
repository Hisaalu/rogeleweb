'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  startTransition,
} from 'react'
import Link from 'next/link'
import {
  Users,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  Eye,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  getEnrollmentTrendClient,
  type EnrollmentTrend,
  type AtRiskData,
  type TeacherOverview,
} from '@/lib/analytics.client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const customTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'This year' },
] as const

const StatCard = React.memo(function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: any
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md sm:gap-4 sm:p-5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white sm:h-12 sm:w-12"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        <Icon size={20} className="sm:hidden" />
        <Icon size={22} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-xl font-bold text-foreground sm:text-2xl">
          {loading ? <span className="opacity-40">—</span> : value}
        </p>
      </div>
    </Card>
  )
})

function CardSpinner({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden={!visible}
      className={`absolute right-3 top-3 transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Loader2 size={14} className="animate-spin text-muted-foreground" />
    </span>
  )
}

export function AnalyticsView({
  stats,
  lessons,
  classCounts,
  initialEnrollment,
  initialAtRisk,
  initialTeacherOverview,
  initialRange,
}: {
  stats: any
  lessons: any[]
  classCounts: any[]
  initialEnrollment: EnrollmentTrend | null
  initialAtRisk: AtRiskData | null
  initialTeacherOverview: TeacherOverview | null
  initialRange: string
}) {
  const totalStudents = useMemo(
    () => initialTeacherOverview?.total_students ?? 
         (stats?.users_by_role?.learner ?? 0) + (stats?.users_by_role?.external ?? 0),
    [stats, initialTeacherOverview],
  )

  const enrollmentByClassData = useMemo(() => {
    return [...classCounts]
      .sort((a, b) => b.learner_count - a.learner_count)
      .slice(0, 8)
      .map((c) => ({
        name:
          c.class_name.length > 12
            ? c.class_name.slice(0, 12) + '...'
            : c.class_name,
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

  const [range, setRange] = useState(initialRange)
  const [enrollment, setEnrollment] = useState<EnrollmentTrend | null>(
    initialEnrollment,
  )
  const [atRisk] = useState<AtRiskData | null>(initialAtRisk)
  const [isFetching, setIsFetching] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsFetching(true)

    getEnrollmentTrendClient(Number(range), controller.signal)
      .then((data) => {
        startTransition(() => {
          setEnrollment(data)
          setIsFetching(false)
        })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return 
        console.error('[analytics] enrollment refetch failed', err)
        setIsFetching(false)
      })

    return () => controller.abort()
  }, [range])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => setRange(next), 120)
    },
    [],
  )

  const totalEnrollment = enrollment?.total || 0
  const averageScore = initialTeacherOverview?.average_score != null 
    ? `${Math.round(initialTeacherOverview.average_score)}%` 
    : 'N/A'
  
  const atRiskCount = atRisk?.summary?.at_risk || 0

  const enrollmentChartData = useMemo(() => {
    return (enrollment?.points || []).map((p) => ({
      period: new Date(p.period).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: p.count,
      moving_average: p.moving_average,
    }))
  }, [enrollment])

  const recommendations = useMemo(() => {
    const recs: { tone: 'danger' | 'warning'; title: string; description: string }[] = []
    if (atRiskCount > 0) {
      recs.push({
        tone: 'danger',
        title: `${atRiskCount} students at high risk`,
        description:
          "These learners haven't engaged in days or are struggling. Consider a check-in.",
      })
    }
    if (atRisk?.summary?.watch && atRisk.summary.watch > 0) {
      recs.push({
        tone: 'warning',
        title: `${atRisk.summary.watch} students to watch`,
        description:
          'These learners are starting to slip. A gentle nudge might help.',
      })
    }
    return recs
  }, [atRisk, atRiskCount])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1
            className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl"
            style={{ color: 'var(--brand-primary)' }}
          >
            <BarChart2 size={24} className="shrink-0 sm:hidden" />
            <BarChart2 size={28} className="hidden shrink-0 sm:block" />
            <span className="truncate">Analytics</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track Performance and Engagement
          </p>
        </div>
        <div className="relative w-full shrink-0 sm:w-auto">
          <Select
            value={range}
            onChange={handleRangeChange}
            aria-label="Select date range"
            className="w-full pr-10 sm:w-auto"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {isFetching && (
            <Loader2
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            />
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {recommendations.map((rec, i) => {
            const isDanger = rec.tone === 'danger'
            return (
              <div
                key={i}
                className="flex gap-3 rounded-md border p-4"
                style={{
                  backgroundColor: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  borderColor: isDanger ? 'var(--danger-border)' : 'var(--warning-border)',
                }}
              >
                <Lightbulb
                  size={20}
                  className="shrink-0"
                  style={{
                    color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)',
                  }}
                />
                <div>
                  <h4
                    className="text-sm font-semibold"
                    style={{
                      color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)',
                    }}
                  >
                    {rec.title}
                  </h4>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{
                      color: isDanger ? 'var(--danger-fg)' : 'var(--warning-fg)',
                      opacity: 0.9,
                    }}
                  >
                    {rec.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="New Enrollments"
          value={totalEnrollment}
          loading={isFetching}
        />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        <StatCard
          icon={TrendingUp}
          label="True Class Average"
          value={averageScore}
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Students"
          value={atRiskCount}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="relative p-4 sm:p-6">
          <CardSpinner visible={isFetching} />
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <TrendingUp size={18} style={{ color: 'var(--brand-accent)' }} />{' '}
            Enrollment Trend
          </h3>
          <div
            className={`h-[240px] transition-opacity sm:h-[300px] ${
              isFetching ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {enrollmentChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No enrollment data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={enrollmentChartData}
                  margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
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
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <Users size={18} style={{ color: 'var(--brand-accent)' }} />{' '}
            Enrollment by Class
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            {enrollmentByClassData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No class data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={enrollmentByClassData}
                  margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
                  barCategoryGap="25%"
                >
                  <defs>
                    <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.6} />
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
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
            <Eye size={18} style={{ color: 'var(--brand-accent)' }} /> Top 5
            Viewed Lessons
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            {topLessonsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No lesson views.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topLessonsData}
                  margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
                  barCategoryGap="25%"
                >
                  <defs>
                    <linearGradient id="barAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0.6} />
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
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle size={18} style={{ color: 'var(--danger-border)' }} />{' '}
                Students Needing Attention
              </h3>
              <p className="text-xs text-muted-foreground">
                Ranked by risk score.
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-fg)',
              }}
            >
              {atRiskCount} At Risk
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!atRisk?.learners || atRisk.learners.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <ShieldCheck size={32} className="mb-2 opacity-50" style={{ color: 'var(--success-border)' }} />
                <p className="text-sm font-semibold text-foreground">
                  All Clear!
                </p>
                <p className="text-xs text-muted-foreground">
                  No students at risk.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {atRisk.learners.slice(0, 5).map((l) => (
                  <div key={l.user_id} className="flex items-center justify-between px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {l.first_name} {l.last_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.reasons[0] || 'Multiple issues'}
                      </p>
                    </div>
                    <Link href={`/teacher/students/${l.user_id}`} className="ml-3 shrink-0">
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}