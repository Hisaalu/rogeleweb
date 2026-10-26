'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { Class } from '@/types/admin'

export interface ClassFormValues {
  name: string
  level: string
  description: string
  is_active: boolean
}

const EMPTY: ClassFormValues = {
  name: '', level: '', description: '', is_active: true,
}

function fromClass(c: Class): ClassFormValues {
  return {
    name: c.name, level: c.level, description: c.description ?? '', is_active: c.is_active,
  }
}

export function ClassFormModal({
  open, onOpenChange, classItem, onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classItem?: Class | null
  onSubmit: (values: ClassFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<ClassFormValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(classItem ? fromClass(classItem) : EMPTY)
    setError(null)
  }, [classItem, open])

  function set<K extends keyof ClassFormValues>(key: K, value: ClassFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.name.trim()) return setError('Name is required')
    if (!values.level.trim()) return setError('Level is required')

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{classItem ? 'Edit class' : 'New class'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Form 1" autoFocus disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level">Level</Label>
            <Input id="level" value={values.level} onChange={(e) => set('level', e.target.value)} placeholder="e.g. S1, Year 1, Grade 5" disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional description..." rows={3} disabled={submitting} />
          </div>

          <div className="flex items-center gap-2">
            <input id="is_active" type="checkbox" checked={values.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 rounded border-input" disabled={submitting} />
            <Label htmlFor="is_active" className="cursor-pointer font-normal">
              Active (visible to teachers and admins when assigning content)
            </Label>
          </div>

          {error && (
            <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-3 py-2 text-sm text-danger-fg">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {classItem ? 'Save changes' : 'Create class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}