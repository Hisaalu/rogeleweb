'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Download, Users, CheckCircle2, AlertTriangle, Star,
  Edit2, Save, Eye, EyeOff, Loader2, Search, X, type LucideIcon,
} from 'lucide-react'
import type { Homework, HomeworkSubmission } from '@/types/homework'
import { gradeSubmissionClient } from '@/lib/homework.client'
import { materialDownloadUrl, formatFileSize } from '@/lib/materials'
import { PageHeader } from '@/components/layout/page-header'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useRouter as useTopLoaderRouter } from 'nextjs-toploader/app'

function getInitials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

export function SubmissionsView({
  homework,
  submissions: initial,
  initialQuery,
}: {
  homework: Homework
  submissions: HomeworkSubmission[]
  initialQuery: string
}) {
  const { showToast } = useToast()
  const router = useRouter()
  const topLoaderRouter = useTopLoaderRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [submissions, setSubmissions] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({})
  const [busyId, setBusyId] = useState<number | null>(null)

  const [isActive, setIsActive] = useState(homework.is_active)
  const [toggling, setToggling] = useState(false)

  const [query, setQuery] = useState(initialQuery)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter((s) => {
      const first = (s.student_first_name ?? '').toLowerCase()
      const last = (s.student_last_name ?? '').toLowerCase()
      const email = (s.student_email ?? '').toLowerCase()
      const full = `${first} ${last}`.trim()
      return (
        full.includes(q) ||
        first.includes(q) ||
        last.includes(q) ||
        email.includes(q)
      )
    })
  }, [submissions, query])

  const total = filtered.length
  const gradedCount = filtered.filter((s) => s.status === 'graded').length
  const lateCount = filtered.filter((s) => s.status === 'late').length
  const avgGrade =
    gradedCount > 0
      ? Math.round(
          filtered.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount,
        )
      : 0

  async function handleGrade(id: number) {
    const gradeVal = grades[id]
    const feedbackVal = feedbacks[id] || ''
    if (!gradeVal) return showToast('Please enter a grade', 'error')

    const num = Number(gradeVal)
    if (isNaN(num) || num < 0 || num > 100)
      return showToast('Grade must be 0-100', 'error')

    setBusyId(id)
    try {
      await gradeSubmissionClient(id, num, feedbackVal)
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, grade: num, feedback: feedbackVal, status: 'graded' }
            : s,
        ),
      )
      setEditingId(null)
      showToast('Grade saved successfully!', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save grade'
      showToast(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleVisibility() {
    setToggling(true)
    try {
      const { updateHomeworkClient } = await import('@/lib/homework.client')
      await updateHomeworkClient(homework.id, { is_active: !isActive })
      setIsActive(!isActive)
      showToast(
        isActive
          ? 'Homework hidden from learners'
          : 'Homework is now visible to learners',
        'success',
      )
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to toggle visibility'
      showToast(message, 'error')
    } finally {
      setToggling(false)
    }
  }

  function submitSearch(value: string) {
    setQuery(value)
    const sp = new URLSearchParams(searchParams.toString())
    if (value.trim()) sp.set('q', value.trim())
    else sp.delete('q')
    const qs = sp.toString()
    startTransition(() => {
      topLoaderRouter.replace(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  function clearSearch() {
    setQuery('')
    const sp = new URLSearchParams(searchParams.toString())
    sp.delete('q')
    const qs = sp.toString()
    startTransition(() => {
      topLoaderRouter.replace(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  function downloadCSV() {
    if (filtered.length === 0) return

    const headers = [
      'Student',
      'Email',
      'Status',
      'Grade (%)',
      'Submitted At',
      'Feedback',
    ]
    const rows = filtered.map((s) => {
      const studentName =
        `${s.student_first_name || ''} ${s.student_last_name || ''}`.trim() ||
        'Student'
      return [
        `"${studentName}"`,
        `"${s.student_email || ''}"`,
        `"${s.status}"`,
        `"${s.grade ?? 'N/A'}"`,
        `"${s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''}"`,
        `"${(s.feedback || '').replace(/"/g, '""')}"`,
      ]
    })

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${homework.title.replace(/[^a-z0-9]/gi, '_')}${
      query ? `_${query.replace(/[^a-z0-9]/gi, '_')}` : ''
    }_grades.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive ? 'outline' : 'danger'}
        size="sm"
        onClick={handleToggleVisibility}
        disabled={toggling}
        className="whitespace-nowrap"
      >
        {toggling ? (
          <Loader2 size={15} className="mr-1.5 animate-spin" />
        ) : isActive ? (
          <EyeOff size={15} className="mr-1.5" />
        ) : (
          <Eye size={15} className="mr-1.5" />
        )}
        {isActive ? 'Hide' : 'Show'}
      </Button>

      <Button
        onClick={downloadCSV}
        variant="secondary"
        size="sm"
        className="whitespace-nowrap"
        disabled={filtered.length === 0}
      >
        <Download size={15} className="mr-1.5" /> Export
      </Button>
    </div>
  )

  return (
    <>
      <PageHeader
        title={`Submissions — ${homework.title}`}
        fallbackHref="/teacher/homework"
        action={headerActions}
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <Card className="p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitSearch(query)
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative w-full flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student name or email..."
                className="pl-8 pr-8"
                aria-label="Search submissions"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
                {isPending ? 'Searching...' : 'Search'}
              </Button>
              {initialQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="flex-1 sm:flex-none"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Submissions" value={total} tone="brand" />
          <StatCard icon={CheckCircle2} label="Graded" value={gradedCount} tone="success" />
          <StatCard icon={AlertTriangle} label="Late" value={lateCount} tone="warning" />
          <StatCard icon={Star} label="Average Grade" value={`${avgGrade}%`} tone="primary" />
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed px-6 py-16 text-center">
            <Users size={40} className="mx-auto mb-4 text-brand-accent opacity-30" />
            {query ? (
              <>
                <h3 className="text-xl font-bold text-foreground">
                  No matches for &ldquo;{query}&rdquo;
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different name or email, or{' '}
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="font-medium text-brand-accent underline-offset-2 hover:underline"
                  >
                    clear the search
                  </button>
                  .
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-foreground">
                  No Submissions Yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Students haven&apos;t submitted this homework yet.
                </p>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((sub) => {
              const isEditing = editingId === sub.id
              const passed = (sub.grade ?? 0) >= 50

              return (
                <Card key={sub.id} className="p-5 transition hover:border-brand-accent">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={40}
                        src={sub.student_profile_photo}
                        fallback={getInitials(
                          sub.student_first_name,
                          sub.student_last_name,
                        )}
                      />
                      <div>
                        <h3 className="font-bold text-foreground">
                          {sub.student_first_name || 'Student'}{' '}
                          {sub.student_last_name || ''}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {sub.student_email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                        style={{
                          backgroundColor:
                            sub.status === 'graded'
                              ? 'var(--success-bg)'
                              : sub.status === 'late'
                                ? 'var(--warning-bg)'
                                : 'var(--brand-primary)',
                          color:
                            sub.status === 'graded'
                              ? 'var(--success-fg)'
                              : sub.status === 'late'
                                ? 'var(--warning-fg)'
                                : 'white',
                        }}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        Submitted At
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {sub.submitted_at
                          ? new Date(sub.submitted_at).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {sub.text_answer && (
                    <div className="mt-4">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        Answer
                      </p>
                      <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm text-foreground">
                        {sub.text_answer}
                      </div>
                    </div>
                  )}

                  {sub.files && sub.files.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">
                        Attachments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sub.files.map((f) => (
                          <a
                            key={f.id}
                            href={materialDownloadUrl(f.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:border-brand-accent hover:bg-muted"
                          >
                            <Download size={14} className="text-brand-accent" />
                            <span className="max-w-[150px] truncate font-medium text-foreground">
                              {f.file_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(f.file_size)})
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 rounded-md border border-border bg-muted/30 p-4">
                    {!isEditing && sub.status === 'graded' ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                              Final Grade:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                passed ? 'text-success-fg' : 'text-danger-fg'
                              }`}
                            >
                              {sub.grade}%
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(sub.id)
                              setGrades({
                                ...grades,
                                [sub.id]: String(sub.grade ?? ''),
                              })
                              setFeedbacks({
                                ...feedbacks,
                                [sub.id]: sub.feedback || '',
                              })
                            }}
                          >
                            <Edit2 size={12} className="mr-2" /> Edit Grade
                          </Button>
                        </div>
                        {sub.feedback && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-semibold text-muted-foreground">
                              Feedback
                            </p>
                            <p className="text-sm text-foreground">
                              {sub.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-foreground">
                            Grade (%)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={grades[sub.id] || ''}
                            onChange={(e) =>
                              setGrades({ ...grades, [sub.id]: e.target.value })
                            }
                            className="w-32 bg-background"
                            placeholder="0-100"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-foreground">
                            Feedback (Optional)
                          </label>
                          <textarea
                            value={feedbacks[sub.id] || ''}
                            onChange={(e) =>
                              setFeedbacks({
                                ...feedbacks,
                                [sub.id]: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25"
                            placeholder="Provide feedback to the student..."
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            onClick={() => handleGrade(sub.id)}
                            disabled={busyId === sub.id}
                            size="sm"
                          >
                            <Save size={14} className="mr-2" />{' '}
                            {busyId === sub.id ? 'Saving...' : 'Save Grade'}
                          </Button>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                              disabled={busyId === sub.id}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tone: 'brand' | 'success' | 'warning' | 'primary'
}) {
  const colors = {
    brand: { bg: 'bg-brand-accent', fg: 'text-white' },
    primary: { bg: 'bg-brand-primary', fg: 'text-white' },
    success: { bg: 'bg-success-border', fg: 'text-white' },
    warning: { bg: 'bg-amber-500', fg: 'text-white' },
  }
  const c = colors[tone]

  return (
    <Card className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md sm:h-10 sm:w-10 ${c.bg} ${c.fg}`}
      >
        <Icon size={16} className="sm:hidden" />
        <Icon size={18} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {value}
        </p>
        <p className="truncate text-[10px] tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </Card>
  )
}