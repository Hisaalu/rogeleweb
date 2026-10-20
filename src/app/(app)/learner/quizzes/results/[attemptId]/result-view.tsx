'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, Trophy, BookOpen } from 'lucide-react'
import type { QuizResultDetails } from '@/types/quiz'

export function ResultView({ attempt }: { attempt: QuizResultDetails }) {
  const passed = (attempt.score ?? 0) >= (attempt.passing_score ?? 70)
  const score = attempt.score ?? 0
  const correct = attempt.correct_answers ?? 0
  const total = attempt.total_questions ?? 0
  const incorrect = Math.max(0, total - correct)
  
  const timeFormatted = attempt.time_taken 
    ? `${Math.floor(attempt.time_taken / 60).toString().padStart(2, '0')}:${(attempt.time_taken % 60).toString().padStart(2, '0')}`
    : '00:00'

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
          passed ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-red-100 dark:bg-red-950/50'
        }`}>
          {passed ? (
            <Trophy size={40} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle size={40} className="text-red-600 dark:text-red-400" />
          )}
        </div>

        <div className="mb-2 flex items-center justify-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-bold tracking-wide text-white ${
            passed ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {passed ? 'PASSED' : 'FAILED'}
          </span>
          <span className="text-sm font-medium text-muted-foreground">Pass Mark: {attempt.passing_score ?? 70}%</span>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {passed ? 'Congratulations!' : 'Better Luck Next Time!'}
        </h1>
        <p className="text-muted-foreground">
          You scored {correct} out of {total} questions correctly.
        </p>

        <div className="relative mx-auto my-8 h-40 w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="45" className="stroke-muted stroke-[8px] fill-none" />
            <circle 
              cx="50" cy="50" r="45" 
              className={`fill-none stroke-[8px] stroke-linecap-round ${
                passed ? 'stroke-emerald-500' : 'stroke-red-500'
              }`}
              strokeDasharray="283" 
              strokeDashoffset={283 - (score / 100) * 283} 
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-foreground">{score}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
          <div>
            <div className="mb-1 text-xl font-bold text-emerald-500">{correct}</div>
            <div className="text-xs font-medium text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="mb-1 text-xl font-bold text-red-500">{incorrect}</div>
            <div className="text-xs font-medium text-muted-foreground">Incorrect</div>
          </div>
          <div>
            <div className="mb-1 text-xl font-bold text-amber-500">{timeFormatted}</div>
            <div className="text-xs font-medium text-muted-foreground">Time Taken</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-2 text-xl font-bold text-foreground">Review & Corrections</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Review your answers below. Corrections are highlighted in green.
        </p>

        <div className="space-y-6">
          {(attempt.questions || []).map((q, idx) => {
            const userAnswerStr = attempt.user_answers?.[q.id.toString()]
            const userAnswer = userAnswerStr !== undefined ? Number(userAnswerStr) : null
            const isCorrect = userAnswer === q.correct_option
            
            return (
              <div 
                key={q.id} 
                className={`rounded-2xl border-l-4 bg-muted/30 p-5 ${
                  isCorrect ? 'border-emerald-500' : 'border-red-500'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">Question {idx + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{q.points} point(s)</span>
                </div>

                <div className="mb-4 text-base font-semibold text-foreground">{q.question_text}</div>

                <div className="mb-4 space-y-2">
                  {(q.options || []).map((opt, optIdx) => {
                    const isAns = optIdx === q.correct_option
                    const isUser = optIdx === userAnswer
                    
                    let cls = 'border-border bg-background'
                    if (isAns) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    else if (isUser) cls = 'border-red-500 bg-red-50 dark:bg-red-950/30'

                    return (
                      <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-3 ${cls}`}>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isAns ? 'bg-emerald-500 text-white' : isUser ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </div>
                        <span className="flex-1 text-sm text-foreground">{opt}</span>
                        {isAns && <span className="text-xs font-bold text-emerald-600">Correct Answer</span>}
                        {isUser && !isAns && <span className="text-xs font-bold text-red-600">Your Answer</span>}
                      </div>
                    )
                  })}
                </div>

                {q.explanation && (
                  <div className="rounded-xl border-l-2 border-amber-500 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong className="mb-1 block">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/learner/quizzes" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-primary px-6 py-2.5 text-sm font-bold text-brand-primary transition hover:bg-brand-primary hover:text-white">
            Try Another Quiz
          </Link>
          <Link href="/learner/lessons" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
            <BookOpen size={16} /> Continue Learning
          </Link>
        </div>
      </div>
    </div>
  )
}