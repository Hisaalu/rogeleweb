'use client'

import { useMemo, useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createLessonClient,
  deleteLessonClient,
  setApprovedClient,
  setPublishedClient,
  updateLessonClient,
} from '@/lib/lessons.client'
import type { Class, Lesson, Subject } from '@/types/lesson'
import { LessonTable } from './lesson-table'
import { LessonFormModal, type LessonFormValues } from './lesson-form-modal'
import { LessonMaterialsModal } from './lesson-materials-modal'

export function LessonsView({
  initialLessons,
  classes,
  subjects,
  role,
  currentUserId,
}: {
  initialLessons: Lesson[]
  classes: Class[]
  subjects: Subject[]
  role: string
  currentUserId: number
}) {
  const branding = useBranding()

  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<number | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null)
  const [publishedFilter, setPublishedFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null)
  const [materialsTarget, setMaterialsTarget] = useState<Lesson | null>(null)

  const classesById = useMemo(() => {
    const m = new Map<number, Class>()
    for (const c of classes) m.set(c.id, c)
    return m
  }, [classes])

  const subjectsById = useMemo(() => {
    const m = new Map<number, Subject>()
    for (const s of subjects) m.set(s.id, s)
    return m
  }, [subjects])

  const filterableSubjects = useMemo(() => {
    if (!classFilter) return subjects
    return subjects.filter((s) => !s.class_id || s.class_id === classFilter)
  }, [subjects, classFilter])

  const filtered = useMemo(() => {
    let list = lessons
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.content ?? '').toLowerCase().includes(q),
      )
    }
    if (classFilter !== null) list = list.filter((l) => l.class_id === classFilter)
    if (subjectFilter !== null) list = list.filter((l) => l.subject_id === subjectFilter)
    if (publishedFilter !== null) list = list.filter((l) => l.is_published === publishedFilter)
    return list
  }, [lessons, search, classFilter, subjectFilter, publishedFilter])

  const canCreate = role === 'admin' || role === 'teacher'

  function handleNew() {
    setEditingLesson(null)
    setFormOpen(true)
  }

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: LessonFormValues): Promise<Lesson> {
    const payload = {
      title: values.title.trim(),
      content: values.content.trim() || undefined,
      class_id: values.class_id ?? undefined,
      subject_id: values.subject_id ?? undefined,
      duration: values.duration ?? undefined,
      video_url: values.video_url.trim() || undefined,
      is_published: values.is_published,
    }

    let result: Lesson
    if (editingLesson) {
      result = await updateLessonClient(editingLesson.id, payload)
      setLessons((list) => list.map((l) => (l.id === result.id ? result : l)))
    } else {
      result = await createLessonClient(payload)
      setLessons((list) => [result, ...list])
    }
    return result
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteLessonClient(deleteTarget.id)
    setLessons((list) => list.filter((l) => l.id !== deleteTarget.id))
  }

  async function handleTogglePublish(lesson: Lesson) {
    try {
      const updated = await setPublishedClient(lesson.id, !lesson.is_published)
      setLessons((list) => list.map((l) => (l.id === updated.id ? updated : l)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function handleToggleApprove(lesson: Lesson) {
    try {
      const updated = await setApprovedClient(lesson.id, !lesson.is_approved)
      setLessons((list) => list.map((l) => (l.id === updated.id ? updated : l)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Lessons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreate
              ? 'Create, publish, and manage your lessons.'
              : 'Browse the lessons available for your class.'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleNew} style={{ backgroundColor: branding.colorPrimary }}>
            <Plus size={16} />
            New lesson
          </Button>
        )}
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          description={
            canCreate
              ? 'Create your first lesson to get started.'
              : 'Your teacher has not published any lessons for your class yet.'
          }
          action={
            canCreate ? (
              <Button onClick={handleNew}>
                <Plus size={16} />
                New lesson
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={classFilter ?? ''}
              onChange={(e) => {
                setClassFilter(e.target.value ? Number(e.target.value) : null)
                setSubjectFilter(null)
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter ?? ''}
              onChange={(e) =>
                setSubjectFilter(e.target.value ? Number(e.target.value) : null)
              }
              disabled={!classFilter}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25 disabled:opacity-60"
            >
              <option value="">{classFilter ? 'All subjects' : 'Pick a class first'}</option>
              {filterableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={publishedFilter === null ? '' : publishedFilter ? 'true' : 'false'}
              onChange={(e) => {
                const v = e.target.value
                setPublishedFilter(v === '' ? null : v === 'true')
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">Any status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <LessonTable
            lessons={filtered}
            classesById={classesById}
            subjectsById={subjectsById}
            role={role}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onTogglePublish={handleTogglePublish}
            onToggleApprove={handleToggleApprove}
            onMaterials={setMaterialsTarget}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {lessons.length}
          </p>
        </>
      )}

      <LessonFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        classes={classes}
        subjects={subjects}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete lesson"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <LessonMaterialsModal
        open={materialsTarget !== null}
        onOpenChange={(o) => !o && setMaterialsTarget(null)}
        lesson={materialsTarget}
        canEdit={
          role === 'admin' ||
          (role === 'teacher' && materialsTarget?.teacher_id === currentUserId)
        }
      />
    </div>
  )
}