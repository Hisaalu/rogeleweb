'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Trash2,
  Download,
} from 'lucide-react'
import type { Quiz, QuizAttempt } from '@/types/quiz'
import { PageHeader } from '@/components/layout/page-header'
import { useToast } from '@/components/ui/toast-provider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

async function deleteAllAttempts(quizId: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/proxy/quizzes/${quizId}/attempts`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

export function ResultsView({ quiz, initialAttempts }: { quiz: Quiz, initialAttempts: QuizAttempt[] }) {
  const { showToast } = useToast()
  const [attempts, setAttempts] = useState<QuizAttempt[]>(initialAttempts)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const uniqueStudents = new Set(attempts.map((a) => a.user_id)).size

  const completed = attempts.filter((a) => a.status === 'completed')
  const passed = completed.filter((a) => (a.score ?? 0) >= (quiz.passing_score ?? 70))
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.score ?? 0), 0) / completed.length,
        )
      : 0
  const avgTime =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.time_taken ?? 0), 0) / completed.length,
        )
      : 0
  const passRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0

  function handleExport() {
    if (completed.length === 0) return

    const headers = ['Student Name', 'Email', 'Score', 'Result', 'Time Taken', 'Completed At']
    const rows = completed.map((a) => {
      const name = [a.student_first_name, a.student_last_name].filter(Boolean).join(' ') || `User #${a.user_id}`
      const isPassed = (a.score ?? 0) >= (quiz.passing_score ?? 70)
      return [
        `"${name}"`,
        a.student_email || 'N/A',
        `${a.score ?? 0}%`,
        isPassed ? 'Passed' : 'Failed',
        formatDuration(a.time_taken),
        a.completed_at ? formatDate(a.completed_at) : 'N/A'
      ]
    })

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${quiz.title.replace(/\s+/g, '_')}_results.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      const ok = await deleteAllAttempts(quiz.id)
      if (ok) {
        setAttempts([])
        showToast('All attempts deleted.', 'success')
      } else {
        showToast('Failed to delete attempts.', 'error')
      }
    } catch {
      showToast('Failed to delete attempts.', 'error')
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }

  const headerActions = (completed.length > 0 || attempts.length > 0) && (
    <div className="flex items-center gap-2">
      {completed.length > 0 && (
        <Button variant="outline" size="sm" onClick={handleExport} aria-label="Export results">
          <Download size={15} />
        </Button>
      )}
      {attempts.length > 0 && (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setShowClearConfirm(true)}
          disabled={clearing}
          aria-label="Clear all attempts"
        >
          <Trash2 size={15} />
        </Button>
      )}
    </div>
  )

  return (
    <>
      <PageHeader
        title={`${quiz.title} — Results`}
        fallbackHref="/teacher/quizzes"
        action={headerActions}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Unique Students"
            value={uniqueStudents}
            tone="brand"
          />
          <StatCard
            icon={CheckCircle2}
            label="Pass Rate"
            value={`${passRate}%`}
            tone="success"
          />
          <StatCard
            icon={Trophy}
            label="Average Score"
            value={`${avgScore}%`}
            tone="warning"
          />
          <StatCard
            icon={Clock}
            label="Avg Time"
            value={formatDuration(avgTime)}
            tone="neutral"
          />
        </div>

        {attempts.length === 0 ? (
          <Card className="border-dashed px-6 py-16 text-center">
            <Users size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
            <h3 className="text-lg font-bold text-foreground">No Attempts Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Student attempts will appear here once they take the quiz.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Score</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Time Taken</th>
                    <th className="px-4 py-3 font-semibold">Completed</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((a) => {
                    const score = a.score ?? 0
                    const passedAttempt = score >= (quiz.passing_score ?? 70)
                    const name =
                      [a.student_first_name, a.student_last_name]
                        .filter(Boolean)
                        .join(' ') || a.student_email || `User #${a.user_id}`
                    return (
                      <tr key={a.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{name}</p>
                          {a.student_email && (
                            <p className="text-xs text-muted-foreground">{a.student_email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{
                              backgroundColor: passedAttempt
                                ? 'var(--success-bg)'
                                : 'var(--danger-bg)',
                              color: passedAttempt
                                ? 'var(--success-fg)'
                                : 'var(--danger-fg)',
                            }}
                          >
                            {passedAttempt ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                            {score}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs capitalize text-muted-foreground">
                            {a.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDuration(a.time_taken)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(a.completed_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/teacher/students/${a.user_id}`}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: 'var(--brand-accent)' }}
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <ConfirmDialog
          open={showClearConfirm}
          onOpenChange={(open) => !open && setShowClearConfirm(false)}
          title="Clear all attempts?"
          description="This will permanently delete every student attempt for this quiz. Students will be able to retake it. This action cannot be undone."
          confirmLabel="Clear All"
          destructive
          loading={clearing}
          onConfirm={handleClearAll}
        />
      </div>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string | number
  hint?: string
  tone: 'brand' | 'success' | 'warning' | 'neutral'
}) {
  const tones = {
    brand: { bg: 'var(--brand-accent)', fg: 'white' },
    success: { bg: 'var(--success-border)', fg: 'white' },
    warning: { bg: 'var(--warning-border)', fg: 'white' },
    neutral: { bg: 'hsl(var(--muted-foreground))', fg: 'white' },
  }
  const t = tones[tone]

  return (
    <Card className="flex min-w-0 items-center gap-3 p-3 transition hover:-translate-y-1 hover:shadow-lg sm:gap-5 sm:p-6">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md sm:h-14 sm:w-14"
        style={{ backgroundColor: t.bg, color: t.fg }}
      >
        <Icon size={18} className="sm:hidden" />
        <Icon size={24} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold tabular-nums text-foreground sm:text-2xl">
          {value}
        </p>
        <p className="truncate text-[11px] text-muted-foreground sm:text-sm">
          {label}
        </p>
        {hint && (
          <p className="truncate text-[10px] font-medium text-brand-accent/80 sm:text-xs">
            {hint}
          </p>
        )}
      </div>
    </Card>
  )
}