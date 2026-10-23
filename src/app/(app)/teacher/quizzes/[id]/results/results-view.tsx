'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Trash2, Users, Trophy, LineChart } from 'lucide-react'
import type { Quiz, QuizAttempt } from '@/types/quiz'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function ResultsView({ quiz, attempts }: { quiz: Quiz, attempts: QuizAttempt[] }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalAttempts = attempts.length
  const uniqueStudents = new Set(attempts.map(a => a.user_id)).size
  const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + (a.score ?? 0), 0) / totalAttempts) : 0
  const passingScore = quiz.passing_score ?? 50
  const passRate = totalAttempts > 0 ? Math.round((attempts.filter(a => (a.score ?? 0) >= passingScore).length / totalAttempts) * 100) : 0

  function downloadCSV() {
    const headers = ['Student', 'Email', 'Score (%)', 'Result', 'Date']
    const rows = attempts.map(a => [
      `${a.student_first_name} ${a.student_last_name}`,
      a.student_email ?? '',
      a.score ?? 0,
      (a.score ?? 0) >= passingScore ? 'Passed' : 'Failed',
      a.completed_at ? new Date(a.completed_at).toLocaleString() : ''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_results.csv`
    a.click()
  }

  async function handleDeleteAttempts() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/proxy/quizzes/${quiz.id}/attempts`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      window.location.reload()
    } catch {
      alert('Failed to delete attempts')
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Quizzes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground truncate max-w-full">Results: {quiz.title}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={downloadCSV} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--success-border)' }}>
            <Download size={15} /> Export Excel (CSV)
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--danger-border)' }}>
            <Trash2 size={15} /> Delete Attempts
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Attempts" value={totalAttempts} tone="brand" />
        <StatCard icon={Users} label="Unique Students" value={uniqueStudents} tone="success" />
        <StatCard icon={LineChart} label="Average Score" value={`${avgScore}%`} tone="warning" />
        <StatCard icon={Trophy} label="Pass Rate" value={`${passRate}%`} tone="primary" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">Student Attempts ({totalAttempts})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">#</th>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Score (%)</th>
                <th className="px-6 py-3 font-semibold">Result</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No results yet.</td></tr>
              ) : (
                attempts.map((a, idx) => {
                  const passed = (a.score ?? 0) >= passingScore
                  return (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium">{a.student_first_name} {a.student_last_name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{a.student_email}</td>
                      <td className="px-6 py-3 font-bold" style={{ color: passed ? 'var(--success-fg)' : 'var(--danger-fg)' }}>{a.score}%</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: passed ? 'var(--success-bg)' : 'var(--danger-bg)', color: passed ? 'var(--success-fg)' : 'var(--danger-fg)' }}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete All Attempts"
        description={`Are you sure you want to delete ALL ${totalAttempts} attempts for this quiz? This action cannot be undone. We highly recommend downloading the CSV before proceeding.`}
        confirmLabel="Delete All"
        destructive
        loading={isDeleting}
        onConfirm={handleDeleteAttempts}
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any, label: string, value: string | number, tone: 'brand' | 'success' | 'warning' | 'primary' }) {
  const colors = {
    brand: { bg: 'var(--brand-accent)', fg: 'white' },
    primary: { bg: 'var(--brand-primary)', fg: 'white' },
    success: { bg: 'var(--success-border)', fg: 'white' },
    warning: { bg: 'var(--warning-border)', fg: 'white' },
  }
  const c = colors[tone]
  
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: c.bg, color: c.fg }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}