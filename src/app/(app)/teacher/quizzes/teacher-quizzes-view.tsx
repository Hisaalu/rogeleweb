'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, PlusCircle, HelpCircle, Clock, Users, Trophy, CalendarX, CalendarCheck, Edit, Eye, BarChart2, Trash2 } from 'lucide-react'
import type { Quiz } from '@/types/quiz'
import type { Class } from '@/types/admin'
import { deleteQuizClient } from '@/lib/quizzes.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'

export function TeacherQuizzesView({ quizzes: initial, classes }: { quizzes: Quiz[], classes: Class[] }) {
  const [quizzes, setQuizzes] = useState(initial)
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { showToast } = useToast()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [classId, setClassId] = useState(params.get('class_id') ?? '')

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { setQuizzes(initial) }, [initial])

  function push(next: { q?: string, class_id?: string }) {
    const sp = new URLSearchParams(params.toString())
    const nq = next.q !== undefined ? next.q : q
    const nc = next.class_id !== undefined ? next.class_id : classId
    if (nq) sp.set('q', nq); else sp.delete('q')
    if (nc) sp.set('class_id', nc); else sp.delete('class_id')
    router.push(`${pathname}?${sp.toString()}`)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteQuizClient(deleteTarget)
      setQuizzes(prev => prev.filter(q => q.id !== deleteTarget))
      showToast('Quiz deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete quiz'
      showToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <HelpCircle size={26} className="shrink-0" />
            <span className="truncate">Quizzes</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and Manage Quizzes</p>
        </div>
        <Link href="/teacher/quizzes/create" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <PlusCircle size={16} /> Create Quiz
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <form onSubmit={(e) => { e.preventDefault(); push({}) }} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quizzes by title..." className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30" />
          </div>
          <select value={classId} onChange={(e) => { setClassId(e.target.value); push({ class_id: e.target.value }) }} className="min-w-[180px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>Search</button>
          {(q || classId) && (
            <button type="button" onClick={() => { setQ(''); setClassId(''); push({ q: '', class_id: '' }) }} className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-accent)' }}>Clear</button>
          )}
        </form>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <HelpCircle size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Quizzes Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">No quizzes matching your criteria.</p>
          <Link href="/teacher/quizzes/create" className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <PlusCircle size={16} /> Create New Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map(quiz => {
            const endDate = quiz.end_date
            const isExpired = !!endDate && new Date(endDate).getTime() < new Date().getTime()
            
            return (
              <div key={quiz.id} className="relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div 
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: quiz.is_published && !isExpired ? 'var(--success-border)' : 'var(--brand-accent)' }}
                  >
                    {quiz.is_published && !isExpired ? 'Published' : 'Draft'}
                  </div>
                </div>
                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-foreground">{quiz.title}</h3>
                
                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.class_name ?? 'All Classes'}</span>
                  <span className="flex items-center gap-1"><HelpCircle size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.subject_name ?? 'General'}</span>
                  <span className="flex items-center gap-1"><Clock size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.time_limit ?? 30} min</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{quiz.description ?? 'No description provided.'}</p>

                <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><HelpCircle size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.question_count ?? 0} questions</span>
                  <span className="flex items-center gap-1"><Users size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.attempt_count ?? 0} attempts</span>
                  <span className="flex items-center gap-1"><Trophy size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.passing_score ?? 50}% pass</span>
                  {endDate ? (
                    <span className="flex items-center gap-1 font-medium" style={{ color: isExpired ? 'var(--danger-fg)' : 'var(--success-fg)' }}>
                      {isExpired ? <CalendarX size={13} /> : <CalendarCheck size={13} />} {new Date(endDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1"><CalendarX size={13} /> No Deadline</span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <Link href={`/teacher/quizzes/${quiz.id}/questions`} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }} title="Questions">
                      <PlusCircle size={16} />
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/edit`} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }} title="Edit">
                      <Edit size={16} />
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/results`} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }} title="Results">
                      <BarChart2 size={16} />
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/preview`} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'var(--brand-accent)', color: 'white' }} title="Preview">
                      <Eye size={16} />
                    </Link>
                    <button onClick={() => setDeleteTarget(quiz.id)} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? All associated questions and results will be permanently lost. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
      
    </div>
  )
}