'use client'

import { useEffect, useState } from 'react'
import { File as FileIcon, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { listSubmissionsClient } from '@/lib/homework.client'
import { formatDate } from '@/lib/utils'
import type { Homework, HomeworkSubmission } from '@/types/homework'
import { ClipboardList } from 'lucide-react'

export function HomeworkSubmissionsModal({
  open,
  onOpenChange,
  homework,
  onGrade,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  homework: Homework | null
  onGrade: (submission: HomeworkSubmission) => void
}) {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !homework) return
    setLoading(true)
    setError(null)
    listSubmissionsClient(homework.id)
      .then(setSubmissions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, homework])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Submissions</DialogTitle>
          <DialogDescription>
            {homework ? `For "${homework.title}"` : ''}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No submissions yet"
            description="Learners haven't submitted this homework yet."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {submissions.map((s) => {
              const dueDate = homework ? new Date(homework.due_date) : null
              const submittedAt = s.submitted_at ? new Date(s.submitted_at) : null
              const isLate = dueDate && submittedAt && submittedAt > dueDate

              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Student #{s.student_id}
                      </span>
                      {s.status === 'graded' ? (
                        <Badge tone="success">Graded</Badge>
                      ) : isLate ? (
                        <Badge tone="warning">Late</Badge>
                      ) : (
                        <Badge tone="info">Submitted</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {s.submitted_at
                        ? `Submitted ${formatDate(s.submitted_at)}`
                        : 'Not submitted'}
                      {s.grade !== undefined && s.grade !== null && (
                        <> · Grade: {s.grade}</>
                      )}
                    </div>
                    {s.text_answer && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {s.text_answer}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={s.status === 'graded' ? 'outline' : 'primary'}
                    onClick={() => onGrade(s)}
                  >
                    {s.status === 'graded' ? 'Edit grade' : 'Grade'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SubmissionFilesHint() {
  return <FileIcon size={14} />
}