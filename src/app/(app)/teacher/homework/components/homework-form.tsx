'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, UploadCloud, X, Paperclip, Trash2 } from 'lucide-react'
import type { Homework, HomeworkAttachment } from '@/types/homework'
import type { Class, Subject } from '@/types/admin'
import { createHomeworkClient, updateHomeworkClient, addHomeworkAttachmentClient, deleteHomeworkAttachmentClient } from '@/lib/homework.client'

export function HomeworkForm({
  classes, subjects, mode, initial, initialAttachments = []
}: {
  classes: Class[], subjects: Subject[], mode: 'create' | 'edit', initial?: Homework, initialAttachments?: HomeworkAttachment[]
}) {
  const router = useRouter()
  
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [classId, setClassId] = useState(initial?.class_id ? String(initial.class_id) : '')
  const [subjectId, setSubjectId] = useState(initial?.subject_id ? String(initial.subject_id) : '')
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.slice(0, 16) : '')
  
  const [files, setFiles] = useState<File[]>([])
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>(initialAttachments)
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredSubjects = useMemo(() => {
    if (!classId) return []
    return subjects.filter(s => String(s.class_id) === classId)
  }, [classId, subjects])

  function handleFileAdd(list: FileList | null) {
    if (!list) return
    const newFiles = Array.from(list)
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) return setError(`${f.name} exceeds 5MB`)
    }
    setFiles(prev => [...prev, ...newFiles])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !classId || !subjectId || !dueDate) return setError('Please fill all required fields')
    
    setBusy(true)
    setError(null)
    const payload = {
      title, 
      description, 
      class_id: Number(classId), 
      subject_id: Number(subjectId),
      due_date: new Date(dueDate).toISOString(),
    }

    try {
      let homeworkId: number
      if (mode === 'create') {
        const created = await createHomeworkClient(payload)
        homeworkId = created.id
      } else if (initial) {
        await updateHomeworkClient(initial.id, payload)
        homeworkId = initial.id
      } else {
        throw new Error('Invalid mode')
      }

      for (const file of files) {
        await addHomeworkAttachmentClient(homeworkId, file)
      }

      router.push('/teacher/homework')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save homework')
      setBusy(false)
    }
  }

  async function handleRemoveAttachment(id: number) {
    if (!initial || !window.confirm('Delete this attachment?')) return
    try {
      await deleteHomeworkAttachmentClient(initial.id, id)
      setAttachments(prev => prev.filter(a => a.id !== id))
    } catch {
      setError('Failed to delete attachment')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link href="/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Back to Homework
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span style={{ color: 'var(--brand-primary)' }}>{mode === 'create' ? 'Create New Homework' : 'Edit Homework'}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === 'create' ? 'Assign homework to your students' : `Editing: ${initial?.title}`}</p>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Homework Title <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Class <span className="text-red-500">*</span></label>
            <select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId('') }} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Subject <span className="text-red-500">*</span></label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!classId} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none disabled:opacity-50">
              <option value="">Select Subject</option>
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Due Date <span className="text-red-500">*</span></label>
          <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-accent" />
        </div>

        {mode === 'edit' && attachments.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Current Attachments</label>
            <ul className="space-y-2">
              {attachments.map(a => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-2 text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip size={14} style={{ color: 'var(--brand-accent)' }} />
                    <span className="truncate font-medium">{a.file_name}</span>
                    <span className="text-xs text-muted-foreground">({(a.file_size / 1024).toFixed(2)} KB)</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveAttachment(a.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">{mode === 'create' ? 'Add Attachments' : 'Add New Attachments'}</label>
          <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-brand-accent hover:bg-muted/50">
            <UploadCloud size={32} className="mb-2" style={{ color: 'var(--brand-accent)' }} />
            <span className="text-sm font-medium text-foreground">Tap to browse or drag files here</span>
            <span className="mt-1 text-xs text-muted-foreground">Max 5MB per file</span>
            <input type="file" multiple onChange={e => handleFileAdd(e.target.files)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2 text-sm">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><X size={15} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <Save size={16} /> {busy ? 'Saving...' : mode === 'create' ? 'Create Homework' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}