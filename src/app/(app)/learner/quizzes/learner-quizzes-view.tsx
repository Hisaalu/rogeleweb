'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import {
  HelpCircle,
  Clock,
  Trophy,
  Play,
  BarChart2,
  CheckCircle2,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Quiz, QuizAttempt, QuizListMeta } from '@/types/quiz'

export function LearnerQuizzesView({
  quizzes,
  attempts,
  meta,
  currentPage,
}: {
  quizzes: Quiz[]
  attempts: QuizAttempt[]
  meta: QuizListMeta
  currentPage: number
}) {
  const pathname = usePathname()
  const params = useSearchParams()

  const visibleQuizzes = quizzes.filter((q) => (q.question_count ?? 0) > 0)
  const now = new Date()

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams(params.toString())
    if (targetPage > 1) sp.set('page', String(targetPage))
    else sp.delete('page')
    const qs = sp.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < meta.last_page

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Practice Quizzes
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Test your knowledge with timed quizzes
        </p>
      </div>

      {visibleQuizzes.length === 0 ? (
        <Card className="px-4 py-12 text-center sm:px-6 sm:py-16">
          <HelpCircle
            size={40}
            className="mx-auto mb-3 opacity-30 sm:mb-4 sm:size-12"
            style={{ color: 'var(--brand-accent)' }}
          />
          <h3 className="text-base font-bold text-foreground sm:text-lg">
            No Quizzes Available
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
            Check back later for new quizzes!
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleQuizzes.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.quiz_id === quiz.id)
              const completedAttempts = quizAttempts.filter(
                (a) => a.status === 'completed',
              )
              const attemptCount = completedAttempts.length
              const inProgressAttempt = quizAttempts.find(
                (a) => a.status === 'in_progress',
              )

              const maxAttempts = quiz.max_attempts ?? 3
              const remainingAttempts = Math.max(0, maxAttempts - attemptCount)
              const noAttemptsLeft = remainingAttempts === 0

              const bestScore = completedAttempts.reduce(
                (max, a) => Math.max(max, a.score ?? 0),
                0,
              )
              const passingScore = quiz.passing_score ?? 70
              const passed = bestScore >= passingScore

              const latestCompletedId =
                completedAttempts.length > 0
                  ? [...completedAttempts].sort(
                      (a, b) =>
                        new Date(b.started_at).getTime() -
                        new Date(a.started_at).getTime(),
                    )[0].id
                  : null

              const deadlineDate = quiz.end_date ? new Date(quiz.end_date) : null
              const isPastDeadline = deadlineDate ? deadlineDate < now : false

              let deadlineText = null
              if (deadlineDate) {
                const formattedDateTime = deadlineDate.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
                deadlineText = isPastDeadline 
                  ? `${formattedDateTime}` 
                  : `${formattedDateTime}`
              }

              return (
                <Card
                  key={quiz.id}
                  className={`relative flex flex-col p-4 transition hover:-translate-y-1 hover:shadow-md sm:p-5 ${
                    inProgressAttempt || noAttemptsLeft
                      ? 'border-warning-border bg-warning-bg/30'
                      : 'border-border'
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                          color: 'var(--brand-primary)',
                        }}
                      >
                        {quiz.subject_name ?? 'General'}
                      </span>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                          color: 'var(--brand-accent)',
                        }}
                      >
                        {quiz.class_name ?? 'All Levels'}
                      </span>
                    </div>
                    
                    {deadlineText && (
                      <span className={`flex items-center gap-1 text-[10px] font-medium sm:text-[11px] ${
                        isPastDeadline ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        <Calendar 
                          size={12} 
                          className="shrink-0"
                          style={{ color: isPastDeadline ? 'var(--muted-foreground)' : 'var(--brand-accent)' }} 
                        />
                        {deadlineText}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1.5 text-base font-bold text-foreground sm:mb-2 sm:text-lg">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="mb-3 line-clamp-2 flex-grow text-xs text-muted-foreground sm:mb-4 sm:text-sm">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground sm:mb-4 sm:gap-x-4 sm:gap-y-2 sm:text-xs">
                    <span className="flex items-center gap-1">
                      <HelpCircle
                        size={12}
                        className="shrink-0 sm:size-3.5"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      {quiz.question_count ?? 0} qns
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock
                        size={12}
                        className="shrink-0 sm:size-3.5"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      {quiz.time_limit ?? 30}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy
                        size={12}
                        className="shrink-0 sm:size-3.5"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      {passingScore}% pass
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCw
                        size={12}
                        className="shrink-0 sm:size-3.5"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      {attemptCount}/{maxAttempts} attempts
                    </span>
                  </div>

                  {completedAttempts.length > 0 && (
                    <div className="mb-3 border-y border-border py-2.5 sm:mb-4 sm:py-3">
                      <div className="mb-1.5 flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-foreground">
                          Best: <strong>{bestScore}%</strong>
                        </span>
                        {!noAttemptsLeft && !inProgressAttempt && (
                          <span className="text-muted-foreground">
                            {remainingAttempts} left
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, bestScore)}%`,
                            backgroundColor: passed
                              ? 'var(--success-border)'
                              : 'var(--brand-accent)',
                          }}
                        />
                      </div>
                      {passed && (
                        <div
                          className="mt-1.5 flex items-center gap-1 text-[10px] font-bold sm:text-[11px]"
                          style={{ color: 'var(--success-fg)' }}
                        >
                          <CheckCircle2 size={12} /> Passed
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-2">
                    {inProgressAttempt ? (
                      <Link
                        href={`/learner/quizzes/${quiz.id}`}
                        className="w-full"
                      >
                        <Button className="w-full text-xs sm:text-sm" variant="secondary">
                          <Play size={15} /> Resume Quiz
                        </Button>
                      </Link>
                      ) : noAttemptsLeft ? (
                        <>
                          <Button disabled className="flex-1 text-xs sm:text-sm" variant="outline">
                            No Attempts
                          </Button>
                          {latestCompletedId && quiz.show_results_to_students !== false && (
                            <Link href={`/learner/quizzes/results/${latestCompletedId}`}>
                              <Button variant="outline" size="icon" title="View Results">
                                <BarChart2 size={16} />
                              </Button>
                            </Link>
                          )}
                        </>
                      ) : (
                      <Link
                        href={`/learner/quizzes/${quiz.id}`}
                        className="w-full"
                      >
                        <Button className="w-full text-xs sm:text-sm">
                          {attemptCount > 0
                            ? 'Try Another Attempt'
                            : 'Start Quiz'}
                          <Play size={15} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={!hasPrev}
                className={
                  !hasPrev
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                <ChevronLeft size={14} /> Previous
              </Link>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {meta.last_page}
              </span>
              <Link
                href={pageHref(Math.min(meta.last_page, currentPage + 1))}
                aria-disabled={!hasNext}
                className={
                  !hasNext
                    ? 'pointer-events-none inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground opacity-50'
                    : 'inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted'
                }
              >
                Next <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}