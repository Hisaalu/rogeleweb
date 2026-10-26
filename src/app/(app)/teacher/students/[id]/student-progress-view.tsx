'use client'

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Mail, GraduationCap, LineChart as ChartIcon, 
  Trophy, TrendingUp, Download, CheckCircle2, XCircle
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import type { AdminUser } from '@/types/admin'
import type { QuizAttempt } from '@/types/quiz'
import { formatDate } from '@/lib/utils'

const QuickStat = React.memo(function QuickStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  )
})

const SummaryCard = React.memo(function SummaryCard({ icon: Icon, label, value, sub, tone = 'default' }: { icon: any, label: string, value: string, sub: string, tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const bg = tone === 'danger' ? 'var(--danger-bg)' : tone === 'warning' ? 'var(--warning-bg)' : tone === 'success' ? 'var(--success-bg)' : 'var(--brand-accent)'
  const fg = tone === 'danger' ? 'var(--danger-fg)' : tone === 'warning' ? 'var(--warning-fg)' : tone === 'success' ? 'var(--success-fg)' : 'white'
  
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color: fg }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
})

export function StudentProgressView({ 
  student, 
  attempts,
  atRiskData 
}: { 
  student: AdminUser
  attempts: QuizAttempt[]
  atRiskData: any 
}) {
  const name = [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Student'
  
  const completedAttempts = useMemo(() => {
    return attempts
      .filter(a => a.status === 'completed' && a.score !== undefined)
      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
  }, [attempts])

  const recentAttempts = useMemo(() => completedAttempts.slice(0, 5), [completedAttempts])

  const { totalQuizzes, avgScore, highestScore, lowestScore } = useMemo(() => {
    if (completedAttempts.length === 0) return { totalQuizzes: 0, avgScore: 0, highestScore: 0, lowestScore: 0 }
    return {
      totalQuizzes: completedAttempts.length,
      avgScore: Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length),
      highestScore: Math.max(...completedAttempts.map(a => a.score || 0)),
      lowestScore: Math.min(...completedAttempts.map(a => a.score || 0))
    }
  }, [completedAttempts])

  const chartData = useMemo(() => {
    return recentAttempts.slice().reverse().map((a, i) => ({
      name: `Quiz ${i + 1}`,
      score: a.score,
      passing: 50,
    }))
  }, [recentAttempts])

  const studentRisk = atRiskData?.learners?.find((l: any) => l.user_id === student.id)
  const improvementTrend = studentRisk?.risk_band === 'at_risk' ? 'Needs Attention' : studentRisk?.risk_band === 'watch' ? 'Slipping' : 'Stable'

  const handleExport = useCallback(() => {
    const headers = ['Quiz ID', 'Score', 'Result', 'Date']
    const rows = completedAttempts.map(a => [
      a.quiz_id,
      `${a.score}%`,
      (a.score || 0) >= 50 ? 'Passed' : 'Failed',
      a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'N/A'
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.replace(/\s+/g, '_')}_results.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [completedAttempts, name])

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      
      <div>
        <Link href="/teacher/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Students
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
          <ChartIcon size={24} className="shrink-0" /> Student Performance
        </h1>
        <p className="text-sm text-muted-foreground">Quiz performance for {name}</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start sm:p-8">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--brand-accent)' }}>
          {student.profile_photo ? (
            <img src={student.profile_photo} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>
        
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <Mail size={14} style={{ color: 'var(--brand-accent)' }} /> {student.email}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <GraduationCap size={14} style={{ color: 'var(--brand-accent)' }} /> {student.role === 'learner' ? 'Learner' : 'External Student'}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
          <QuickStat label="Quizzes" value={totalQuizzes} />
          <QuickStat label="Average" value={`${avgScore}%`} />
          <QuickStat label="Highest" value={`${highestScore}%`} />
          <QuickStat label="Lowest" value={`${lowestScore}%`} />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ChartIcon size={18} style={{ color: 'var(--brand-accent)' }} /> Last 5 Quiz Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12, color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--brand-accent)' }}
                />
                {/* Thinner line weights here */}
                <Area type="monotone" dataKey="score" stroke="var(--brand-accent)" strokeWidth={1} fillOpacity={1} fill="url(#colorScore)" dot={{ r: 3, fill: 'var(--brand-accent)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="passing" stroke="var(--success-border)" strokeDasharray="4 4" fillOpacity={0} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ChartIcon size={18} style={{ color: 'var(--brand-accent)' }} /> Recent Results
          </h3>
          {completedAttempts.length > 0 && (
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/80">
              <Download size={16} /> Export All
            </button>
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
                  <th className="px-4 py-3 font-semibold sm:px-6">Quiz ID</th>
                  <th className="px-4 py-3 font-semibold text-center sm:px-6">Score</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Result</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAttempts.map((attempt, idx) => {
                  const passed = (attempt.score || 0) >= 50
                  return (
                    <tr key={attempt.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4 sm:px-6">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-foreground sm:px-6">Quiz #{attempt.quiz_id}</td>
                      <td className="px-4 py-4 text-center sm:px-6">
                        <span 
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-sm"
                          style={{ backgroundColor: passed ? 'var(--success-bg)' : 'var(--danger-bg)', color: passed ? 'var(--success-fg)' : 'var(--danger-fg)' }}
                        >
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground sm:px-6">
                        {attempt.completed_at ? formatDate(attempt.completed_at) : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {completedAttempts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={Trophy} label="Best Performance" value={`${highestScore}%`} sub="Top score achieved" />
          <SummaryCard icon={ChartIcon} label="Average Score" value={`${avgScore}%`} sub={`Over ${totalQuizzes} quizzes`} />
          <SummaryCard 
            icon={TrendingUp} 
            label="Improvement Trend" 
            value={improvementTrend} 
            sub="Based on recent activity" 
            tone={improvementTrend === 'Needs Attention' ? 'danger' : improvementTrend === 'Slipping' ? 'warning' : 'success'}
          />
        </div>
      )}
    </div>
  )
}