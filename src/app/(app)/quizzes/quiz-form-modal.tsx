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
import type { Class, Subject } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'

export interface QuizFormValues {
  title: string
  description: string
  class_id: number | null
  subject_id: number | null
  time_limit: number | null
  passing_score: number | null
  max_attempts: number | null
  is_published: boolean
}

const EMPTY: QuizFormValues = {
  title: '',
  description: '',
  class_id: null,
  subject_id: null,
  time_limit: null,
  passing_score: 50,
  max_attempts: 3,
  is_published: false,
}

function fromQuiz(q: Quiz): QuizFormValues {
  return {
    title: q.title,
    description: q.description ?? '',
    class_id: q.class_id ?? null,
    subject_id: q.subject_id ?? null,
    time_limit: q.time_limit ?? null,
    passing_score: q.passing_score ?? 50,
    max_attempts: q.max_attempts ?? 3,
    is_published: q.is_published,
  }
}

export function QuizFormModal({
  open,
  onOpenChange,
  quiz,
  classes,
  subjects,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz?: Quiz | null
  classes: Class[]
  subjects: Subject[]
  onSubmit: (values: QuizFormValues) => Promise<Quiz>
}) {
  const [values, setValues] = useState<QuizFormValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(quiz ? fromQuiz(quiz) : EMPTY)
    setError(null)
  }, [quiz, open])

  const visibleSubjects = useMemo(() => {
    if (!values.class_id) return subjects
    return subjects.filter((s) => !s.class_id || s.class_id === values.class_id)
  }, [subjects, values.class_id])

  function set<K extends keyof QuizFormValues>(key: K, value: QuizFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleClassChange(raw: string) {
    const newClassId = raw ? Number(raw) : null
    setValues((v) => {
      if (v.subject_id === null) return { ...v, class_id: newClassId }
      const belongs = subjects.find((s) => s.id === v.subject_id)?.class_id === newClassId
      return { ...v, class_id: newClassId, subject_id: belongs ? v.subject_id : null }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.title.trim()) {
      setError('Title is required')
      return
    }
    if (!values.class_id) {
      setError('Class is required')
      return
    }
    if (!values.subject_id) {
      setError('Subject is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz ? 'Edit quiz' : 'New quiz'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Algebra basics"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="class_id">Class</Label>
              <Select
                id="class_id"
                value={values.class_id ?? ''}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject_id">Subject</Label>
              <Select
                id="subject_id"
                value={values.subject_id ?? ''}
                onChange={(e) =>
                  set('subject_id', e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting || !values.class_id}
              >
                <option value="">
                  {values.class_id ? 'Select a subject' : 'Pick a class first'}
                </option>
                {visibleSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="time_limit">Time limit (minutes)</Label>
              <Input
                id="time_limit"
                type="number"
                min={0}
                value={values.time_limit ?? ''}
                onChange={(e) =>
                  set('time_limit', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="30"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passing_score">Passing score (%)</Label>
              <Input
                id="passing_score"
                type="number"
                min={0}
                max={100}
                value={values.passing_score ?? ''}
                onChange={(e) =>
                  set('passing_score', e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max_attempts">Max attempts</Label>
              <Input
                id="max_attempts"
                type="number"
                min={1}
                value={values.max_attempts ?? ''}
                onChange={(e) =>
                  set('max_attempts', e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Summary or instructions for learners..."
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_published"
              type="checkbox"
              checked={values.is_published}
              onChange={(e) => set('is_published', e.target.checked)}
              className="h-4 w-4 rounded border-input"
              disabled={submitting}
            />
            <Label htmlFor="is_published" className="cursor-pointer font-normal">
              Publish immediately (visible to learners)
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
              {quiz ? 'Save changes' : 'Create quiz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}