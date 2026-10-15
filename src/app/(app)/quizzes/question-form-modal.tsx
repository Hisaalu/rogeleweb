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
import type { CreateQuestionPayload, QuizQuestion } from '@/types/quiz'

export interface QuestionFormValues {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D' | ''
  points: number
  explanation: string
}

const EMPTY: QuestionFormValues = {
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: '',
  points: 1,
  explanation: '',
}

function fromQuestion(q: QuizQuestion): QuestionFormValues {
  return {
    question: q.question,
    option_a: q.option_a ?? '',
    option_b: q.option_b ?? '',
    option_c: q.option_c ?? '',
    option_d: q.option_d ?? '',
    correct_answer: (q.correct_answer as QuestionFormValues['correct_answer']) ?? '',
    points: q.points ?? 1,
    explanation: q.explanation ?? '',
  }
}

export function QuestionFormModal({
  open,
  onOpenChange,
  quizTitle,
  question,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizTitle: string
  question?: QuizQuestion | null
  onSubmit: (values: QuestionFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<QuestionFormValues>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(question ? fromQuestion(question) : EMPTY)
    setError(null)
  }, [question, open])

  function set<K extends keyof QuestionFormValues>(
    key: K,
    value: QuestionFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.question.trim()) {
      setError('Question text is required')
      return
    }
    if (!values.option_a.trim()) {
      setError('Option A is required')
      return
    }
    if (!values.option_b.trim()) {
      setError('Option B is required')
      return
    }
    if (!values.correct_answer) {
      setError('Pick the correct answer (A, B, C, or D)')
      return
    }
    const correct = values.correct_answer.toLowerCase() as 'a' | 'b' | 'c' | 'd'
    const requiredOption =
      correct === 'a'
        ? values.option_a
        : correct === 'b'
          ? values.option_b
          : correct === 'c'
            ? values.option_c
            : values.option_d
    if (!requiredOption.trim()) {
      setError(`Option ${values.correct_answer} is the correct answer but is empty`)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add question to "{quizTitle}"</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={values.question}
              onChange={(e) => set('question', e.target.value)}
              placeholder="What is 2 + 2?"
              rows={2}
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="space-y-3">
            <Label>Options</Label>

            <OptionRow
              letter="A"
              value={values.option_a}
              onChange={(v) => set('option_a', v)}
              isCorrect={values.correct_answer === 'A'}
              onSelectCorrect={() => set('correct_answer', 'A')}
              disabled={submitting}
            />
            <OptionRow
              letter="B"
              value={values.option_b}
              onChange={(v) => set('option_b', v)}
              isCorrect={values.correct_answer === 'B'}
              onSelectCorrect={() => set('correct_answer', 'B')}
              disabled={submitting}
            />
            <OptionRow
              letter="C"
              value={values.option_c}
              onChange={(v) => set('option_c', v)}
              isCorrect={values.correct_answer === 'C'}
              onSelectCorrect={() => set('correct_answer', 'C')}
              disabled={submitting}
            />
            <OptionRow
              letter="D"
              value={values.option_d}
              onChange={(v) => set('option_d', v)}
              isCorrect={values.correct_answer === 'D'}
              onSelectCorrect={() => set('correct_answer', 'D')}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min={1}
                value={values.points}
                onChange={(e) => set('points', Number(e.target.value) || 1)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Correct answer</Label>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm">
                {values.correct_answer ? (
                  <span className="font-semibold text-brand-accent">
                    Option {values.correct_answer}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Click a radio next to an option
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea
              id="explanation"
              value={values.explanation}
              onChange={(e) => set('explanation', e.target.value)}
              placeholder="Shown to the learner after the quiz, if applicable."
              rows={3}
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
              {question ? 'Save question' : 'Add question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OptionRow({
  letter,
  value,
  onChange,
  isCorrect,
  onSelectCorrect,
  disabled,
}: {
  letter: 'A' | 'B' | 'C' | 'D'
  value: string
  onChange: (v: string) => void
  isCorrect: boolean
  onSelectCorrect: () => void
  disabled?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${
        isCorrect ? 'border-brand-accent bg-brand-accent/5' : 'border-input'
      }`}
    >
      <button
        type="button"
        onClick={onSelectCorrect}
        disabled={disabled}
        aria-label={`Mark option ${letter} as correct`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
          isCorrect
            ? 'border-brand-accent bg-brand-accent text-white'
            : 'border-input text-muted-foreground hover:border-brand-accent'
        } disabled:cursor-not-allowed`}
      >
        {letter}
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${letter}`}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}