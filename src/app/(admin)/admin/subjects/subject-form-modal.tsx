'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Class, Subject, TeacherOption } from '@/types/admin'

export interface SubjectFormValues {
  name: string
  code: string
  description: string
  class_id: number | null
  teacher_id: number | null
  is_active: boolean
}

const EMPTY: SubjectFormValues = {
  name: '',
  code: '',
  description: '',
  class_id: null,
  teacher_id: null,
  is_active: true,
}

function fromSubject(s: Subject): SubjectFormValues {
  return {
    name: s.name,
    code: s.code ?? '',
    description: s.description ?? '',
    class_id: s.class_id ?? null,
    teacher_id: s.teacher_id ?? null,
    is_active: s.is_active,
  }
}

function teacherLabel(t: TeacherOption): string {
  const name = [t.first_name, t.last_name].filter(Boolean).join(' ')
  return name ? `${name} (${t.email})` : t.email
}

export function SubjectFormModal({
  open,
  onOpenChange,
  subject,
  classes,
  teachers,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: Subject | null
  classes: Class[]
  teachers: TeacherOption[]
  onSubmit: (values: SubjectFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<SubjectFormValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(subject ? fromSubject(subject) : EMPTY)
    setError(null)
  }, [subject, open])

  function set<K extends keyof SubjectFormValues>(
    key: K,
    value: SubjectFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.name.trim()) {
      setError('Name is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subject')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{subject ? 'Edit subject' : 'New subject'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Mathematics"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={values.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="e.g. MATH"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="class_id">Class</Label>
              <Select
                id="class_id"
                value={values.class_id ?? ''}
                onChange={(e) =>
                  set('class_id', e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting}
              >
                <option value="">No class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacher_id">Teacher</Label>
              <Select
                id="teacher_id"
                value={values.teacher_id ?? ''}
                onChange={(e) =>
                  set('teacher_id', e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting}
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {teacherLabel(t)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional description..."
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-input"
              disabled={submitting}
            />
            <Label htmlFor="is_active" className="cursor-pointer font-normal">
              Active (visible to teachers and admins when assigning content)
            </Label>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {subject ? 'Save changes' : 'Create subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}