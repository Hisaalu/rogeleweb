'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { gradeSubmissionClient } from '@/lib/homework.client'
import type { HomeworkSubmission } from '@/types/homework'

export function GradeSubmissionModal({
  open,
  onOpenChange,
  submission,
  onGraded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: HomeworkSubmission | null
  onGraded: (updated: HomeworkSubmission) => void
}) {
  const [grade, setGrade] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade !== undefined && submission.grade !== null ? String(submission.grade) : '')
      setFeedback(submission.feedback ?? '')
      setError(null)
    }
  }, [submission, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!submission) return
    setError(null)

    const n = Number(grade)
    if (Number.isNaN(n) || n < 0 || n > 100) {
      setError('Grade must be a number between 0 and 100')
      return
    }

    setSubmitting(true)
    try {
      const updated = await gradeSubmissionClient(submission.id, n, feedback)
      onGraded(updated)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Grade submission</DialogTitle>
        </DialogHeader>

        {submission?.text_answer && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">Learner's answer</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{submission.text_answer}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="grade">Grade (0 - 100)</Label>
            <Input
              id="grade"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="feedback">Feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Comments for the learner..."
              rows={4}
              disabled={submitting}
            />
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
              Save grade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}