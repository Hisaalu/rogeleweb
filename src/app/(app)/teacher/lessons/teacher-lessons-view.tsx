'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, PlusCircle } from 'lucide-react'
import type { Class, Subject } from '@/types/admin'
import type { Lesson, LessonListMeta } from '@/types/lesson'
import { deleteLesson, publishLesson } from '@/lib/lessons.mutations'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TeacherHeader } from './components/teacher-header'
import { TeacherFilters } from './components/teacher-filters'
import { TeacherLessonCard } from './components/teacher-lesson-card'
import { Pagination } from './components/pagination'

export function TeacherLessonsView({
  lessons: initial,
  meta,
  classes,
  subjects,
}: {
  lessons: Lesson[]
  meta: LessonListMeta
  classes: Class[]
  subjects: Subject[]
}) {
  const [lessons, setLessons] = useState(initial)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const pushToast = useCallback((message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }, [])

  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    setLessons(initial)
  }, [initial])

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteTarget(id)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteLesson(deleteTarget)
      setLessons((list) => list.filter((l) => l.id !== deleteTarget))
      pushToast('Lesson deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err: any) {
      pushToast(err.message || 'Could not delete lesson', 'error')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, pushToast])

  const handlePublishToggle = useCallback(
    async (id: number, published: boolean) => {
      try {
        const updated = await publishLesson(id, published)
        setLessons((list) =>
          list.map((l) =>
            l.id === id ? { ...l, ...updated, is_published: published } : l,
          ),
        )
        pushToast(
          published ? 'Lesson published successfully' : 'Lesson moved to drafts',
          'success',
        )
      } catch (err: any) {
        pushToast(err.message || 'Could not update lesson status', 'error')
      }
    },
    [pushToast],
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-5 sm:py-6 lg:px-8">
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
          <h3 className="mb-2 text-xl font-semibold text-foreground">No Lessons Yet</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            You haven&apos;t created any lessons. Start by creating your first lesson!
          </p>
          <Link
            href="/teacher/lessons/create"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <PlusCircle size={15} />
            Create Your First Lesson
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

      <Pagination meta={meta} />
      
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

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}