'use client'

import { useCallback, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, PlusCircle, Loader2 } from 'lucide-react'
import type { Class, Subject } from '@/types/admin'
import type { Lesson, LessonListMeta } from '@/types/lesson'
import { deleteLesson, publishLesson } from '@/lib/lessons.mutations'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'
import { TeacherHeader } from './components/teacher-header'
import { TeacherFilters } from './components/teacher-filters'
import { TeacherLessonCard } from './components/teacher-lesson-card'
import { Pagination } from './components/pagination'

export function TeacherLessonsView({
  lessons = [],
  meta = { page: 1, per_page: 12, total: 0, last_page: 1 },
  classes,
  subjects,
}: {
  lessons?: Lesson[]
  meta?: LessonListMeta
  classes: Class[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteTarget(id)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteLesson(deleteTarget)
      showToast('Lesson deleted successfully', 'success')
      setDeleteTarget(null)
      
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete lesson'
      showToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, showToast, router])

  const handlePublishToggle = useCallback(
    async (id: number, published: boolean) => {
      try {
        await publishLesson(id, published)
        showToast(
          published ? 'Lesson published successfully' : 'Lesson moved to drafts',
          'success',
        )
        
        startTransition(() => {
          router.refresh()
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not update lesson status'
        showToast(message, 'error')
      }
    },
    [showToast, router],
  )

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-5 sm:py-6 lg:px-8">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm transition-opacity">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      )}

      <TeacherHeader />
      <TeacherFilters classes={classes} subjects={subjects} />

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
            }}
          >
            <BookOpen size={40} style={{ color: 'var(--brand-accent)' }} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">No Lessons Found</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            You haven&apos;t created any lessons yet, or your search returned no results.
          </p>
          <Link
            href="/teacher/lessons/create"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <PlusCircle size={15} />
            Create New Lesson
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <TeacherLessonCard
              key={lesson.id}
              lesson={lesson}
              onDelete={() => handleDeleteClick(lesson.id)}
              onPublishToggle={handlePublishToggle}
            />
          ))}
        </div>
      )}

      {lessons.length > 0 && <Pagination meta={meta} />}
      
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone and will permanently remove all associated materials."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}