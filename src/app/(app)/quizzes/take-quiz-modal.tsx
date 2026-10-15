'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBranding } from '@/components/brand/brand-provider'
import {
  listQuestionsClient,
  startQuizAttemptClient,
  submitQuizAttemptClient,
} from '@/lib/quiz.client'
import type {
  AnswerInput,
  Quiz,
  QuizAttempt,
  QuizQuestion,
} from '@/types/quiz'

interface AnswerMap {
  [questionId: number]: number
}

const LETTERS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']

export function TakeQuizModal({
  open,
  onOpenChange,
  quiz,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz | null
  onCompleted?: (attempt: QuizAttempt) => void
}) {
  const branding = useBranding()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizAttempt | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [expiredNotice, setExpiredNotice] = useState(false)

  const submittedRef = useRef(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!open || !quiz) return
    submittedRef.current = false
    setLoading(true)
    setError(null)
    setAnswers({})
    setResult(null)
    setAttempt(null)
    setQuestions([])
    setRemaining(null)
    setExpiredNotice(false)

    Promise.all([
      listQuestionsClient(quiz.id),
      startQuizAttemptClient(quiz.id),
    ])
      .then(([questionsList, startedAttempt]) => {
        setQuestions(questionsList)
        setAttempt(startedAttempt)

        if (startedAttempt.status === 'completed') {
          setResult(startedAttempt)
          submittedRef.current = true
          return
        }

        if (quiz.time_limit && quiz.time_limit > 0) {
          const startedMs = new Date(startedAttempt.started_at).getTime()
          const deadlineMs = startedMs + quiz.time_limit * 60 * 1000
          const secondsLeft = Math.max(
            0,
            Math.floor((deadlineMs - Date.now()) / 1000),
          )
          setRemaining(secondsLeft)
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load quiz'))
      .finally(() => setLoading(false))
  }, [open, quiz])

  useEffect(() => {
    if (!open || remaining === null) return
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null
        const next = prev - 1
        if (next <= 0 && !submittedRef.current && attempt) {
          submittedRef.current = true
          setExpiredNotice(true)
          void autoSubmit(attempt.id)
        }
        return Math.max(0, next)
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [open, remaining !== null, attempt?.id])

  async function autoSubmit(attemptId: number) {
    try {
      const payload = buildAnswerPayload()
      const final = await submitQuizAttemptClient(attemptId, payload)
      setResult(final)
      onCompleted?.(final)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attempt')
    }
  }

  function buildAnswerPayload(): AnswerInput[] {
    return questions.map((q) => ({
      question_id: q.id,
      selected_answer: answers[q.id] ?? undefined,
    }))
  }

  async function handleSubmit() {
    if (!attempt) return
    setSubmitting(true)
    setError(null)
    try {
      const final = await submitQuizAttemptClient(attempt.id, buildAnswerPayload())
      submittedRef.current = true
      setResult(final)
      onCompleted?.(final)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attempt')
    } finally {
      setSubmitting(false)
      setConfirmSubmit(false)
    }
  }

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  )

  const totalQuestions = questions.length

  const formattedTime = useMemo(() => {
    if (remaining === null) return null
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [remaining])

  const timeIsLow = remaining !== null && remaining <= 60

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <DialogTitle>{quiz?.title ?? 'Quiz'}</DialogTitle>
                {quiz?.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                )}
              </div>

              {formattedTime && !result && (
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
                    timeIsLow
                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                      : 'border-border bg-muted/40 text-foreground'
                  }`}
                >
                  <Clock size={14} />
                  {formattedTime}
                </div>
              )}
            </div>
          </DialogHeader>

          {expiredNotice && !result && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Time is up. Your answers have been submitted automatically.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Loading quiz...
            </div>
          ) : result ? (
            <ResultView
              attempt={result}
              passingScore={quiz?.passing_score ?? 50}
            />
          ) : totalQuestions === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <AlertCircle size={24} className="text-amber-500" />
              <p className="text-sm text-muted-foreground">
                This quiz has no questions yet. Check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Answered {answeredCount} of {totalQuestions}
                </span>
                <span className="text-muted-foreground">
                  {quiz?.passing_score ?? 50}% to pass
                </span>
              </div>

              <ol className="space-y-4">
                {questions.map((q, idx) => (
                  <li
                    key={q.id}
                    className="rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="mb-3 flex items-start gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Q{idx + 1}
                      </span>
                      <p className="flex-1 text-sm font-medium">{q.question}</p>
                    </div>

                    <div className="grid gap-2">
                      {LETTERS.map((letter, optionIndex) => {
                        const text = (q[
                          `option_${letter.toLowerCase()}` as keyof QuizQuestion
                        ] ?? '') as string
                        if (!text) return null

                        const selected = answers[q.id] === optionIndex

                        return (
                          <label
                            key={letter}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                              selected
                                ? 'border-brand-accent bg-brand-accent/5'
                                : 'border-input hover:border-brand-accent/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={selected}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
                              }
                              disabled={submitting}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                                selected
                                  ? 'border-brand-accent bg-brand-accent text-white'
                                  : 'border-input text-muted-foreground'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="flex-1">{text}</span>
                          </label>
                        )
                      })}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          <DialogFooter>
            {!result && totalQuestions > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  {answeredCount === 0 ? 'Close' : 'Save & close'}
                </Button>
                <Button
                  onClick={() => setConfirmSubmit(true)}
                  disabled={submitting}
                  style={{ backgroundColor: branding.colorPrimary }}
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {submitting ? 'Submitting...' : 'Submit attempt'}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title="Submit attempt"
        description={
          answeredCount < totalQuestions
            ? `You've answered ${answeredCount} of ${totalQuestions} questions. Unanswered questions will be counted as incorrect. Submit anyway?`
            : 'Submit your answers? You cannot change them after submitting.'
        }
        confirmLabel="Submit"
        onConfirm={handleSubmit}
      />
    </>
  )
}

function ResultView({
  attempt,
  passingScore,
}: {
  attempt: QuizAttempt
  passingScore: number
}) {
  const score = attempt.score ?? 0
  const passed = score >= passingScore
  const total = attempt.total_questions ?? 0
  const correct = attempt.correct_answers ?? 0

  return (
    <div className="space-y-4 py-4 text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        {passed ? (
          <CheckCircle2 size={32} className="text-green-600" />
        ) : (
          <AlertCircle size={32} className="text-red-600" />
        )}
      </div>
      <h3 className="text-xl font-semibold">
        {passed ? 'Passed' : 'Not quite yet'}
      </h3>
      <p className="text-sm text-muted-foreground">
        You answered <strong>{correct}</strong> of <strong>{total}</strong> questions
        correctly.
      </p>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3 pt-2">
        <Stat label="Score" value={`${score}%`} />
        <Stat label="To pass" value={`${passingScore}%`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}