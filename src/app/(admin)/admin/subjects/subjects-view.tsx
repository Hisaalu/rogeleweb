'use client'

import { useMemo, useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createSubjectClient,
  deleteSubjectClient,
  updateSubjectClient,
} from '@/lib/subjects.client'
import type { Class, Subject, TeacherOption } from '@/types/admin'
import { SubjectTable } from './subject-table'
import { SubjectFormModal, type SubjectFormValues } from './subject-form-modal'

export function SubjectsView({
  initialSubjects,
  classes,
  teachers,
}: {
  initialSubjects: Subject[]
  classes: Class[]
  teachers: TeacherOption[]
}) {
  const branding = useBranding()

  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)
  const [error, setError] = useState<string | null>(null)

  const classesById = useMemo(() => {
    const m = new Map<number, Class>()
    for (const c of classes) m.set(c.id, c)
    return m
  }, [classes])

  const teachersById = useMemo(() => {
    const m = new Map<number, TeacherOption>()
    for (const t of teachers) m.set(t.id, t)
    return m
  }, [teachers])

  const filtered = useMemo(() => {
    let list = subjects
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.code ?? '').toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q),
      )
    }
    if (classFilter !== null) {
      list = list.filter((s) => s.class_id === classFilter)
    }
    if (activeFilter !== null) {
      list = list.filter((s) => s.is_active === activeFilter)
    }
    return list
  }, [subjects, search, classFilter, activeFilter])

  function handleNew() {
    setEditing(null)
    setError(null)
    setFormOpen(true)
  }

  function handleEdit(s: Subject) {
    setEditing(s)
    setError(null)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: SubjectFormValues) {
    try {
      const payload = {
        name: values.name.trim(),
        code: values.code.trim() || undefined,
        description: values.description.trim() || undefined,
        class_id: values.class_id ?? undefined,
        teacher_id: values.teacher_id ?? undefined,
        is_active: values.is_active,
      }

      if (editing) {
        const updated = await updateSubjectClient(editing.id, payload)
        setSubjects((list) => list.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        const created = await createSubjectClient(payload)
        setSubjects((list) => [created, ...list])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save subject'
      throw new Error(message)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteSubjectClient(deleteTarget.id)
      setSubjects((list) => list.filter((s) => s.id !== deleteTarget.id))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subjects and assign them to teachers.
          </p>
        </div>

        <Button onClick={handleNew} style={{ backgroundColor: branding.colorPrimary }}>
          <Plus size={16} />
          New subject
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Create your first subject so teachers can attach lessons and quizzes."
          action={
            <Button onClick={handleNew}>
              <Plus size={16} />
              New subject
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={classFilter ?? ''}
              onChange={(e) =>
                setClassFilter(e.target.value ? Number(e.target.value) : null)
              }
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
              value={activeFilter === null ? '' : activeFilter ? 'true' : 'false'}
              onChange={(e) => {
                const v = e.target.value
                setActiveFilter(v === '' ? null : v === 'true')
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">Any status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <SubjectTable
            subjects={filtered}
            classesById={classesById}
            teachersById={teachersById}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {subjects.length}
          </p>
        </>
      )}

      <SubjectFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editing}
        classes={classes}
        teachers={teachers}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete subject"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. If lessons, homework, or quizzes reference this subject, deletion will be blocked.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}