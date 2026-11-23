'use client'

import { useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import {
  Info, AlignLeft, Paperclip, Award,
  Trash2, UploadCloud, Download, FileText, AlertTriangle,
  BookOpen, GraduationCap, Calendar
} from 'lucide-react'
import type { Homework, HomeworkAttachment, HomeworkSubmission } from '@/types/homework'
import { submitHomeworkClient, deleteSubmissionClient } from '@/lib/homework.client'
import { materialDownloadUrl, formatFileSize } from '@/lib/materials'
import { PageHeader } from '@/components/layout/page-header'
import { useToast } from '@/components/ui/toast-provider'
import { PremiumGate } from '@/components/premium-gate'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

function getInitials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

export function LearnerHomeworkDetail({
  homework,
  attachments,
  submission: initialSubmission,
  gateReason,
  learnerName,
  learnerPhoto,
}: {
  homework: Homework
  attachments: HomeworkAttachment[]
  submission: HomeworkSubmission | null
  gateReason: 'trial_expired' | 'no_plan' | null
  learnerName: string
  learnerPhoto: string | null
}) {
  const router = useRouter()
  const { showToast } = useToast()

  const [textAnswer, setTextAnswer] = useState(initialSubmission?.text_answer ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)

  const dueDate = new Date(homework.due_date)
  const isExpired = dueDate.getTime() < new Date().getTime()

  const isGraded = initialSubmission?.status === 'graded'
  const isSubmitted = initialSubmission?.status === 'submitted' || initialSubmission?.status === 'late'

  const canResubmit = (!initialSubmission || !isGraded)
  const canDelete = !!initialSubmission && !isGraded

  const canUseFiles = gateReason === null

  function promptUpgrade() {
    setGateOpen(true)
  }

  function handleFileAdd(list: FileList | null) {
    if (!canUseFiles) {
      promptUpgrade()
      return
    }
    if (!list) return
    const newFiles = Array.from(list)
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) return showToast(`${f.name} exceeds 5MB limit.`, 'error')
    }
    setFiles(prev => [...prev, ...newFiles])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canUseFiles) {
      promptUpgrade()
      return
    }
    if (!textAnswer.trim() && files.length === 0) {
      return showToast('Please provide a text answer or attach a file.', 'error')
    }

    setBusy(true)
    try {
      await submitHomeworkClient(homework.id, textAnswer, files)
      showToast('Homework submitted successfully!', 'success')
      setFiles([])
      setBusy(false)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit homework'
      showToast(message, 'error')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!initialSubmission) return
    setBusy(true)
    try {
      await deleteSubmissionClient(initialSubmission.id)
      showToast('Submission deleted successfully', 'success')
      setShowDeleteModal(false)
      setBusy(false)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete submission'
      if (message.toLowerCase().includes('not found')) {
        setShowDeleteModal(false)
        setBusy(false)
        router.refresh()
        return
      }
      showToast(message, 'error')
      setShowDeleteModal(false)
      setBusy(false)
    }
  }

  function handleAttachmentClick(e: React.MouseEvent) {
    if (!canUseFiles) {
      e.preventDefault()
      promptUpgrade()
    }
  }

  const headerAction = isGraded ? (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm sm:px-3 sm:text-xs"
      style={{ backgroundColor: 'var(--success-border)' }}
    >
      Graded
    </span>
  ) : isSubmitted ? (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm sm:px-3 sm:text-xs"
      style={{ backgroundColor: 'var(--brand-accent)' }}
    >
      Submitted
    </span>
  ) : null

  return (
    <>
      <PageHeader
        title={homework.title}
        fallbackHref="/learner/homework"
        action={headerAction}
      />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4 sm:p-6 md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Info size={18} style={{ color: 'var(--brand-accent)' }} /> Assignment Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <Avatar
                  size={40}
                  src={homework.teacher_profile_photo}
                  fallback={getInitials(homework.teacher_name?.split(' ')[0], homework.teacher_name?.split(' ')[1])}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground">Teacher</p>
                  <p className="truncate text-sm font-medium text-foreground">Tr. {homework.teacher_name ?? 'Teacher'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground">Subject</p>
                  <p className="truncate text-sm font-medium text-foreground">{homework.subject_name ?? 'General'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground">Class</p>
                  <p className="truncate text-sm font-medium text-foreground">{homework.class_name ?? 'All'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: isExpired ? 'var(--danger-bg)' : 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      color: isExpired ? 'var(--danger-fg)' : 'var(--brand-accent)'
                    }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-muted-foreground">Due Date</p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {isExpired ? (
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                    Overdue
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                    {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-border p-4 sm:p-6 md:p-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
              <AlignLeft size={18} style={{ color: 'var(--brand-accent)' }} /> Description
            </h2>
            <div className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {homework.description || 'No description provided.'}
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="border-b border-border p-4 sm:p-6 md:p-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                <Paperclip size={18} style={{ color: 'var(--brand-accent)' }} /> Homework Files
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {attachments.map(a => (
                  <a
                    key={a.id}
                    href={canUseFiles ? materialDownloadUrl(a.file_path) : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAttachmentClick}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-brand-accent hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                      <Download size={18} style={{ color: 'var(--brand-primary)' }} />
                    </div>
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
            <div className="border-b border-border p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'color-mix(in srgb, var(--success-bg) 30%, transparent)' }}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--success-fg)' }}>
                <Award size={18} /> Grade &amp; Feedback
              </h2>
              <div className="rounded-xl border-2 bg-card p-4 sm:p-6" style={{ borderColor: 'var(--success-border)' }}>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                  <Avatar
                    size={64}
                    src={learnerPhoto}
                    fallback={getInitials(learnerName.split(' ')[0], learnerName.split(' ')[1])}
                  />
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-muted-foreground">Your Score</p>
                    <p className="text-5xl font-extrabold" style={{ color: 'var(--success-fg)' }}>{initialSubmission.grade}%</p>
                  </div>
                </div>

                {initialSubmission.feedback && (
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Teacher&apos;s Comment</p>
                    <p className="whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                      {initialSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {initialSubmission && !isGraded && (
            <div className="border-b border-border p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size={36} src={learnerPhoto} fallback={getInitials(learnerName.split(' ')[0], learnerName.split(' ')[1])} />
                  <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                    <span className="truncate">Your Submission</span>
                  </h2>
                </div>
                {canDelete && (
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 size={13} /> Delete
                  </Button>
                )}
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Submitted on {initialSubmission.submitted_at ? new Date(initialSubmission.submitted_at).toLocaleString() : 'N/A'}
              </p>
              {initialSubmission.text_answer && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">Submitted Response</p>
                  <div className="whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-sm text-foreground">
                    {initialSubmission.text_answer}
                  </div>
                </div>
              )}
              {initialSubmission.files && initialSubmission.files.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Attached Files</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {initialSubmission.files.map(f => (
                      <a
                        key={f.id}
                        href={canUseFiles ? materialDownloadUrl(f.file_path) : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleAttachmentClick}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm transition hover:border-brand-accent"
                      >
                        <FileText size={16} className="shrink-0" style={{ color: 'var(--brand-accent)' }} />
                        <span className="flex-1 truncate font-medium">{f.file_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {canResubmit && (
            <div className="bg-muted p-4 sm:p-6 md:p-8">
              <div className="mb-6 flex min-w-0 items-center gap-3">
                <Avatar size={36} src={learnerPhoto} fallback={getInitials(learnerName.split(' ')[0], learnerName.split(' ')[1])} />
                <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-foreground">
                  <span className="truncate">{initialSubmission ? 'Resubmit Your Work' : 'Submit Your Work'}</span>
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Your Answer</label>
                  <textarea
                    value={textAnswer}
                    onChange={e => setTextAnswer(e.target.value)}
                    rows={4}
                    placeholder="Type your answer here..."
                    className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Attach Files (Max 5MB)</label>
                  <label
                    className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-6 text-center transition hover:border-brand-accent hover:bg-brand-accent/5"
                    onClick={(e) => {
                      if (!canUseFiles) {
                        e.preventDefault()
                        promptUpgrade()
                      }
                    }}
                  >
                    <UploadCloud size={28} className="mb-2 shrink-0" style={{ color: 'var(--brand-accent)' }} />
                    <span className="text-sm font-medium text-foreground">Click or drag files here</span>
                    <span className="mt-1 text-xs text-muted-foreground">Max 5MB per file</span>
                    <input type="file" multiple onChange={e => handleFileAdd(e.target.files)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f, i) => (
                        <li key={i} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                          <span className="truncate">{f.name}</span>
                          <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="shrink-0 transition hover:opacity-70" style={{ color: 'var(--danger-fg)' }}>
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {isExpired && (
                  <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>This assignment is past its due date. Late submissions may incur penalties.</p>
                  </div>
                )}
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? 'Submitting...' : initialSubmission ? 'Resubmit Homework' : 'Submit Homework'}
                </Button>
              </form>
            </div>
          )}
        </Card>

        <ConfirmDialog
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title="Delete Submission"
          description="Are you sure you want to delete your submission? This action cannot be undone and you will need to submit your work again."
          confirmLabel="Delete"
          destructive
          loading={busy}
          onConfirm={handleDelete}
        />

        {gateReason && (
          <PremiumGate
            open={gateOpen}
            context="homework"
            reason={gateReason}
            onDismiss={() => setGateOpen(false)}
          />
        )}
      </div>
    </>
  )
}