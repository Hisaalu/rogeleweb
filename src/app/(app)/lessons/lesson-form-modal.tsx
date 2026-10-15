'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { File as FileIcon, Loader2, Trash2, Upload } from 'lucide-react'
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
import { addMaterialClient } from '@/lib/lessons.client'
import { uploadFile } from '@/lib/uploads.client'
import type { Class, Lesson, Subject } from '@/types/lesson'

export interface LessonFormValues {
  title: string
  content: string
  class_id: number | null
  subject_id: number | null
  duration: number | null
  video_url: string
  is_published: boolean
}

const EMPTY: LessonFormValues = {
  title: '',
  content: '',
  class_id: null,
  subject_id: null,
  duration: null,
  video_url: '',
  is_published: false,
}

function fromLesson(l: Lesson): LessonFormValues {
  return {
    title: l.title,
    content: l.content ?? '',
    class_id: l.class_id ?? null,
    subject_id: l.subject_id ?? null,
    duration: l.duration ?? null,
    video_url: l.video_url ?? '',
    is_published: l.is_published,
  }
}

export function LessonFormModal({
  open,
  onOpenChange,
  lesson,
  classes,
  subjects,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: Lesson | null
  classes: Class[]
  subjects: Subject[]
  onSubmit: (values: LessonFormValues) => Promise<Lesson>
}) {
  const [values, setValues] = useState<LessonFormValues>(EMPTY)
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number; percent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValues(lesson ? fromLesson(lesson) : EMPTY)
    setStagedFiles([])
    setError(null)
    setProgress(null)
  }, [lesson, open])

  const visibleSubjects = useMemo(() => {
    if (!values.class_id) return subjects
    return subjects.filter((s) => !s.class_id || s.class_id === values.class_id)
  }, [subjects, values.class_id])

  function set<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
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

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const valid = arr.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        setError(`"${f.name}" exceeds the 5 MB limit`)
        return false
      }
      return true
    })
    setStagedFiles((prev) => [...prev, ...valid])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.title.trim()) {
      setError('Title is required')
      return
    }

    setSubmitting(true)
    try {
      const savedLesson = await onSubmit(values)

      if (stagedFiles.length > 0) {
        for (let i = 0; i < stagedFiles.length; i++) {
          const file = stagedFiles[i]
          setProgress({ current: i + 1, total: stagedFiles.length, percent: 0 })

          try {
            const uploaded = await uploadFile(file, 'lesson-materials', (percent) =>
              setProgress({ current: i + 1, total: stagedFiles.length, percent }),
            )
            await addMaterialClient(savedLesson.id, {
              file_name: uploaded.fileName,
              file_path: uploaded.publicUrl,
              file_type: uploaded.fileType,
              file_size: uploaded.fileSize,
            })
          } catch (err) {
            setError(
              `Lesson saved but "${file.name}" failed to upload: ${
                err instanceof Error ? err.message : 'unknown error'
              }`,
            )
            setSubmitting(false)
            setProgress(null)
            return
          }
        }
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lesson')
    } finally {
      setSubmitting(false)
      setProgress(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Edit lesson' : 'New lesson'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Introduction to Algebra"
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

            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={values.duration ?? ''}
                onChange={(e) =>
                  set('duration', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="30"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                value={values.video_url}
                onChange={(e) => set('video_url', e.target.value)}
                placeholder="https://..."
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={values.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder="Write the lesson content or a summary..."
              rows={6}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Materials</Label>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
                dragOver
                  ? 'border-brand-accent bg-brand-accent/5'
                  : 'border-border bg-muted/20 hover:border-brand-accent/50'
              }`}
            >
              <Upload size={20} className="text-brand-accent" />
              <p className="text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Max 5 MB each. PDFs, documents, images, short videos.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>

            {stagedFiles.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {stagedFiles.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FileIcon size={14} className="shrink-0 text-brand-accent" />
                      <span className="truncate text-sm">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStagedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={submitting}
                      className="rounded p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {progress && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Uploading {progress.current} of {progress.total}
                  </span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress.percent}%`,
                      backgroundColor: 'var(--brand-accent)',
                    }}
                  />
                </div>
              </div>
            )}
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
              {submitting
                ? stagedFiles.length > 0
                  ? 'Saving and uploading...'
                  : 'Saving...'
                : lesson
                  ? 'Save changes'
                  : 'Create lesson'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}