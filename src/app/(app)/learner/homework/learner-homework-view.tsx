'use client'

import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { 
  ClipboardList, Clock, Star, FileText, Book, Calendar, ArrowRight, CheckCircle2, AlertTriangle
} from 'lucide-react'
import type { Homework } from '@/types/homework'

export function LearnerHomeworkView({ homeworks }: { homeworks: Homework[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const currentStatus = params.get('status') ?? ''

  const now = new Date().getTime()

  const total = homeworks.length
  const pending = homeworks.filter(h => {
    const isLate = new Date(h.due_date).getTime() < now
    return !h.submission && !isLate
  }).length
  const graded = homeworks.filter(h => h.submission?.status === 'graded').length

  function setStatus(status: string) {
    const sp = new URLSearchParams(params.toString())
    if (status) sp.set('status', status)
    else sp.delete('status')
    router.push(`${pathname}?${sp.toString()}`)
  }

  const filteredHomeworks = homeworks.filter(hw => {
    if (!currentStatus) return true
    const isLate = !hw.submission && new Date(hw.due_date).getTime() < now
    
    if (currentStatus === 'pending') {
      return !hw.submission?.status || (hw.submission?.status !== 'graded' && hw.submission?.status !== 'submitted')
    }
    if (currentStatus === 'graded') {
      return hw.submission?.status === 'graded'
    }
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <ClipboardList size={26} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>My Homework</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">View and submit your assignments</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs font-medium text-muted-foreground">Total Assignments</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <Star size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{graded}</p>
            <p className="text-xs font-medium text-muted-foreground">Graded</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-card p-1 w-fit">
        <button
          onClick={() => setStatus('')}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${!currentStatus ? 'bg-brand-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <ClipboardList size={15} /> All
        </button>
        <button
          onClick={() => setStatus('pending')}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${currentStatus === 'pending' ? 'bg-brand-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <Clock size={15} /> Pending
        </button>
        <button
          onClick={() => setStatus('graded')}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${currentStatus === 'graded' ? 'bg-brand-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <Star size={15} /> Graded
        </button>
      </div>

      {filteredHomeworks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <ClipboardList size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Homework Assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">You don't have any homework at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHomeworks.map(hw => {
            const dueDate = new Date(hw.due_date).getTime()
            const isExpired = dueDate < now
            const submission = hw.submission
            const status = submission?.status ?? 'pending'
            const isLate = !submission && isExpired

            let borderClass = 'border-l-4 border-l-orange-400'
            if (status === 'graded') borderClass = 'border-l-4 border-l-emerald-500'
            else if (status === 'submitted') borderClass = 'border-l-4 border-l-blue-500'
            else if (isLate) borderClass = 'border-l-4 border-l-red-500'

            return (
              <div key={hw.id} className={`flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${borderClass}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <FileText size={18} style={{ color: 'var(--brand-accent)' }} /> {hw.title}
                  </h3>
                  <div>
                    {status === 'graded' ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Graded</span>
                    ) : status === 'submitted' ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Submitted</span>
                    ) : isLate ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-900/30 dark:text-red-400">Late</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Book size={13} style={{ color: 'var(--brand-accent)' }} /> {hw.subject_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} style={{ color: 'var(--brand-accent)' }} /> Due: {new Date(hw.due_date).toLocaleDateString()} {new Date(hw.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{hw.description || 'No description provided.'}</p>

                {status === 'graded' && submission?.grade !== undefined && (
                  <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Grade: </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{submission.grade}%</span>
                  </div>
                )}

                <Link href={`/learner/homework/${hw.id}`} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {status === 'graded' ? 'View Feedback' : status === 'submitted' ? 'View Submission' : 'View / Submit Homework'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}