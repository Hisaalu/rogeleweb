'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Download, Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import {
  deleteAllQuizAttemptsClient,
  listQuizAttemptsClient,
} from '@/lib/quiz.client'
import { formatDate } from '@/lib/utils'
import type { Quiz, QuizAttempt } from '@/types/quiz'

interface Bucket {
  label: string
  count: number
}

export function QuizAttemptsModal({
  open,
  onOpenChange,
  quiz,
  canDelete,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz | null
  canDelete: boolean
  onDeleted?: () => void
}) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !quiz) return
    setLoading(true)
    setError(null)
    setConfirmDelete(false)
    setDeleteInput('')
    listQuizAttemptsClient(quiz.id)
      .then(setAttempts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load attempts'))
      .finally(() => setLoading(false))
  }, [open, quiz])

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        passRate: 0,
      }
    }

    const completed = attempts.filter((a) => a.status === 'completed')
    const scores = completed.map((a) => a.score ?? 0)
    const avg = scores.length
      ? scores.reduce((s, n) => s + n, 0) / scores.length
      : 0

    const studentIds = new Set(attempts.map((a) => a.user_id).filter(Boolean))
    const passingScore = quiz?.passing_score ?? 50
    const passCount = completed.filter((a) => (a.score ?? 0) >= passingScore).length
    const passRate = completed.length ? (passCount / completed.length) * 100 : 0

    return {
      totalAttempts: attempts.length,
      uniqueStudents: studentIds.size,
      averageScore: avg,
      passRate,
    }
  }, [attempts, quiz?.passing_score])

  const distribution = useMemo<Bucket[]>(() => {
    const buckets: Bucket[] = [
      { label: '0-20', count: 0 },
      { label: '21-40', count: 0 },
      { label: '41-60', count: 0 },
      { label: '61-80', count: 0 },
      { label: '81-100', count: 0 },
    ]
    for (const a of attempts) {
      if (a.status !== 'completed') continue
      const score = a.score ?? 0
      const idx = Math.min(4, Math.floor(score / 20))
      buckets[idx].count++
    }
    return buckets
  }, [attempts])

  function studentName(a: QuizAttempt): string {
    const first = a.student_first_name ?? ''
    const last = a.student_last_name ?? ''
    const full = `${first} ${last}`.trim()
    if (full) return full
    if (a.student_email) return a.student_email
    return `Student #${a.user_id ?? a.id}`
  }

  function handleDownload() {
    if (!quiz) return
    const rows: string[][] = [
      ['#', 'Student', 'Email', 'Registration #', 'Score (%)', 'Result', 'Date'],
    ]

    const passingScore = quiz.passing_score ?? 50
    attempts.forEach((a, idx) => {
      const passed = (a.score ?? 0) >= passingScore
      rows.push([
        String(idx + 1),
        studentName(a),
        a.student_email ?? '',
        a.student_registration_number ?? '',
        a.status === 'completed' ? String(a.score ?? 0) : '',
        a.status === 'completed' ? (passed ? 'Passed' : 'Failed') : a.status,
        a.completed_at ? formatDate(a.completed_at) : formatDate(a.started_at),
      ])
    })

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(','),
      )
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const slug = quiz.title.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.href = url
    link.download = `${slug}_results_${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAll() {
    if (!quiz) return
    setDeleting(true)
    try {
      await deleteAllQuizAttemptsClient(quiz.id)
      setAttempts([])
      setConfirmDelete(false)
      setDeleteInput('')
      onDeleted?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete attempts')
    } finally {
      setDeleting(false)
    }
  }

  const maxBucket = Math.max(1, ...distribution.map((d) => d.count))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle>Quiz results</DialogTitle>
              <DialogDescription>
                {quiz ? quiz.title : ''}
              </DialogDescription>
            </div>
            {attempts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download size={14} />
                  Download CSV
                </Button>
                {canDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    Delete all attempts
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading attempts...
          </div>
        ) : attempts.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No attempts yet"
            description="Learners have not attempted this quiz."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total attempts" value={String(stats.totalAttempts)} />
              <StatCard label="Unique students" value={String(stats.uniqueStudents)} />
              <StatCard label="Average score" value={`${Math.round(stats.averageScore)}%`} />
              <StatCard label="Passing rate" value={`${Math.round(stats.passRate)}%`} />
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-semibold">Score distribution</h4>
              <div className="flex items-end gap-2" style={{ height: 120 }}>
                {distribution.map((b) => (
                  <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex flex-1 w-full items-end">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${(b.count / maxBucket) * 100}%`,
                          minHeight: b.count > 0 ? 4 : 2,
                          backgroundColor:
                            b.count > 0 ? 'var(--brand-primary)' : 'rgb(229 231 235)',
                        }}
                        title={`${b.count} student${b.count === 1 ? '' : 's'}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.label}</span>
                    <span className="text-xs font-medium">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Student
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Score
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Result
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((a, idx) => {
                    const passingScore = quiz?.passing_score ?? 50
                    const passed = (a.score ?? 0) >= passingScore
                    return (
                      <tr key={a.id} className="transition hover:bg-muted/30">
                        <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{studentName(a)}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {a.student_email ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          {a.status === 'completed' ? (
                            <span
                              className={
                                passed ? 'font-semibold text-green-600' : 'font-semibold text-red-600'
                              }
                            >
                              {a.score ?? 0}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {a.status === 'in_progress' && (
                            <Badge tone="warning">In progress</Badge>
                          )}
                          {a.status === 'expired' && <Badge tone="danger">Expired</Badge>}
                          {a.status === 'completed' && (
                            <Badge tone={passed ? 'success' : 'danger'}>
                              {passed ? 'Passed' : 'Failed'}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {a.completed_at
                            ? formatDate(a.completed_at)
                            : formatDate(a.started_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete all attempts</DialogTitle>
            <DialogDescription>
              This will permanently delete all {attempts.length} attempts for this
              quiz. Consider downloading the CSV first. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-sm font-semibold tracking-widest outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/25"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={deleting || deleteInput !== 'DELETE'}
            >
              {deleting ? 'Deleting...' : 'Delete all attempts'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  )
}