'use client'

import { useEffect, useState } from 'react'
import { FileQuestion, Loader2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import {
  addQuestionClient,
  deleteQuestionClient,
  listQuestionsClient,
} from '@/lib/quiz.client'
import { useBranding } from '@/components/brand/brand-provider'
import type { Quiz, QuizQuestion } from '@/types/quiz'
import { QuestionFormModal } from './question-form-modal'

export function QuizQuestionsModal({
  open,
  onOpenChange,
  quiz,
  canEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz | null
  canEdit: boolean
}) {
  const branding = useBranding()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !quiz) return
    setLoading(true)
    setError(null)
    listQuestionsClient(quiz.id)
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, quiz])

  async function handleAdd(values: {
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: 'A' | 'B' | 'C' | 'D' | ''
    points: number
    explanation: string
  }) {
    if (!quiz) return
    const created = await addQuestionClient(quiz.id, {
      question: values.question.trim(),
      option_a: values.option_a.trim() || undefined,
      option_b: values.option_b.trim() || undefined,
      option_c: values.option_c.trim() || undefined,
      option_d: values.option_d.trim() || undefined,
      correct_answer: values.correct_answer || undefined,
      points: values.points,
      explanation: values.explanation.trim() || undefined,
    })
    setQuestions((list) => [...list, created])
  }

  async function handleDelete(id: number) {
    if (!quiz) return
    setDeleting(id)
    try {
      await deleteQuestionClient(quiz.id, id)
      setQuestions((list) => list.filter((q) => q.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Questions</DialogTitle>
            <DialogDescription>
              {quiz ? `For "${quiz.title}"` : ''}
            </DialogDescription>
          </DialogHeader>

          {canEdit && quiz && (
            <div>
              <Button
                onClick={() => setAddOpen(true)}
                style={{ backgroundColor: branding.colorPrimary }}
              >
                <Plus size={14} />
                Add question
              </Button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="No questions yet"
              description={
                canEdit
                  ? 'Add your first question to build the quiz.'
                  : 'This quiz has no questions yet.'
              }
            />
          ) : (
            <ul className="space-y-3">
              {questions.map((q, idx) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Q{idx + 1}
                        </span>
                        <Badge tone="info">{q.points} pt{q.points === 1 ? '' : 's'}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium">{q.question}</p>
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                        {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                          const text = q[`option_${letter.toLowerCase()}` as keyof QuizQuestion] as
                            | string
                            | undefined
                          if (!text) return null
                          const isCorrect = q.correct_answer === letter
                          return (
                            <div
                              key={letter}
                              className={`flex items-center gap-2 ${
                                isCorrect ? 'font-semibold text-brand-accent' : ''
                              }`}
                            >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                                {letter}
                              </span>
                              <span>{text}</span>
                              {isCorrect && <span className="ml-1">(correct)</span>}
                            </div>
                          )
                        })}
                      </div>
                      {q.explanation && (
                        <p className="mt-2 rounded bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                          {q.explanation}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        disabled={deleting === q.id}
                        className="rounded p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label="Delete question"
                      >
                        {deleting === q.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {quiz && (
        <QuestionFormModal
          open={addOpen}
          onOpenChange={setAddOpen}
          quizTitle={quiz.title}
          onSubmit={handleAdd}
        />
      )}
    </>
  )
}