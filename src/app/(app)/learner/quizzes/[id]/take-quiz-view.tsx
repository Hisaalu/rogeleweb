'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Quiz, QuizQuestion } from '@/types/quiz'
import { startAttemptClient, submitAttemptClient } from '@/lib/quizzes.client'

export function TakeQuizView({ quiz, questions }: { quiz: Quiz, questions: QuizQuestion[] }) {
  const router = useRouter()
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState((quiz.time_limit ?? 30) * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const storageKey = `quiz_state_${quiz.id}`

  useEffect(() => {
    if (initialized) return
    setInitialized(true)

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnswers(parsed.answers || {})
        if (parsed.endTime) {
          const remaining = Math.max(0, Math.floor((parsed.endTime - Date.now()) / 1000))
          setTimeLeft(remaining)
        }
      } catch (e) {}
    }

    startAttemptClient(quiz.id)
      .then(res => {
        setAttemptId(res.id)
        setLoading(false)
      })
      .catch((err: any) => {
        setError(err.message || 'Could not start quiz attempt.')
        setLoading(false)
      })
  }, [quiz.id, storageKey, initialized])

  useEffect(() => {
    if (loading || isSubmitting) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return next
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading, isSubmitting])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(storageKey, JSON.stringify({
        answers,
        endTime: Date.now() + timeLeft * 1000
      }))
    }
  }, [answers, timeLeft, loading, storageKey])

  const answeredCount = Object.keys(answers).length

  async function handleAutoSubmit() {
    if (!attemptId || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitAttemptClient(attemptId, answers)
      localStorage.removeItem(storageKey)
      router.push(`/learner/quizzes/results/${attemptId}`)
    } catch {
      setError('Auto-submit failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  async function handleManualSubmit() {
    if (!attemptId || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitAttemptClient(attemptId, answers)
      localStorage.removeItem(storageKey)
      router.push(`/learner/quizzes/results/${attemptId}`)
    } catch {
      setError('Submission failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="p-10 text-center text-muted-foreground">Preparing your quiz...</div>
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="sticky top-0 z-40 flex items-center justify-between rounded-2xl bg-brand-primary px-5 py-3 text-white shadow-lg">
        <div className="flex items-center gap-2 font-semibold">
          <Clock size={20} />
          <span className={`font-mono text-xl ${timeLeft < 60 ? 'text-red-300 animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={20} />
          <span>{answeredCount} of {questions.length} Answered</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
        
        <div className="mt-4 flex items-start gap-3 rounded-xl border-l-4 border-brand-accent bg-warning-bg p-4 text-warning-fg">
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <strong className="block text-sm">Important Notice:</strong>
            <p className="text-sm opacity-90">Your answers are saved automatically. Do NOT refresh or close the browser.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-brand-accent/50">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Question {idx + 1} of {questions.length}
            </div>
            <div className="mb-5 text-base font-semibold text-foreground">{q.question_text}</div>
            
            <div className="space-y-3">
              {(q.options || []).map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx
                return (
                  <label 
                    key={optIdx} 
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      isSelected 
                        ? 'border-brand-accent bg-brand-accent/5' 
                        : 'border-border bg-background hover:border-brand-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      className="hidden"
                      checked={isSelected}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    />
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      isSelected ? 'border-brand-accent bg-brand-accent text-white' : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{opt}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center pt-6 pb-20">
        <button
          onClick={handleManualSubmit}
          disabled={isSubmitting || answeredCount !== questions.length}
          className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <CheckCircle2 size={20} />
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  )
}