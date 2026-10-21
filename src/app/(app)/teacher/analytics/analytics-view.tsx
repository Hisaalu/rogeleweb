'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, HelpCircle, Users, BarChart2, Eye, Calendar, TrendingUp, Loader2
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
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

  // Fetch chart data whenever range changes
  useEffect(() => {
    setChartLoading(true)
    fetch(`/api/proxy/quizzes/performance-chart?days=${range}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(d => ({
            ...d,
            displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }))
          setChartData(formatted)
        } else {
          setChartData([])
        }
      })
      .catch(() => {
        setChartData([])
      })
      .finally(() => {
        setChartLoading(false)
      })
  }, [range])

  // --- DYNAMIC STATS CALCULATION ---
  
  const totalLessons = stats?.total_lessons ?? 0
  const totalQuizzes = stats?.total_quizzes ?? 0
  const totalStudents = (stats?.users_by_role?.learner ?? 0) + (stats?.users_by_role?.external ?? 0)
  
  // Calculate the global average score from the fetched chart data
  const globalAvgScore = useMemo(() => {
    if (chartData.length === 0) return 0
    const totalAttempts = chartData.reduce((sum, d) => sum + d.attempt_count, 0)
    if (totalAttempts === 0) return 0
    
    // Calculate the weighted average (sum of all scores / total attempts)
    const totalScores = chartData.reduce((sum, d) => sum + (d.avg_score * d.attempt_count), 0)
    return Math.round(totalScores / totalAttempts)
  }, [chartData])

  // Bar Chart Data
  const barChartData = lessons.slice(0, 5).map(l => ({
    name: l.title.length > 10 ? l.title.slice(0, 10) + '...' : l.title,
    views: l.views || 0
  }))

  // Pagination logic for Quizzes
  const totalQuizPages = Math.ceil(quizzes.length / ITEMS_PER_PAGE)
  const paginatedQuizzes = quizzes.slice((quizPage - 1) * ITEMS_PER_PAGE, quizPage * ITEMS_PER_PAGE)

  // Pagination logic for Lessons
  const sortedLessons = [...lessons].sort((a, b) => (b.views || 0) - (a.views || 0))
  const totalLessonPages = Math.ceil(sortedLessons.length / ITEMS_PER_PAGE)
  const paginatedLessons = sortedLessons.slice((lessonPage - 1) * ITEMS_PER_PAGE, lessonPage * ITEMS_PER_PAGE)

  function handleRangeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRange = e.target.value
    setRange(newRange)
    router.push(`/teacher/analytics?range=${newRange}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <BarChart2 size={28} /> Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your teaching performance and student engagement</p>
        </div>
        <select 
          value={range}
          onChange={handleRangeChange}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">This year</option>
        </select>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Lessons" value={totalLessons} />
        <StatCard icon={HelpCircle} label="Total Quizzes" value={totalQuizzes} />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        {/* The average score now reflects the selected time range */}
        <StatCard icon={TrendingUp} label="Avg. Score" value={`${globalAvgScore}%`} />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Line Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp size={18} style={{ color: 'var(--brand-accent)' }} /> Quiz Performance
            </h3>
          </div>
          <div className="h-[300px]">
            {chartLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available for this range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                  <Line type="monotone" dataKey="avg_score" name="Avg Score (%)" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="attempt_count" name="Attempts" stroke="var(--brand-accent)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart (Sharp Corners) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Eye size={18} style={{ color: 'var(--brand-accent)' }} /> Most Viewed Lessons
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} cursor={{ fill: 'hsl(var(--muted))' }} />
                {/* radius={0} makes the corners sharp */}
                <Bar dataKey="views" name="Views" fill="var(--brand-accent)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quiz Performance Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Quiz Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Quiz Title</th>
                <th className="px-6 py-3 font-semibold">Attempts</th>
                <th className="px-6 py-3 font-semibold">Students</th>
                <th className="px-6 py-3 font-semibold">Avg. Score</th>
                <th className="px-6 py-3 font-semibold">Pass Rate</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedQuizzes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No quiz data available</td></tr>
              ) : (
                paginatedQuizzes.map(q => {
                  const attempts = q.attempt_count || 0
                  const passRate = attempts > 0 ? 75 : 0
                  const passed = passRate >= 50
                  return (
                    <tr key={q.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3 font-medium text-foreground">{q.title}</td>
                      <td className="px-6 py-3">{attempts}</td>
                      <td className="px-6 py-3">{attempts}</td>
                      <td className="px-6 py-3">{passRate}%</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {passRate}%
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Link href={`/teacher/quizzes/${q.id}/results`} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>
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
          <div className="flex justify-center border-t border-border py-4">
            <Pagination page={quizPage} total={totalQuizPages} onChange={setQuizPage} />
          </div>
        )}
      </div>

      {/* Most Viewed Lessons Grid */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Most Viewed Lessons</h2>
        {paginatedLessons.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
            <p>No lesson views data available</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedLessons.map(l => (
              <div key={l.id} className="rounded-xl bg-muted/50 p-4">
                <h4 className="mb-2 truncate font-semibold text-foreground">{l.title}</h4>
                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={12} /> {l.views || 0} views</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(l.created_at)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (l.views || 0) / 100 * 100)}%`, backgroundColor: 'var(--brand-accent)' }} />
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

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: 'var(--brand-accent)' }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function Pagination({ page, total, onChange }: { page: number, total: number, onChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-2">
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