'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, AlignLeft, Book, Clock, CloudUpload, FileText, Globe,
  GraduationCap, Info, PlusCircle, Save, Type, Video, X,
} from 'lucide-react'
import type { Class, Subject } from '@/types/admin'
import type { CreateLessonPayload, Lesson } from '@/types/lesson'
import { createLesson, updateLesson, addMaterialFromFile } from '@/lib/lessons.mutations'
import { ToastViewport, type ToastMessage, type ToastTone } from '@/components/ui/toast'

const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png'

export function LessonForm({
  classes,
  subjects,
  mode,
  initial,
}: {
  classes: Class[]
  subjects: Subject[]
  mode: 'create' | 'edit'
  initial?: Lesson
}) {
  const router = useRouter()

  const [title, setTitle] = useState(initial?.title ?? '')
  const [classId, setClassId] = useState<string>(initial?.class_id != null ? String(initial.class_id) : '')
  const [subjectId, setSubjectId] = useState<string>(initial?.subject_id != null ? String(initial.subject_id) : '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? '')
  const [duration, setDuration] = useState<string>(initial?.duration != null ? String(initial.duration) : '')
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true)

  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const pushToast = (message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }
  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredSubjects = useMemo(() => {
    if (!classId) return []
    return subjects.filter((s) => String(s.class_id) === classId)
  }, [classId, subjects])

  function handleClassChange(value: string) {
    setClassId(value)
    setSubjectId('')
  }

  function handleFileAdd(list: FileList | null) {
    if (!list) return
    setFiles((prev) => [...prev, ...Array.from(list)])
  }

  function handleFileRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) return pushToast('Please enter a lesson title', 'error')
    if (!classId) return pushToast('Please select a class', 'error')
    if (!subjectId) return pushToast('Please select a subject', 'error')

    const payload: CreateLessonPayload = {
      title: title.trim(),
      content: content.trim() || undefined,
      subject_id: Number(subjectId),
      class_id: Number(classId),
      video_url: videoUrl.trim() || undefined,
      duration: duration ? Number(duration) : undefined,
      is_published: isPublished,
    }

    setBusy(true)
    try {
      let lessonId: number
      if (mode === 'create') {
        const created = await createLesson(payload)
        lessonId = created.id
      } else if (initial) {
        await updateLesson(initial.id, payload)
        lessonId = initial.id
      } else {
        throw new Error('Missing lesson')
      }

      for (const file of files) {
        try {
          await addMaterialFromFile(lessonId, file)
        } catch {
          pushToast(`Failed to upload ${file.name}`, 'error')
        }
      }

      pushToast(mode === 'create' ? 'Lesson created successfully' : 'Lesson updated successfully', 'success')
      setTimeout(() => {
        router.push('/teacher/lessons')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      pushToast(err.message || 'Could not save lesson', 'error')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Link href="/teacher/lessons" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft size={14} /> Back to Lessons
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {mode === 'create' ? <PlusCircle size={22} style={{ color: 'var(--brand-accent)' }} /> : <Save size={22} style={{ color: 'var(--brand-accent)' }} />}
          <span style={{ color: 'var(--brand-primary)' }}>{mode === 'create' ? 'Create New Lesson' : 'Edit Lesson'}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'create' ? 'Create engaging content for your students' : `Editing: ${initial?.title ?? ''}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Section icon={Info} title="Basic Information">
          <Field label="Lesson Title" icon={Type} required>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Introduction to Fractions" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Class" icon={GraduationCap} required>
              <select value={classId} onChange={(e) => handleClassChange(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent">
                <option value="">Select a class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subject" icon={Book} required>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required disabled={!classId} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent disabled:opacity-60">
                <option value="">{classId ? 'Select a subject' : 'First select a class'}</option>
                {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section icon={AlignLeft} title="Lesson Content">
          <Field label="Content" icon={FileText}>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Write your lesson content here..." className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25" />
          </Field>
        </Section>

        <Section icon={Video} title="Media & Materials">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="YouTube Video URL" icon={Video}>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25" />
            </Field>
            <Field label="Duration (minutes)" icon={Clock}>
              <input type="number" min={1} max={300} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 45" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25" />
            </Field>
          </div>
          <Field label="Upload Materials" icon={CloudUpload}>
            <label className="relative block cursor-pointer rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition hover:border-brand-accent" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFileAdd(e.dataTransfer.files) }}>
              <CloudUpload size={40} className="mx-auto mb-3" style={{ color: 'var(--brand-accent)' }} />
              <p className="text-sm font-medium text-foreground">Drag &amp; drop files here or click to browse</p>
              <input type="file" multiple accept={ACCEPTED} onChange={(e) => handleFileAdd(e.target.files)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                    <FileText size={15} style={{ color: 'var(--brand-accent)' }} />
                    <span className="min-w-0 flex-1 truncate text-foreground">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(2)} KB</span>
                    <button type="button" onClick={() => handleFileRemove(i)} className="text-xs" style={{ color: 'var(--danger-fg)' }}><X size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </Section>

        <Section icon={Globe} title="Publishing Options">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: 'var(--brand-accent)' }} />
            Publish immediately
          </label>
        </Section>

        <div className="flex justify-end border-t border-border pt-4">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <Save size={15} />
            {busy ? 'Saving...' : mode === 'create' ? 'Create Lesson' : 'Update Lesson'}
          </button>
        </div>
      </form>
      
      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-5 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon size={18} style={{ color: 'var(--brand-accent)' }} /> {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, icon: Icon, required, children }: { label: string, icon: any, required?: boolean, children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon size={14} style={{ color: 'var(--brand-accent)' }} /> {label}
        {required && <span className="text-sm" style={{ color: 'var(--danger-fg)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}