'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Info, AlignLeft, Paperclip, Award, CheckCircle2, 
  Trash2, UploadCloud, Download, FileText, AlertTriangle
} from 'lucide-react'
import type { Homework, HomeworkAttachment, HomeworkSubmission } from '@/types/homework'
import { submitHomeworkClient, deleteSubmissionClient } from '@/lib/homework.client'
import { materialDownloadUrl, formatFileSize } from '@/lib/materials'
import { useToast, type ToastTone } from '@/components/ui/toast-provider'


export function LearnerHomeworkDetail({
  homework,
  attachments,
  submission: initialSubmission,
}: {
  homework: Homework
  attachments: HomeworkAttachment[]
  submission: HomeworkSubmission | null
}) {
  const router = useRouter()
  
  const [textAnswer, setTextAnswer] = useState(initialSubmission?.text_answer ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const dueDate = new Date(homework.due_date)
  const isExpired = dueDate.getTime() < new Date().getTime()
  
  const isGraded = initialSubmission?.status === 'graded'
  const canResubmit = (!initialSubmission || !isGraded)
  const canDelete = !!initialSubmission && !isGraded

  function handleFileAdd(list: FileList | null) {
    if (!list) return
    const newFiles = Array.from(list)
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) return pushToast(`${f.name} exceeds 5MB limit.`, 'error')
    }
    setFiles(prev => [...prev, ...newFiles])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!textAnswer.trim() && files.length === 0) {
      return pushToast('Please provide a text answer or attach a file.', 'error')
    }

    setBusy(true)

    try {
      await submitHomeworkClient(homework.id, textAnswer, files)
      pushToast('Homework submitted successfully!', 'success')
      setFiles([])
      setBusy(false)
      window.location.reload() 
    } catch (err: any) {
      pushToast(err.message || 'Failed to submit homework', 'error')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!initialSubmission) return
    setBusy(true)
    try {
      await deleteSubmissionClient(initialSubmission.id)
      pushToast('Submission deleted successfully', 'success')
      setShowDeleteModal(false)
      setBusy(false)
      window.location.href = `/learner/homework/${homework.id}`
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        window.location.href = `/learner/homework/${homework.id}`
        return
      }
      pushToast(err.message || 'Failed to delete submission', 'error')
      setShowDeleteModal(false)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link href="/learner/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Homework
        </Link>
        <h1 className="mt-3 text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{homework.title}</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        
        <div className="border-b border-border p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Info size={18} style={{ color: 'var(--brand-accent)' }} /> Assignment Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase text-muted-foreground">Subject</p><p className="font-medium text-foreground">{homework.subject_name ?? 'General'}</p></div>
            <div><p className="text-xs font-semibold uppercase text-muted-foreground">Class</p><p className="font-medium text-foreground">{homework.class_name ?? 'All'}</p></div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Due Date</p>
              <p className={`font-medium ${isExpired ? 'text-red-500' : 'text-foreground'}`}>
                {dueDate.toLocaleString()}
                {isExpired && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">Overdue</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-border p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground"><AlignLeft size={18} style={{ color: 'var(--brand-accent)' }} /> Description</h2>
          <div className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">{homework.description || 'No description provided.'}</div>
        </div>

        {attachments.length > 0 && (
          <div className="border-b border-border p-6 sm:p-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground"><Paperclip size={18} style={{ color: 'var(--brand-accent)' }} /> Homework Files</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {attachments.map(a => (
                <a key={a.id} href={materialDownloadUrl(a.file_path)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-brand-accent">
                  <Download size={18} style={{ color: 'var(--brand-accent)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{a.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(a.file_size)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {isGraded && initialSubmission && (
          <div className="border-b border-border bg-emerald-50/30 p-6 sm:p-8 dark:bg-emerald-950/20">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-400"><Award size={18} /> Grade & Feedback</h2>
            <div className="rounded-xl border-2 border-emerald-500 bg-card p-5">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Your Score</p>
              <p className="mb-4 text-4xl font-extrabold text-emerald-500">{initialSubmission.grade}%</p>
              {initialSubmission.feedback && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">Teacher's Comment</p>
                  <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{initialSubmission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {initialSubmission && !isGraded && (
          <div className="border-b border-border bg-blue-50/30 p-6 sm:p-8 dark:bg-blue-950/20">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400"><CheckCircle2 size={18} /> Your Submission</h2>
              {canDelete && (
                <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"><Trash2 size={13} /> Delete</button>
              )}
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Submitted on {initialSubmission.submitted_at ? new Date(initialSubmission.submitted_at).toLocaleString() : 'N/A'}</p>
            {initialSubmission.text_answer && (
              <div className="mb-4">
                <p className="mb-1 text-sm font-semibold text-foreground">Submitted Response</p>
                <div className="rounded-xl bg-card p-4 text-sm text-foreground whitespace-pre-wrap">{initialSubmission.text_answer}</div>
              </div>
            )}
            {initialSubmission.files && initialSubmission.files.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Attached Files</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {initialSubmission.files.map(f => (
                    <a key={f.id} href={materialDownloadUrl(f.file_path)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm transition hover:border-brand-accent">
                      <FileText size={16} style={{ color: 'var(--brand-accent)' }} />
                      <span className="flex-1 truncate font-medium">{f.file_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {canResubmit && (
          <div className="bg-muted p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><UploadCloud size={18} style={{ color: 'var(--brand-accent)' }} />{initialSubmission ? 'Resubmit Your Work' : 'Submit Your Work'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">Your Answer</label>
                <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)} rows={4} placeholder="Type your answer here..." className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-brand-accent" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">Attach Files (Max 5MB)</label>
                <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-6 text-center transition hover:border-brand-accent">
                  <UploadCloud size={28} className="mb-2" style={{ color: 'var(--brand-accent)' }} />
                  <span className="text-sm font-medium text-foreground">Click or drag files here</span>
                  <span className="mt-1 text-xs text-muted-foreground">Max 5MB per file</span>
                  <input type="file" multiple onChange={e => handleFileAdd(e.target.files)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                        <span className="truncate">{f.name}</span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {isExpired && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle size={16} className="shrink-0" />
                  <p>This assignment is past its due date. Late submissions may incur penalties.</p>
                </div>
              )}
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}>
                {busy ? 'Submitting...' : initialSubmission ? 'Resubmit Homework' : 'Submit Homework'}
              </button>
            </form>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-red-200 bg-red-50 px-6 py-4 dark:border-red-900/50 dark:bg-red-950/30">
              <h3 className="flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400"><AlertTriangle size={18} /> Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-foreground">Are you sure you want to delete your submission?</p>
              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">This action cannot be undone. You will need to submit your work again.</div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80">Cancel</button>
              <button onClick={handleDelete} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"><Trash2 size={15} /> {busy ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}