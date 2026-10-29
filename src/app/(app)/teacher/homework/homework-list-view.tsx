'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { 
  PlusCircle, Search, FileText, Calendar, GraduationCap, Book, 
  List, Clock, CalendarX, Eye, Edit, Trash2, Users, Loader2
} from 'lucide-react'
import type { Homework, HomeworkListMeta } from '@/types/homework'
import type { Class } from '@/types/admin'
import { deleteHomeworkClient } from '@/lib/homework.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'

export function HomeworkListView({ 
  homeworks, 
  meta,
  classes 
}: { 
  homeworks: Homework[]
  meta: HomeworkListMeta
  classes: Class[] 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [classId, setClassId] = useState(params.get('class_id') ?? '')
  const status = params.get('status') ?? ''

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredHomeworks = useMemo(() => {
    const now = new Date().getTime()
    return homeworks.filter(hw => {
      const isExpired = new Date(hw.due_date).getTime() < now
      if (status === 'active' && isExpired) return false
      if (status === 'expired' && !isExpired) return false
      return true
    })
  }, [homeworks, status])

  function push(next: { q?: string, class_id?: string, status?: string }) {
    const sp = new URLSearchParams(params.toString())
    const nq = next.q !== undefined ? next.q : q
    const nc = next.class_id !== undefined ? next.class_id : classId
    const ns = next.status !== undefined ? next.status : status

    if (nq) sp.set('q', nq); else sp.delete('q')
    if (nc) sp.set('class_id', nc); else sp.delete('class_id')
    if (ns) sp.set('status', ns); else sp.delete('status')
    
    sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteHomeworkClient(deleteTarget)
      showToast('Homework deleted successfully', 'success')
      setDeleteTarget(null)
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete homework'
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
            <FileText size={26} className="shrink-0" />
            <span className="truncate">Homework</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and Manage Homework</p>
        </div>
        <Link href="/teacher/homework/create" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <PlusCircle size={16} /> Create Homework
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={(e) => { e.preventDefault(); push({}) }} className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full flex-1 sm:min-w-[240px]">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description..." className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent" />
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={classId} onChange={(e) => { setClassId(e.target.value); push({ class_id: e.target.value }) }} className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none sm:w-[180px]">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto" style={{ backgroundColor: 'var(--brand-primary)' }}>Search</button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-background p-1 sm:justify-start">
          <button onClick={() => push({ status: '' })} className={`flex h-8 w-8 items-center justify-center rounded-full transition ${!status ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`} style={!status ? { backgroundColor: 'var(--brand-primary)' } : undefined} title="All"><List size={15} /></button>
          <button onClick={() => push({ status: 'active' })} className={`flex h-8 w-8 items-center justify-center rounded-full transition ${status === 'active' ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`} style={status === 'active' ? { backgroundColor: 'var(--brand-primary)' } : undefined} title="Active"><Clock size={15} /></button>
          <button onClick={() => push({ status: 'expired' })} className={`flex h-8 w-8 items-center justify-center rounded-full transition ${status === 'expired' ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`} style={status === 'expired' ? { backgroundColor: 'var(--brand-primary)' } : undefined} title="Expired"><CalendarX size={15} /></button>
        </div>
      </div>

      {filteredHomeworks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <FileText size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Homework Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try refining your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHomeworks.map(hw => {
            const isExpired = new Date(hw.due_date).getTime() < new Date().getTime()
            return (
              <div key={hw.id} className={`relative flex flex-col rounded-2xl border border-border p-4 sm:p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${isExpired ? 'bg-muted/30 opacity-80' : 'bg-card'}`}>
                
                {/* Responsive Header: Stacks on very small screens, row on larger */}
                <div className="mb-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between">
                  <h3 className="flex items-start gap-2 line-clamp-2 text-base sm:text-lg font-bold text-foreground">
                    <FileText size={18} style={{ color: 'var(--brand-accent)' }} className="shrink-0 mt-0.5" /> 
                    <span>{hw.title}</span>
                  </h3>
                  <span className="w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: isExpired ? 'var(--danger-bg)' : 'var(--success-bg)', color: isExpired ? 'var(--danger-fg)' : 'var(--success-fg)' }}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap size={13} style={{ color: 'var(--brand-accent)' }} /> {hw.class_name ?? 'All'}</span>
                  <span className="flex items-center gap-1"><Book size={13} style={{ color: 'var(--brand-accent)' }} /> {hw.subject_name ?? 'General'}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} style={{ color: 'var(--brand-accent)' }} /> Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{hw.description ?? 'No description provided.'}</p>

                <div className="mb-4 flex items-center gap-4 border-t border-border pt-4 text-sm mt-auto">
                  <div className="text-center">
                    <span className="block text-lg font-bold text-foreground">{hw.submissions_count ?? 0}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Submissions</span>
                  </div>
                </div>

                {/* Responsive Actions: Wraps cleanly on small screens */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/teacher/homework/${hw.id}/submissions`} className="flex h-9 flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-accent)' }}>
                    <Users size={15} /> Submissions
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/teacher/homework/${hw.id}/preview`} className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }} title="Preview"><Eye size={16} /></Link>
                    <Link href={`/teacher/homework/${hw.id}/edit`} className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }} title="Edit"><Edit size={16} /></Link>
                    <button onClick={() => setDeleteTarget(hw.id)} className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {meta.page > 1 && (
            <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(meta.page - 1) }).toString()}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent hover:text-brand-primary">Prev</Link>
          )}
          <span className="text-sm font-medium text-muted-foreground px-4">Page {meta.page} of {totalPages}</span>
          {meta.page < totalPages && (
            <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(meta.page + 1) }).toString()}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-brand-accent hover:text-brand-primary">Next</Link>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Homework"
        description="Are you sure you want to delete this homework? All associated submissions and grades will be permanently lost."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}