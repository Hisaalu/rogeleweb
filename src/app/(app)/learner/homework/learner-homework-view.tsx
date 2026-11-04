'use client'

import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  ClipboardList,
  Clock,
  Star,
  FileText,
  Book,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import type { Homework } from '@/types/homework'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function submissionStatus(hw: Homework): 'pending' | 'submitted' | 'graded' {
  if (hw.submission?.status === 'graded') return 'graded'
  if (hw.submission?.status === 'submitted') return 'submitted'
  return 'pending'
}

function statusBorderClass(status: 'pending' | 'submitted' | 'graded', isLate: boolean): string {
  if (status === 'graded') return 'border-l-success-border'
  if (status === 'submitted') return 'border-l-brand-accent'
  if (isLate) return 'border-l-danger-border'
  return 'border-l-warning-border'
}

export function LearnerHomeworkView({ homeworks }: { homeworks: Homework[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const currentStatus = params.get('status') ?? ''

  const total = homeworks.length
  const pending = homeworks.filter((h) => submissionStatus(h) === 'pending').length
  const graded = homeworks.filter((h) => submissionStatus(h) === 'graded').length

  function setStatus(status: string) {
    const sp = new URLSearchParams(params.toString())
    if (status) sp.set('status', status)
    else sp.delete('status')
    router.push(`${pathname}?${sp.toString()}`)
  }

  const filteredHomeworks = homeworks.filter((hw) => {
    if (!currentStatus) return true
    const status = submissionStatus(hw)
    if (currentStatus === 'pending') return status === 'pending'
    if (currentStatus === 'graded') return status === 'graded'
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-primary sm:text-3xl">
          <ClipboardList size={26} className="shrink-0" />
          <span>Homework</span>
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
        <Button
          variant={!currentStatus ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatus('')}
        >
          <ClipboardList size={15} /> All
        </Button>
        <Button
          variant={currentStatus === 'pending' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatus('pending')}
        >
          <Clock size={15} /> Pending
        </Button>
        <Button
          variant={currentStatus === 'graded' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatus('graded')}
        >
          <Star size={15} /> Graded
        </Button>
      </div>

      {filteredHomeworks.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredHomeworks.map((hw) => {
            const status = submissionStatus(hw)
            const dueDate = new Date(hw.due_date)
            const submission = hw.submission
            const isLate = status === 'pending' && dueDate.getTime() < Date.now()

            return (
              <Card
                key={hw.id}
                className={cn(
                  'flex flex-col border-l-4 p-5 transition hover:-translate-y-1 hover:shadow-md',
                  statusBorderClass(status, isLate),
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="flex min-w-0 items-center gap-2 text-lg font-bold text-foreground">
                    <FileText size={18} className="shrink-0 text-brand-accent" />
                    <span className="truncate">{hw.title}</span>
                  </h3>
                  <div className="shrink-0">
                    {status === 'graded' ? (
                      <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success-fg">
                        Graded
                      </span>
                    ) : status === 'submitted' ? (
                      <span className="rounded-full bg-brand-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                        Submitted
                      </span>
                    ) : isLate ? (
                      <span className="rounded-full bg-danger-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-danger-fg">
                        Late
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning-fg">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Book size={13} className="text-brand-accent" />
                    {hw.subject_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-brand-accent" />
                    Due: {dueDate.toLocaleDateString()}{' '}
                    {dueDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {hw.description || 'No description provided.'}
                </p>

                {status === 'graded' && submission?.grade !== undefined && (
                  <div className="mb-4 rounded-md bg-success-bg p-3 text-center">
                    <span className="text-xs font-semibold text-success-fg">
                      Grade:{' '}
                    </span>
                    <span className="text-lg font-bold text-success-fg">
                      {submission.grade}%
                    </span>
                  </div>
                )}

                <Link href={`/learner/homework/${hw.id}`} className="mt-auto w-full">
                  <Button className="w-full">
                    {status === 'graded'
                      ? 'View Feedback'
                      : status === 'submitted'
                        ? 'View Submission'
                        : 'View / Submit Homework'}
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}