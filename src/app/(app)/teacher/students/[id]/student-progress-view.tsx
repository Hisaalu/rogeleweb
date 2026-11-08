'use client'

import { useRouter } from 'next/navigation'
import React, { useMemo, useCallback } from 'react'
import {
  ArrowLeft, Mail, GraduationCap, LineChart as ChartIcon,
  Trophy, TrendingUp, Download, CheckCircle2, XCircle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { AdminUser } from '@/types/admin'
import type { QuizAttempt } from '@/types/quiz'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const QuickStat = React.memo(function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2.5 text-center sm:px-4 sm:py-3">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="text-base font-bold tabular-nums text-foreground sm:text-lg">{value}</p>
    </div>
  )
})

const TONE_MAP = {
  default: { bg: 'bg-brand-accent', fg: 'text-white' },
  success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
  warning: { bg: 'bg-warning-bg', fg: 'text-warning-fg' },
  danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg' },
} as const

const SummaryCard = React.memo(function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  tone?: keyof typeof TONE_MAP
}) {
  const t = TONE_MAP[tone]
  return (
    <Card className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md sm:h-12 sm:w-12 ${t.bg} ${t.fg}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {value}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </Card>
  )
})

export function StudentProgressView({
  student,
  attempts,
  atRiskData,
}: {
  student: AdminUser
  attempts: QuizAttempt[]
  atRiskData: unknown
}) {
  const name = [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Student'

  const completedAttempts = useMemo(() => {
    return attempts
      .filter((a) => a.status === 'completed' && a.score !== undefined)
      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
  }, [attempts])

  const recentAttempts = useMemo(() => completedAttempts.slice(0, 5), [completedAttempts])

  const { totalQuizzes, avgScore, highestScore, lowestScore } = useMemo(() => {
    if (completedAttempts.length === 0) {
      return { totalQuizzes: 0, avgScore: 0, highestScore: 0, lowestScore: 0 }
    }
    return {
      totalQuizzes: completedAttempts.length,
      avgScore: Math.round(
        completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length,
      ),
      highestScore: Math.max(...completedAttempts.map((a) => a.score || 0)),
      lowestScore: Math.min(...completedAttempts.map((a) => a.score || 0)),
    }
  }, [completedAttempts])

  const chartData = useMemo(() => {
    return recentAttempts
      .slice()
      .reverse()
      .map((a, i) => ({ name: `Quiz ${i + 1}`, score: a.score, passing: 50 }))
  }, [recentAttempts])

  const studentRisk =
    atRiskData &&
    typeof atRiskData === 'object' &&
    Array.isArray((atRiskData as { learners?: unknown }).learners)
      ? ((atRiskData as { learners: Array<{ user_id: number; risk_band: string }> }).learners).find(
          (l) => l.user_id === student.id,
        )
      : null

  const improvementTrend =
    studentRisk?.risk_band === 'at_risk'
      ? 'Needs Attention'
      : studentRisk?.risk_band === 'watch'
        ? 'Slipping'
        : 'Stable'
  
  const router = useRouter()
  const trendTone: keyof typeof TONE_MAP =
    improvementTrend === 'Needs Attention' ? 'danger' : improvementTrend === 'Slipping' ? 'warning' : 'success'

  const handleExport = useCallback(() => {
    const headers = ['Quiz ID', 'Score', 'Result', 'Date']
    const rows = completedAttempts.map((a) => [
      a.quiz_id,
      `${a.score}%`,
      (a.score || 0) >= 50 ? 'Passed' : 'Failed',
      a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'N/A',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.replace(/\s+/g, '_')}_results.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [completedAttempts, name])

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-2xl font-bold text-foreground transition hover:bg-muted hover:opacity-100 sm:text-3xl"
        >
          <ArrowLeft size={26} className="shrink-0" />
          <span className="sr-only">Go back</span>
        </button>

        <div className="pointer-events-none absolute left-1/2 w-full max-w-[70%] -translate-x-1/2 text-center">
          <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
            Student Performance
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            Quiz performance for {name}
          </p>
        </div>
      </div>

      <Card className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-accent text-2xl font-bold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
          {student.profile_photo ? (
            <img
              src={student.profile_photo}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex-1 space-y-1 text-center sm:text-left">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{name}</h2>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <Mail size={14} className="text-brand-accent" /> {student.email}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <GraduationCap size={14} className="text-brand-accent" />{' '}
            {student.role === 'learner' ? 'Learner' : 'External Student'}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4 sm:gap-3">
          <QuickStat label="Quizzes" value={totalQuizzes} />
          <QuickStat label="Average" value={`${avgScore}%`} />
          <QuickStat label="Highest" value={`${highestScore}%`} />
          <QuickStat label="Lowest" value={`${lowestScore}%`} />
        </div>
      </Card>

      {chartData.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
            <ChartIcon size={18} className="text-brand-accent" /> Last 5 Quiz Performance
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="studentScoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    fontSize: 12,
                    color: 'hsl(var(--foreground))',
                    borderRadius: 8,
                  }}
                  itemStyle={{ color: 'var(--brand-accent)' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--brand-accent)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#studentScoreGradient)"
                  dot={{ r: 3, fill: 'var(--brand-accent)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="passing"
                  stroke="var(--success-border)"
                  strokeDasharray="4 4"
                  fillOpacity={0}
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
            <ChartIcon size={18} className="text-brand-accent" /> Recent Results
          </h3>
          {completedAttempts.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-2" /> Export All
            </Button>
          )}
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ChartIcon size={40} className="mx-auto mb-3 opacity-20" />
            <p>No quiz attempts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-6">#</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Quiz</th>
                  <th className="px-4 py-3 text-center font-semibold sm:px-6">Score</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Result</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAttempts.map((attempt, idx) => {
                  const passed = (attempt.score || 0) >= 50
                  return (
                    <tr key={attempt.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground sm:px-6">
                        Quiz #{attempt.quiz_id}
                      </td>
                      <td className="px-4 py-3 text-center sm:px-6">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                            passed ? 'bg-success-bg text-success-fg' : 'bg-danger-bg text-danger-fg'
                          }`}
                        >
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-fg">
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger-fg">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground sm:px-6">
                        {attempt.completed_at ? formatDate(attempt.completed_at) : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {completedAttempts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <SummaryCard
            icon={Trophy}
            label="Best Performance"
            value={`${highestScore}%`}
            sub="Top score achieved"
            tone="success"
          />
          <SummaryCard
            icon={ChartIcon}
            label="Average Score"
            value={`${avgScore}%`}
            sub={`Over ${totalQuizzes} quizzes`}
          />
          <div className="col-span-2 sm:col-span-1">
            <SummaryCard
              icon={TrendingUp}
              label="Improvement Trend"
              value={improvementTrend}
              sub="Based on recent activity"
              tone={trendTone}
            />
          </div>
        </div>
      )}
    </div>
  )
}