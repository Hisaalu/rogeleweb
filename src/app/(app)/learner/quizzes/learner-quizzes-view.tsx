'use client'

import Link from 'next/link'
import {
  HelpCircle,
  Clock,
  Trophy,
  Play,
  BarChart2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Quiz, QuizAttempt } from '@/types/quiz'

export function LearnerQuizzesView({
  quizzes,
  attempts,
}: {
  quizzes: Quiz[]
  attempts: QuizAttempt[]
}) {
  const visibleQuizzes = quizzes.filter((q) => (q.question_count ?? 0) > 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <HelpCircle size={28} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>
            Practice Quizzes
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Test your knowledge with interactive quizzes
        </p>
      </div>

      {visibleQuizzes.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <HelpCircle
            size={48}
            className="mx-auto mb-4 opacity-30"
            style={{ color: 'var(--brand-accent)' }}
          />
          <h3 className="text-lg font-bold text-foreground">
            No Quizzes Available
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for new quizzes!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

            return (
              <Card
                key={quiz.id}
                className={`relative flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-md ${
                  inProgressAttempt || noAttemptsLeft
                    ? 'border-warning-border bg-warning-bg/30'
                    : 'border-border'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                      color: 'var(--brand-primary)',
                    }}
                  >
                    {quiz.subject_name ?? 'General'}
                  </span>
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      color: 'var(--brand-accent)',
                    }}
                  >
                    {quiz.class_name ?? 'All Levels'}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="mb-4 line-clamp-2 flex-grow text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                )}

                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HelpCircle
                      size={13}
                      style={{ color: 'var(--brand-accent)' }}
                    />
                    {quiz.question_count ?? 0} qns
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock
                      size={13}
                      style={{ color: 'var(--brand-accent)' }}
                    />
                    {quiz.time_limit ?? 30}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy
                      size={13}
                      style={{ color: 'var(--brand-accent)' }}
                    />
                    {passingScore}% pass
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw
                      size={13}
                      style={{ color: 'var(--brand-accent)' }}
                    />
                    {attemptCount}/{maxAttempts} attempts
                  </span>
                </div>

                {completedAttempts.length > 0 && (
                  <div className="mb-4 border-y border-border py-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
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
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-bold"
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
                      <Button className="w-full" variant="secondary">
                        <Play size={15} /> Resume Quiz
                      </Button>
                    </Link>
                  ) : noAttemptsLeft ? (
                    <>
                      <Button disabled className="flex-1" variant="outline">
                        No Attempts
                      </Button>
                      {latestCompletedId && (
                        <Link
                          href={`/learner/quizzes/results/${latestCompletedId}`}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            title="View Results"
                          >
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
                      <Button className="w-full">
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
      )}
    </div>
  )
}