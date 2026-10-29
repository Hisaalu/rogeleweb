'use client'

import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { 
  ClipboardList, Clock, Star, FileText, Book, Calendar, ArrowRight
} from 'lucide-react'
import type { Homework } from '@/types/homework'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
          <span style={{ color: 'var(--brand-primary)' }}>Homework</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">View and submit your assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              color: 'var(--brand-primary)',
            }}
          >
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs font-medium text-muted-foreground">Total Assignments</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md"
            style={{
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning-fg)',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md"
            style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-fg)',
            }}
          >
            <Star size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{graded}</p>
            <p className="text-xs font-medium text-muted-foreground">Graded</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
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
          <ClipboardList size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Homework Assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">You don&apos;t have any homework at the moment. Check back later!</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHomeworks.map(hw => {
            const dueDate = new Date(hw.due_date).getTime()
            const isExpired = dueDate < now
            const submission = hw.submission
            const status = submission?.status ?? 'pending'
            const isLate = !submission && isExpired

            let borderColor = 'var(--warning-border)'
            if (status === 'graded') borderColor = 'var(--success-border)'
            else if (status === 'submitted') borderColor = 'var(--brand-accent)'
            else if (isLate) borderColor = 'var(--danger-border)'

            return (
              <Card
                key={hw.id}
                className="flex flex-col border-l-4 p-5 transition hover:-translate-y-1 hover:shadow-md"
                style={{ borderLeftColor: borderColor }}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <FileText size={18} style={{ color: 'var(--brand-accent)' }} /> {hw.title}
                  </h3>
                  <div>
                    {status === 'graded' ? (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>Graded</span>
                    ) : status === 'submitted' ? (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>Submitted</span>
                    ) : isLate ? (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>Late</span>
                    ) : (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>Pending</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Book size={13} style={{ color: 'var(--brand-accent)' }} /> {hw.subject_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} style={{ color: 'var(--brand-accent)' }} /> Due: {new Date(hw.due_date).toLocaleDateString()} {new Date(hw.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{hw.description || 'No description provided.'}</p>

                {status === 'graded' && submission?.grade !== undefined && (
                  <div className="mb-4 rounded-md p-3 text-center" style={{ backgroundColor: 'var(--success-bg)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--success-fg)' }}>Grade: </span>
                    <span className="text-lg font-bold" style={{ color: 'var(--success-fg)' }}>{submission.grade}%</span>
                  </div>
                )}

                <Link href={`/learner/homework/${hw.id}`} className="mt-auto w-full">
                  <Button className="w-full">
                    {status === 'graded' ? 'View Feedback' : status === 'submitted' ? 'View Submission' : 'View / Submit Homework'}
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