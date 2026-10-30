'use client'

import { useRouter } from 'nextjs-toploader/app'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, UploadCloud, X, Paperclip, Trash2 } from 'lucide-react'
import type { Homework, HomeworkAttachment } from '@/types/homework'
import type { Class, Subject } from '@/types/admin'
import { createHomeworkClient, updateHomeworkClient, addHomeworkAttachmentClient, deleteHomeworkAttachmentClient } from '@/lib/homework.client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function HomeworkForm({
  classes, subjects, mode, initial, initialAttachments = []
}: {
  classes: Class[], subjects: Subject[], mode: 'create' | 'edit', initial?: Homework, initialAttachments?: HomeworkAttachment[]
}) {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [classId, setClassId] = useState(initial?.class_id ? String(initial.class_id) : '')
  const [subjectId, setSubjectId] = useState(initial?.subject_id ? String(initial.subject_id) : '')
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.slice(0, 16) : '')
  
  const [files, setFiles] = useState<File[]>([])
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>(initialAttachments)
  
  const [busy, setBusy] = useState(false)
  
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredSubjects = useMemo(() => {
    if (!classId) return []
    return subjects.filter(s => String(s.class_id) === classId)
  }, [classId, subjects])

  function handleFileAdd(list: FileList | null) {
    if (!list) return
    const newFiles = Array.from(list)
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) return showToast(`${f.name} exceeds 5MB`, 'error')
    }
    setFiles(prev => [...prev, ...newFiles])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !classId || !subjectId || !dueDate) return showToast('Please fill all required fields', 'error')
    
    setBusy(true)
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

      const failedFiles: string[] = []
      for (const file of files) {
        try {
          await addHomeworkAttachmentClient(homeworkId, file)
        } catch {
          failedFiles.push(file.name)
        }
      }

      if (failedFiles.length > 0) {
        showToast(`Homework saved, but failed to upload: ${failedFiles.join(', ')}`, 'error')
        setBusy(false)
        setFiles(prev => prev.filter(f => failedFiles.includes(f.name)))
        return
      }

      showToast(mode === 'create' ? 'Homework created successfully!' : 'Homework updated successfully!', 'success')
      setTimeout(() => {
        router.push('/teacher/homework')
        router.refresh()
      }, 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save homework'
      showToast(message, 'error')
      setBusy(false)
    }
  }

  async function confirmRemoveAttachment() {
    if (!initial || !deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteHomeworkAttachmentClient(initial.id, deleteTarget)
      setAttachments(prev => prev.filter(a => a.id !== deleteTarget))
      showToast('Attachment deleted', 'success')
      setDeleteTarget(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete attachment'
      showToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-5 sm:px-4 sm:py-8">
      <Link href="/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Homework
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <span style={{ color: 'var(--brand-primary)' }}>{mode === 'create' ? 'Create New Homework' : 'Edit Homework'}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === 'create' ? 'Assign homework to your students' : `Editing: ${initial?.title}`}</p>
      </div>

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">Homework Title <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
            <Input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Class <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
              <Select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId('') }} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Subject <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
              <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!classId}>
                <option value="">Select Subject</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">Due Date <span style={{ color: 'var(--danger-fg)' }}>*</span></label>
            <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>

          {mode === 'edit' && attachments.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Current Attachments</label>
              <ul className="space-y-2">
                {attachments.map(a => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-4 py-2 text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip size={14} style={{ color: 'var(--brand-accent)' }} className="shrink-0" />
                      <span className="truncate font-medium">{a.file_name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">({(a.file_size ? a.file_size / 1024 : 0).toFixed(2)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setDeleteTarget(a.id)} className="shrink-0 transition hover:opacity-70" style={{ color: 'var(--danger-fg)' }}><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">{mode === 'create' ? 'Add Attachments' : 'Add New Attachments'}</label>
            <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-brand-accent hover:bg-muted/50">
              <UploadCloud size={32} className="mb-2" style={{ color: 'var(--brand-accent)' }} />
              <span className="text-sm font-medium text-foreground">Tap to browse or drag files here</span>
              <span className="mt-1 text-xs text-muted-foreground">Max 5MB per file</span>
              <input type="file" multiple onChange={e => handleFileAdd(e.target.files)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-2 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="shrink-0 transition hover:opacity-70" style={{ color: 'var(--danger-fg)' }}><X size={15} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              <Save size={16} className="mr-2" /> {busy ? 'Saving...' : mode === 'create' ? 'Create Homework' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Attachment"
        description="Are you sure you want to remove this attachment? Students will no longer be able to download it."
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={confirmRemoveAttachment}
      />
    </div>
  )
}