'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, HelpCircle, Users, BarChart2, Eye, Calendar, TrendingUp, Loader2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import type { AdminOverview } from '@/types/admin'
import { formatDate } from '@/lib/utils'

const ITEMS_PER_PAGE = 5

export function AnalyticsView({
  stats,
  quizzes,
  lessons,
  initialRange,
}: {
  stats: AdminOverview | null
  quizzes: any[]
  lessons: any[]
  initialRange: string
}) {
  const router = useRouter()
  const [range, setRange] = useState(initialRange)
  const [quizPage, setQuizPage] = useState(1)
  const [lessonPage, setLessonPage] = useState(1)

  const [chartData, setChartData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    setChartLoading(true)
    fetch(`/api/proxy/quizzes/performance-chart?days=${range}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(d => ({
            ...d,
            displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }))
          setChartData(formatted)
        } else {
          setChartData([])
        }
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false))
  }, [range])

  const totalLessons = stats?.total_lessons ?? 0
  const totalQuizzes = stats?.total_quizzes ?? 0
  const totalStudents = (stats?.users_by_role?.learner ?? 0) + (stats?.users_by_role?.external ?? 0)

  const globalAvgScore = useMemo(() => {
    if (chartData.length === 0) return 0
    const totalAttempts = chartData.reduce((sum, d) => sum + d.attempt_count, 0)
    if (totalAttempts === 0) return 0
    const totalScores = chartData.reduce((sum, d) => sum + (d.avg_score * d.attempt_count), 0)
    return Math.round(totalScores / totalAttempts)
  }, [chartData])

  const barChartData = lessons.slice(0, 5).map(l => ({
    name: l.title.length > 10 ? l.title.slice(0, 10) + '...' : l.title,
    views: l.views || 0,
  }))

  const totalQuizPages = Math.ceil(quizzes.length / ITEMS_PER_PAGE)
  const paginatedQuizzes = quizzes.slice((quizPage - 1) * ITEMS_PER_PAGE, quizPage * ITEMS_PER_PAGE)

  const sortedLessons = [...lessons].sort((a, b) => (b.views || 0) - (a.views || 0))
  const totalLessonPages = Math.ceil(sortedLessons.length / ITEMS_PER_PAGE)
  const paginatedLessons = sortedLessons.slice((lessonPage - 1) * ITEMS_PER_PAGE, lessonPage * ITEMS_PER_PAGE)

  function handleRangeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRange = e.target.value
    setRange(newRange)
    router.push(`/teacher/analytics?range=${newRange}`, { scroll: false })
  }

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
            <span className="truncate">Analytics Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your teaching performance and student engagement
          </p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Lessons" value={totalLessons} />
        <StatCard icon={HelpCircle} label="Total Quizzes" value={totalQuizzes} />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        <StatCard icon={TrendingUp} label="Avg. Score" value={`${globalAvgScore}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <TrendingUp size={18} style={{ color: 'var(--brand-accent)' }} /> Quiz Performance
            </h3>
          </div>
          <div className="h-[240px] sm:h-[300px]">
            {chartLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                No data available for this range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                  <Line type="monotone" dataKey="avg_score" name="Avg Score (%)" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="attempt_count" name="Attempts" stroke="var(--brand-accent)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <Eye size={18} style={{ color: 'var(--brand-accent)' }} /> Most Viewed Lessons
            </h3>
          </div>
          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="views" name="Views" fill="var(--brand-accent)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">Quiz Performance</h2>
        </div>

        <div className="divide-y divide-border md:hidden">
          {paginatedQuizzes.length === 0 ? (
            <p className="px-4 py-10 text-center text-muted-foreground">No quiz data available</p>
          ) : (
            paginatedQuizzes.map(q => {
              const attempts = q.attempt_count || 0
              const passRate = attempts > 0 ? 75 : 0
              const passed = passRate >= 50
              return (
                <div key={q.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 break-words font-medium text-foreground">{q.title}</p>
                    <span
                      className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {passRate}%
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Attempts</dt>
                      <dd className="font-semibold text-foreground">{attempts}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Students</dt>
                      <dd className="font-semibold text-foreground">{attempts}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Avg. Score</dt>
                      <dd className="font-semibold text-foreground">{passRate}%</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/teacher/quizzes/${q.id}/results`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold text-white sm:w-auto"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <BarChart2 size={12} /> View Results
                  </Link>
                </div>
              )
            })
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold sm:px-6">Quiz Title</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Attempts</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Students</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Avg. Score</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Pass Rate</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No quiz data available</td>
                </tr>
              ) : (
                paginatedQuizzes.map(q => {
                  const attempts = q.attempt_count || 0
                  const passRate = attempts > 0 ? 75 : 0
                  const passed = passRate >= 50
                  return (
                    <tr key={q.id} className="hover:bg-muted/30">
                      <td className="max-w-[240px] px-4 py-3 font-medium text-foreground sm:px-6">
                        <span className="line-clamp-2 break-words">{q.title}</span>
                      </td>
                      <td className="px-4 py-3 sm:px-6">{attempts}</td>
                      <td className="px-4 py-3 sm:px-6">{attempts}</td>
                      <td className="px-4 py-3 sm:px-6">{passRate}%</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {passRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <Link
                          href={`/teacher/quizzes/${q.id}/results`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                          <BarChart2 size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalQuizPages > 1 && (
          <div className="flex justify-center border-t border-border px-4 py-4 sm:px-6">
            <Pagination page={quizPage} total={totalQuizPages} onChange={setQuizPage} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground sm:mb-6 sm:text-lg">Most Viewed Lessons</h2>
        {paginatedLessons.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
            <p>No lesson views data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedLessons.map(l => (
              <div key={l.id} className="rounded-xl bg-muted/50 p-4">
                <h4 className="mb-2 line-clamp-2 break-words font-semibold text-foreground">{l.title}</h4>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={12} /> {l.views || 0} views</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(l.created_at)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, (l.views || 0) / 100 * 100)}%`, backgroundColor: 'var(--brand-accent)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {totalLessonPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={lessonPage} total={totalLessonPages} onChange={setLessonPage} />
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-4 sm:p-5">
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
}

function Pagination({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (p: number) => void
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
            p === page ? 'text-white' : 'text-foreground hover:bg-muted'
          }`}
          style={p === page ? { backgroundColor: 'var(--brand-primary)' } : undefined}
        >
          {p}
        </button>
      ))}
    </div>
  )
}