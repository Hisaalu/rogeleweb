'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import {
  ClipboardList,
  Clock,
  Star,
  FileText,
  Book,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Homework } from '@/types/homework'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function submissionStatus(hw: Homework): 'pending' | 'submitted' | 'graded' {
  if (hw.submission?.status === 'graded') return 'graded'
  if (hw.submission?.status === 'submitted' || hw.submission?.status === 'late') return 'submitted'
  return 'pending'
}

function statusBorderClass(status: 'pending' | 'submitted' | 'graded', isLate: boolean): string {
  if (status === 'graded') return 'border-l-success-border'
  if (status === 'submitted') return 'border-l-brand-accent'
  if (isLate) return 'border-l-danger-border'
  return 'border-l-warning-border'
}

export function LearnerHomeworkView({ 
  homeworks,
  meta,
  currentPage
}: { 
  homeworks: Homework[]
  meta: { page: number; per_page: number; total: number; last_page: number }
  currentPage: number
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const currentStatus = params.get('status') ?? ''

  const total = meta.total
  const pending = homeworks.filter((h) => submissionStatus(h) === 'pending').length
  const graded = homeworks.filter((h) => submissionStatus(h) === 'graded').length

  function setStatus(status: string) {
    const sp = new URLSearchParams(params.toString())
    if (status) sp.set('status', status)
    else sp.delete('status')
    sp.delete('page')
    return `${pathname}?${sp.toString()}`
  }

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams(params.toString())
    if (targetPage > 1) sp.set('page', String(targetPage))
    else sp.delete('page')
    const qs = sp.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < meta.last_page

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Homework
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and submit your assignments
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary sm:h-12 sm:w-12">
            <ClipboardList size={20} className="sm:hidden" />
            <ClipboardList size={22} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {total}
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Total Assignments
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warning-bg text-warning-fg sm:h-12 sm:w-12">
            <Clock size={20} className="sm:hidden" />
            <Clock size={22} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {pending}
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Pending
            </p>
          </div>
        </Card>

        <Card className="col-span-2 flex items-center gap-3 p-4 sm:gap-4 sm:p-5 lg:col-span-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success-bg text-success-fg sm:h-12 sm:w-12">
            <Star size={20} className="sm:hidden" />
            <Star size={22} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {graded}
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Graded
            </p>
          </div>
        </Card>
      </div>

      <div className="flex w-fit flex-wrap items-center gap-1 rounded-md border border-border bg-card p-1">
        <Link href={setStatus('')}>
          <Button variant={!currentStatus ? 'primary' : 'ghost'} size="sm">
            <ClipboardList size={15} /> All
          </Button>
        </Link>
        <Link href={setStatus('pending')}>
          <Button variant={currentStatus === 'pending' ? 'primary' : 'ghost'} size="sm">
            <Clock size={15} /> Pending
          </Button>
        </Link>
        <Link href={setStatus('graded')}>
          <Button variant={currentStatus === 'graded' ? 'primary' : 'ghost'} size="sm">
            <Star size={15} /> Graded
          </Button>
        </Link>
      </div>

      {homeworks.length === 0 ? (
        <Card className="border-dashed px-6 py-16 text-center">
          <ClipboardList
            size={40}
            className="mx-auto mb-4 text-brand-accent opacity-30"
          />
          <h3 className="text-xl font-bold text-foreground">
            No Homework Assigned
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have any homework at the moment. Check back later!
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {homeworks.map((hw) => {
              const status = submissionStatus(hw)
              const dueDate = new Date(hw.due_date)
              const submission = hw.submission
              const isLate = status === 'pending' && dueDate.getTime() < Date.now()
              const isGraded = status === 'graded'

              return (
                <Card
                  key={hw.id}
                  className={cn(
                    'relative flex flex-col border-l-4 p-4 sm:p-5 transition hover:-translate-y-1 hover:shadow-md',
                    statusBorderClass(status, isLate),
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="flex min-w-0 flex-1 items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                      <FileText size={16} className="shrink-0 text-brand-accent sm:size-[18px]" />
                      <span className="truncate">{hw.title}</span>
                    </h3>
                    <div className="shrink-0">
                      {isGraded ? (
                        <span className="flex items-center gap-1 rounded-full bg-success-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                          <CheckCircle2 size={12} />
                          Graded
                        </span>
                      ) : status === 'submitted' ? (
                        <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-accent sm:px-2.5 sm:py-1 sm:text-[10px]">
                          Submitted
                        </span>
                      ) : isLate ? (
                        <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-danger-fg sm:px-2.5 sm:py-1 sm:text-[10px]">
                          Late
                        </span>
                      ) : (
                        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning-fg sm:px-2.5 sm:py-1 sm:text-[10px]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Book size={12} className="shrink-0 text-brand-accent sm:size-[13px]" />
                      <span className="truncate">{hw.subject_name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="shrink-0 text-brand-accent sm:size-[13px]" />
                      <span>
                        Due: {dueDate.toLocaleDateString()}{' '}
                        {dueDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 text-[13px] text-muted-foreground sm:text-sm">
                    {hw.description || 'No description provided.'}
                  </p>

                  {isGraded && submission?.grade !== undefined && (
                    <div className="mb-4 flex items-center justify-between rounded-md border border-success-border/30 bg-success-bg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-success-fg" />
                        <span className="text-sm font-bold text-success-fg">
                          {submission.grade}%
                        </span>
                      </div>
                      <span className="text-xs font-medium text-success-fg/80">
                        Final Score
                      </span>
                    </div>
                  )}

                  <Link href={`/learner/homework/${hw.id}`} className="mt-auto w-full">
                    <Button className="w-full h-9 text-xs sm:h-10 sm:text-sm">
                      <span className="truncate">
                        {isGraded
                          ? 'View Feedback'
                          : status === 'submitted'
                            ? 'View Submission'
                            : 'Submit Homework'}
                      </span>
                      <ArrowRight size={14} className="ml-1 shrink-0 hidden sm:block" />
                    </Button>
                  </Link>
                </Card>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={!hasPrev}
                className={
                  !hasPrev
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                <ChevronLeft size={14} /> Previous
              </Link>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {meta.last_page}
              </span>
              <Link
                href={pageHref(Math.min(meta.last_page, currentPage + 1))}
                aria-disabled={!hasNext}
                className={
                  !hasNext
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                Next <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}