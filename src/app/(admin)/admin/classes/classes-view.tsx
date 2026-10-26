'use client'

import { useMemo, useState, useCallback } from 'react'
import { GraduationCap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast-provider'
import {
  createClassClient,
  deleteClassClient,
  updateClassClient,
} from '@/lib/classes.client'
import type { Class } from '@/types/admin'
import { ClassTable } from './class-table'
import { ClassFormModal, type ClassFormValues } from './class-form-modal'

export function ClassesView({ initialClasses }: { initialClasses: Class[] }) {
  const { showToast } = useToast()

  const [classes, setClasses] = useState<Class[]>(initialClasses)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null)

  const filtered = useMemo(() => {
    let list = classes
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.level.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q),
      )
    }
    if (activeFilter !== null) {
      list = list.filter((c) => c.is_active === activeFilter)
    }
    return list
  }, [classes, search, activeFilter])

  const handleNew = useCallback(() => {
    setEditing(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((c: Class) => {
    setEditing(c)
    setFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(async (values: ClassFormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        level: values.level.trim(),
        description: values.description.trim() || undefined,
        is_active: values.is_active,
      }

      if (editing) {
        const updated = await updateClassClient(editing.id, payload)
        setClasses((list) => list.map((c) => (c.id === updated.id ? updated : c)))
        showToast('Class updated successfully.', 'success')
      } else {
        const created = await createClassClient(payload)
        setClasses((list) => [created, ...list])
        showToast('Class created successfully.', 'success')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save class')
    }
  }, [editing, showToast])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteClassClient(deleteTarget.id)
      setClasses((list) => list.filter((c) => c.id !== deleteTarget.id))
      showToast('Class deleted.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, showToast])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Classes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define your classes here.
          </p>
        </div>

        <Button onClick={handleNew}>
          <Plus size={16} /> New class
        </Button>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No classes yet"
          description="Create your first class to start organizing lessons, homework, and quizzes."
          action={
            <Button onClick={handleNew}>
              <Plus size={16} /> New class
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            <div className="hidden lg:block" />
          </div>

          <ClassTable
            classes={filtered}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {classes.length}
          </p>
        </>
      )}

      <ClassFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        classItem={editing}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete class"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. This action cannot be undone. If subjects, lessons, homework, or quizzes reference this class, deletion will be blocked.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}