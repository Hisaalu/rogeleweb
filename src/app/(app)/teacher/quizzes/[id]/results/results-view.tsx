'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Loader2,
  AlertTriangle,
  Trash2,
  BarChart2,
} from 'lucide-react'
import type { Quiz, QuizAttempt } from '@/types/quiz'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
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

async function fetchAttempts(quizId: number): Promise<QuizAttempt[]> {
  try {
    const res = await fetch(`/api/proxy/quizzes/${quizId}/attempts`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data as QuizAttempt[]
    if (Array.isArray(data?.data)) return data.data as QuizAttempt[]
    if (Array.isArray(data?.value)) return data.value as QuizAttempt[]
    return []
  } catch {
    return []
  }
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

export function ResultsView({ quiz }: { quiz: Quiz }) {
  const { showToast } = useToast()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchAttempts(quiz.id).then((list) => {
      if (mounted) {
        setAttempts(list)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [quiz.id])

  const total = attempts.length
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/teacher/quizzes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Quizzes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            {quiz.title} — Results
          </h1>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? 'No attempts yet'
              : `${total} attempt${total === 1 ? '' : 's'} · ${passRate}% pass rate`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/teacher/quizzes/${quiz.id}/preview`}>
            <Button variant="outline">
              <BarChart2 size={15} className="mr-2" /> Preview Quiz
            </Button>
          </Link>
          {attempts.length > 0 && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowClearConfirm(true)}
              disabled={clearing}
            >
              <Trash2 size={15} className="mr-2" /> Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Attempts"
          value={total}
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

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin" size={28} style={{ color: 'var(--brand-accent)' }} />
        </div>
      ) : attempts.length === 0 ? (
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
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
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
                          href={`/learner/quizzes/results/${a.id}`}
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

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <Card
            className="w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--danger-bg)' }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--danger-fg)' }} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Clear all attempts?</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              This will permanently delete every student attempt for this quiz.
              Students will be able to retake it. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleClearAll}
                disabled={clearing}
              >
                {clearing ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={14} className="mr-2" />
                )}
                {clearing ? 'Clearing...' : 'Clear All'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string | number
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
    <Card className="flex items-center gap-4 p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: t.bg, color: t.fg }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </Card>
  )
}