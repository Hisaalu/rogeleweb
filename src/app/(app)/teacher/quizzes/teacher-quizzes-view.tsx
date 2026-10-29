'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, PlusCircle, HelpCircle, Clock, Users, Trophy, CalendarX, CalendarCheck, Edit, Eye, BarChart2, Trash2, Loader2 } from 'lucide-react'
import type { Quiz, QuizListMeta } from '@/types/quiz'
import type { Class } from '@/types/admin'
import { deleteQuizClient } from '@/lib/quizzes.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function TeacherQuizzesView({ 
  quizzes, 
  meta,
  classes 
}: { 
  quizzes: Quiz[]
  meta: QuizListMeta
  classes: Class[] 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [classId, setClassId] = useState(params.get('class_id') ?? '')

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function push(next: { q?: string; class_id?: string }) {
    const sp = new URLSearchParams(params.toString())
    const nq = next.q !== undefined ? next.q : q
    const nc = next.class_id !== undefined ? next.class_id : classId
    if (nq) sp.set('q', nq)
    else sp.delete('q')
    if (nc) sp.set('class_id', nc)
    else sp.delete('class_id')
    
    sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteQuizClient(deleteTarget)
      showToast('Quiz deleted successfully', 'success')
      setDeleteTarget(null)
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete quiz'
      showToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.max(1, meta.last_page)

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <HelpCircle size={26} className="shrink-0" />
            <span className="truncate">Quizzes</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and Manage Quizzes</p>
        </div>
        <Link href="/teacher/quizzes/create" className="shrink-0">
          <Button>
            <PlusCircle size={16} className="mr-2" /> Create Quiz
          </Button>
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <form onSubmit={(e) => { e.preventDefault(); push({}) }} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full flex-1 sm:min-w-[240px]">
            <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quizzes by title..." className="pl-8" />
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={classId} onChange={(e) => { setClassId(e.target.value); push({ class_id: e.target.value }) }} className="w-full sm:w-[180px]">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
            {(q || classId) && (
              <Button type="button" variant="secondary" onClick={() => { setQ(''); setClassId(''); push({ q: '', class_id: '' }) }} className="w-full sm:w-auto">Clear</Button>
            )}
          </div>
        </form>
      </Card>

      {quizzes.length === 0 ? (
        <Card className="border-dashed px-6 py-16 text-center">
          <HelpCircle size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Quizzes Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">No quizzes matching your criteria.</p>
          <Link href="/teacher/quizzes/create" className="mt-6 inline-block">
            <Button><PlusCircle size={16} className="mr-2" /> Create New Quiz</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map(quiz => {
            const endDate = quiz.end_date
            const isExpired = !!endDate && new Date(endDate).getTime() < new Date().getTime()
            
            return (
              <Card key={quiz.id} className="relative flex flex-col p-4 sm:p-5 transition hover:-translate-y-1 hover:border-brand-primary hover:shadow-md">
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

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-start">
                    <Link href={`/teacher/quizzes/${quiz.id}/questions`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="icon" title="Questions">
                        <PlusCircle size={16} />
                      </Button>
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/edit`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="icon" title="Edit">
                        <Edit size={16} />
                      </Button>
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/results`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="icon" title="Results">
                        <BarChart2 size={16} />
                      </Button>
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/preview`} className="flex-1 sm:flex-none">
                      <Button variant="secondary" size="icon" title="Preview">
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Button variant="danger" size="icon" onClick={() => setDeleteTarget(quiz.id)} className="flex-1 sm:flex-none" title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {meta.page > 1 && (
            <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(meta.page - 1) }).toString()}`}>
              <Button variant="outline">Prev</Button>
            </Link>
          )}
          <span className="px-4 text-sm font-medium text-muted-foreground">Page {meta.page} of {totalPages}</span>
          {meta.page < totalPages && (
            <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(meta.page + 1) }).toString()}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
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