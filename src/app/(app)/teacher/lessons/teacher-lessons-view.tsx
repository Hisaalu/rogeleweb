'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, PlusCircle } from 'lucide-react'
import type { Class, Subject } from '@/types/admin'
import type { Lesson, LessonListMeta } from '@/types/lesson'
import { deleteLesson, publishLesson } from '@/lib/lessons.mutations'
import {
  ToastViewport,
  type ToastMessage,
  type ToastTone,
} from '@/components/ui/toast'
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

  useEffect(() => {
    setLessons(initial)
  }, [initial])

  const pushToast = useCallback((message: string, tone: ToastTone) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message, tone },
    ])
  }, [])

  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleDelete = useCallback(
    async (id: number) => {
      if (
        !window.confirm(
          'Are you sure you want to delete this lesson? This action cannot be undone.',
        )
      ) {
        return
      }
      try {
        await deleteLesson(id)
        setLessons((list) => list.filter((l) => l.id !== id))
        pushToast('Lesson deleted', 'success')
      } catch {
        pushToast('Could not delete lesson', 'error')
      }
    },
    [pushToast],
  )

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
          published ? 'Lesson published' : 'Lesson moved to drafts',
          'success',
        )
      } catch {
        pushToast('Could not update lesson', 'error')
      }
    },
    [pushToast],
  )

  return (
    <div className="space-y-6">
      <TeacherHeader />

      <TeacherFilters classes={classes} subjects={subjects} />

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
            }}
          >
            <BookOpen size={40} style={{ color: 'var(--brand-accent)' }} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            No Lessons Yet
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            You haven&apos;t created any lessons matching this search.
          </p>
          <Link
            href="/teacher/lessons/create"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <PlusCircle size={15} />
            Create a New Lesson
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <TeacherLessonCard
              key={lesson.id}
              lesson={lesson}
              onDelete={handleDelete}
              onPublishToggle={handlePublishToggle}
            />
          ))}
        </div>
      )}

      <Pagination meta={meta} />

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}