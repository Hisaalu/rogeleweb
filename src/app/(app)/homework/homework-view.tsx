'use client'

import { useMemo, useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createHomeworkClient,
  deleteHomeworkClient,
  updateHomeworkClient,
} from '@/lib/homework.client'
import type { Class, Subject } from '@/types/lesson'
import type { Homework, HomeworkSubmission } from '@/types/homework'
import { HomeworkTable } from './homework-table'
import {
  HomeworkFormModal,
  type HomeworkFormValues,
} from './homework-form-modal'
import { HomeworkSubmissionsModal } from './homework-submissions-modal'
import { SubmissionFormModal } from './submission-form-modal'
import { GradeSubmissionModal } from './grade-submission-modal'

export function HomeworkView({
  initialHomework,
  classes,
  subjects,
  role,
  currentUserId,
}: {
  initialHomework: Homework[]
  classes: Class[]
  subjects: Subject[]
  role: string
  currentUserId: number
}) {
  const branding = useBranding()

  const [homework, setHomework] = useState<Homework[]>(initialHomework)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<number | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Homework | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Homework | null>(null)

  const [submissionsTarget, setSubmissionsTarget] = useState<Homework | null>(null)
  const [gradeTarget, setGradeTarget] = useState<HomeworkSubmission | null>(null)
  const [submitTarget, setSubmitTarget] = useState<Homework | null>(null)

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
    let list = homework
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          (h.description ?? '').toLowerCase().includes(q),
      )
    }
    if (classFilter !== null) list = list.filter((h) => h.class_id === classFilter)
    if (subjectFilter !== null) list = list.filter((h) => h.subject_id === subjectFilter)
    return list
  }, [homework, search, classFilter, subjectFilter])

  const canCreate = role === 'admin' || role === 'teacher'

  function handleNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleEdit(hw: Homework) {
    setEditing(hw)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: HomeworkFormValues): Promise<Homework> {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      class_id: values.class_id!,
      subject_id: values.subject_id!,
      due_date: new Date(values.due_date).toISOString(),
    }

    let result: Homework
    if (editing) {
      result = await updateHomeworkClient(editing.id, payload)
      setHomework((list) => list.map((h) => (h.id === result.id ? result : h)))
    } else {
      result = await createHomeworkClient(payload)
      setHomework((list) => [result, ...list])
    }
    return result
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteHomeworkClient(deleteTarget.id)
    setHomework((list) => list.filter((h) => h.id !== deleteTarget.id))
  }

  async function handleToggleActive(hw: Homework) {
    try {
      const updated = await updateHomeworkClient(hw.id, { is_active: !hw.is_active })
      setHomework((list) => list.map((h) => (h.id === updated.id ? updated : h)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Homework</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreate
              ? 'Assign homework, review submissions, and grade learners.'
              : 'View and submit your assigned homework.'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleNew} style={{ backgroundColor: branding.colorPrimary }}>
            <Plus size={16} />
            New homework
          </Button>
        )}
      </div>

      {homework.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No homework yet"
          description={
            canCreate
              ? 'Create your first homework assignment.'
              : 'Your teacher has not assigned homework to your class yet.'
          }
          action={
            canCreate ? (
              <Button onClick={handleNew}>
                <Plus size={16} />
                New homework
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search homework..."
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
          </div>

          <HomeworkTable
            homework={filtered}
            classesById={classesById}
            subjectsById={subjectsById}
            role={role}
            currentUserId={currentUserId}
            onSubmit={setSubmitTarget}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onToggleActive={handleToggleActive}
            onViewSubmissions={setSubmissionsTarget}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {homework.length}
          </p>
        </>
      )}

      <HomeworkFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        homework={editing}
        classes={classes}
        subjects={subjects}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete homework"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" and all its submissions will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <HomeworkSubmissionsModal
        open={submissionsTarget !== null}
        onOpenChange={(o) => !o && setSubmissionsTarget(null)}
        homework={submissionsTarget}
        onGrade={(s) => {
          setGradeTarget(s)
          setSubmissionsTarget(null)
        }}
      />

      <SubmissionFormModal
        open={submitTarget !== null}
        onOpenChange={(o) => !o && setSubmitTarget(null)}
        homework={submitTarget}
        onSubmitted={() => {}}
      />

      <GradeSubmissionModal
        open={gradeTarget !== null}
        onOpenChange={(o) => !o && setGradeTarget(null)}
        submission={gradeTarget}
        onGraded={() => {}}
      />
    </div>
  )
}