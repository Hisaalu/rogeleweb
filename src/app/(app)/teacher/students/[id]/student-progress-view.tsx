'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, User, Mail, GraduationCap, LineChart as ChartIcon, 
  Trophy, TrendingUp, Download, CheckCircle2, XCircle
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import type { AdminUser } from '@/types/admin'
import type { QuizAttempt } from '@/types/quiz'
import { formatDate } from '@/lib/utils'

export function StudentProgressView({ student, attempts }: { student: AdminUser, attempts: QuizAttempt[] }) {
  const name = [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Student'
  
  const completedAttempts = useMemo(() => {
    return attempts
      .filter(a => a.status === 'completed' && a.score !== undefined)
      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
  }, [attempts])

  const recentAttempts = useMemo(() => completedAttempts.slice(0, 5), [completedAttempts])

  const totalQuizzes = completedAttempts.length
  const avgScore = totalQuizzes > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalQuizzes) 
    : 0
  const highestScore = totalQuizzes > 0 ? Math.max(...completedAttempts.map(a => a.score || 0)) : 0
  const lowestScore = totalQuizzes > 0 ? Math.min(...completedAttempts.map(a => a.score || 0)) : 0

  const chartData = recentAttempts.slice().reverse().map((a, i) => ({
    name: `Quiz ${i + 1}`,
    score: a.score,
    passing: 50,
  }))

  function handleExport() {
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
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      
      <div>
        <Link href="/teacher/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to Students
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
          <ChartIcon size={24} /> Student Performance
        </h1>
        <p className="text-sm text-muted-foreground">Quiz performance for {name}</p>
      </div>

      <div className="flex flex-wrap items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg" style={{ backgroundColor: 'var(--brand-accent)' }}>
          {student.profile_photo ? (
            <img src={student.profile_photo} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={14} style={{ color: 'var(--brand-accent)' }} /> {student.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap size={14} style={{ color: 'var(--brand-accent)' }} /> {student.role === 'learner' ? 'Learner' : 'External Student'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickStat label="Quizzes Taken" value={totalQuizzes} />
          <QuickStat label="Average Score" value={`${avgScore}%`} />
          <QuickStat label="Highest Score" value={`${highestScore}%`} />
          <QuickStat label="Lowest Score" value={`${lowestScore}%`} />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ChartIcon size={18} style={{ color: 'var(--brand-accent)' }} /> Last 5 Quiz Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                  itemStyle={{ color: 'var(--brand-primary)' }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--brand-accent)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="passing" stroke="#23a74c" strokeDasharray="5 5" dot={false} strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardIcon /> Recent Results
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
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-6 py-3 font-semibold">Quiz ID</th>
                  <th className="px-6 py-3 font-semibold text-center">Score</th>
                  <th className="px-6 py-3 font-semibold">Result</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAttempts.map((attempt, idx) => {
                  const passed = (attempt.score || 0) >= 50
                  return (
                    <tr key={attempt.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-foreground">Quiz #{attempt.quiz_id}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
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
          <SummaryCard icon={TrendingUp} label="Improvement Trend" value="Stable" sub="Based on last 5 quizzes" />
        </div>
      )}
    </div>
  )
}

function QuickStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="rounded-xl bg-muted px-4 py-3 text-center">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: 'var(--brand-accent)' }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function ClipboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-accent)' }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
}