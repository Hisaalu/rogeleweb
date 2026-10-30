'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import type { Quiz, QuizQuestion, QuizAttempt } from '@/types/quiz'
import {
  startAttemptClient,
  submitAttemptClient,
  saveAnswerClient,
  getAttemptClient,
} from '@/lib/quizzes.client'
import { useToast } from '@/components/ui/toast-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function computeSecondsLeft(
  attempt: QuizAttempt,
  timeLimitMinutes: number,
): number {
  const totalSeconds = timeLimitMinutes * 60
  const startedAt = new Date(attempt.started_at).getTime()
  if (!Number.isFinite(startedAt)) return totalSeconds
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - startedAt) / 1000),
  )
  return Math.max(0, Math.min(totalSeconds, totalSeconds - elapsedSeconds))
}

export function TakeQuizView({
  quiz,
  questions,
}: {
  quiz: Quiz
  questions: QuizQuestion[]
}) {
  const router = useRouter()
  const { showToast } = useToast()

  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState((quiz.time_limit ?? 30) * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const hasAutoSubmitted = useRef(false)
  const hasFetchedAttempt = useRef(false)
  const attemptStorageKey = `quiz_attempt_${quiz.id}`
  const answerStorageKey = `quiz_answers_${quiz.id}`

  const flushPendingSaves = useCallback(() => {
    Object.values(saveTimers.current).forEach(clearTimeout)
    saveTimers.current = {}
  }, [])

  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId || isSubmitting || hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    setIsSubmitting(true)
    flushPendingSaves()

    showToast('Time is up! Submitting your answers...', 'info')

    try {
      await submitAttemptClient(attemptId, answers)
      localStorage.removeItem(answerStorageKey)
      localStorage.removeItem(attemptStorageKey)
      router.refresh()
      router.push(`/learner/quizzes/results/${attemptId}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Auto-submit failed.'
      setError(message)
      showToast(message, 'error')
      setIsSubmitting(false)
    }
  }, [
    attemptId,
    answers,
    isSubmitting,
    router,
    showToast,
    answerStorageKey,
    attemptStorageKey,
    flushPendingSaves,
  ])

  useEffect(() => {
    if (initialized) return
    setInitialized(true)
    if (hasFetchedAttempt.current) return
    hasFetchedAttempt.current = true

    const savedAttemptRaw = localStorage.getItem(attemptStorageKey)
    const savedAttemptId = savedAttemptRaw ? Number(savedAttemptRaw) : null

    const savedAnswersRaw = localStorage.getItem(answerStorageKey)
    let localAnswers: Record<string, number> = {}
    if (savedAnswersRaw) {
      try {
        localAnswers = JSON.parse(savedAnswersRaw) as Record<string, number>
      } catch {
        localAnswers = {}
      }
    }

    async function bootstrap() {
      try {
        let attempt: QuizAttempt | null = null
        let serverAnswers: Record<string, number> = {}

        if (savedAttemptId && Number.isFinite(savedAttemptId)) {
          const existing = await getAttemptClient(savedAttemptId)
          if (existing && existing.status === 'in_progress') {
            attempt = existing
          }
        }

        if (!attempt) {
          const res = await startAttemptClient(quiz.id)
          attempt = res
          serverAnswers = res.saved_answers ?? {}
        }

        setAttemptId(attempt.id)
        localStorage.setItem(attemptStorageKey, String(attempt.id))
        setAnswers({ ...serverAnswers, ...localAnswers })
        setTimeLeft(computeSecondsLeft(attempt, quiz.time_limit ?? 30))
        setLoading(false)
      } catch (err) {
        const e = err as Error & { code?: string; status?: number }
        const msg = e.message || 'Could not start quiz attempt.'

        if (msg.includes('attempts')) {
          showToast(msg, 'error')
          router.push('/learner/quizzes')
          return
        }

        setError(msg)
        setLoading(false)
      }
    }

    bootstrap()
  }, [
    quiz.id,
    quiz.time_limit,
    initialized,
    router,
    showToast,
    attemptStorageKey,
    answerStorageKey,
  ])

  useEffect(() => {
    if (loading || isSubmitting || timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading, isSubmitting, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && !loading && !isSubmitting && !hasAutoSubmitted.current) {
      handleAutoSubmit()
    }
  }, [timeLeft, loading, isSubmitting, handleAutoSubmit])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(answerStorageKey, JSON.stringify(answers))
    }
  }, [answers, loading, answerStorageKey])

  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(clearTimeout)
      saveTimers.current = {}
    }
  }, [])

  const answeredCount = Object.keys(answers).length

  async function handleSelectOption(qId: number, optIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }))

    if (!attemptId) return

    const existing = saveTimers.current[qId]
    if (existing) clearTimeout(existing)

    saveTimers.current[qId] = setTimeout(async () => {
      delete saveTimers.current[qId]
      try {
        await saveAnswerClient(attemptId, qId, optIdx)
      } catch {
        showToast('Saved locally. Will sync on submit.', 'info')
      }
    }, 500)
  }

  async function handleManualSubmit() {
    if (!attemptId || isSubmitting) return
    setIsSubmitting(true)
    flushPendingSaves()
    try {
      await submitAttemptClient(attemptId, answers)
      localStorage.removeItem(answerStorageKey)
      localStorage.removeItem(attemptStorageKey)
      showToast('Quiz submitted successfully!', 'success')
      router.refresh()
      router.push(`/learner/quizzes/results/${attemptId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed.'
      setError(message)
      showToast(message, 'error')
      setIsSubmitting(false)
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2
          className="animate-spin"
          size={32}
          style={{ color: 'var(--brand-accent)' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-10 text-center font-medium"
        style={{ color: 'var(--danger-fg)' }}
      >
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div
        className="sticky top-0 z-40 flex items-center justify-between rounded-md px-5 py-3 text-white shadow-lg"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Clock size={20} />
          <span
            className={`font-mono text-xl ${
              timeLeft < 60 ? 'animate-pulse' : ''
            }`}
            style={{ color: timeLeft < 60 ? 'var(--danger-fg)' : 'white' }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={20} />
          <span>
            {answeredCount} of {questions.length} Answered
          </span>
        </div>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>

        <div
          className="mt-4 flex items-start gap-3 rounded-md border-l-4 p-4"
          style={{
            borderLeftColor: 'var(--warning-border)',
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning-fg)',
          }}
        >
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <strong className="block text-sm">Important Notice:</strong>
            <p className="text-sm opacity-90">
              Your answers are saved automatically. Refreshing or changing
              pages will not lose them.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Question {idx + 1} of {questions.length}
            </div>
            <div className="mb-5 text-base font-semibold text-foreground">
              {q.question_text}
            </div>

            <div className="space-y-3">
              {(q.options || []).map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx
                return (
                  <label
                    key={optIdx}
                    className="flex cursor-pointer items-center gap-3 rounded-md border-2 p-3 transition-all"
                    style={{
                      borderColor: isSelected
                        ? 'var(--brand-accent)'
                        : 'hsl(var(--border))',
                      backgroundColor: isSelected
                        ? 'color-mix(in srgb, var(--brand-accent) 5%, transparent)'
                        : 'hsl(var(--background))',
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleSelectOption(q.id, optIdx)}
                    />
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                      style={{
                        borderColor: isSelected
                          ? 'var(--brand-accent)'
                          : 'hsl(var(--muted-foreground))',
                        backgroundColor: isSelected
                          ? 'var(--brand-accent)'
                          : 'transparent',
                        color: isSelected
                          ? 'white'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {opt}
                    </span>
                  </label>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center pt-6 pb-20">
        <Button
          onClick={handleManualSubmit}
          disabled={isSubmitting || answeredCount !== questions.length}
          className="h-12 rounded-full px-10 text-base"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin mr-2" />
          ) : (
            <CheckCircle2 size={20} className="mr-2" />
          )}
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  )
}