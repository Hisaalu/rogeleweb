'use client'

import Link from 'next/link'
import { 
  HelpCircle, Clock, Trophy, RefreshCw, CalendarX, Play, 
  BarChart2, AlertTriangle, CheckCircle2, Crown, LineChart
} from 'lucide-react'
import type { Quiz, QuizAttempt } from '@/types/quiz'

export function LearnerQuizzesView({ quizzes, attempts }: { quizzes: Quiz[], attempts: QuizAttempt[] }) {
  const now = new Date().getTime()
  
  const completedAttempts = attempts.filter(a => a.status === 'completed')
  const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0)
  const avgScore = completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0
  const isTopPerformer = avgScore >= 80

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">

      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <HelpCircle size={28} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>Practice Quizzes</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Test your knowledge with interactive quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-lg font-bold text-foreground">No Quizzes Available</h3>
          <p className="mt-2 text-sm text-muted-foreground">Check back later for new quizzes!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const quizAttempts = attempts.filter(a => a.quiz_id === quiz.id)
            
            const finishedAttempts = quizAttempts.filter(a => a.status === 'completed' || a.status === 'expired')
            const attemptCount = finishedAttempts.length
            
            // FIX: Strictly check for 'in_progress'
            const inProgressAttempt = quizAttempts.find(a => a.status === 'in_progress')
            const hasInProgress = !!inProgressAttempt
            
            const bestScore = finishedAttempts.reduce((max, a) => Math.max(max, a.score || 0), 0)
            
            const sortedFinished = [...finishedAttempts].sort((a, b) => 
              new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
            )
            const latestAttemptId = sortedFinished.length > 0 ? sortedFinished[0].id : null
            
            const maxAttempts = quiz.max_attempts ?? 3
            const remainingAttempts = Math.max(0, maxAttempts - attemptCount)
            const passingScore = quiz.passing_score ?? 70
            const hasQuestions = (quiz.question_count ?? 0) > 0
            const endDate = quiz.end_date
            const isExpired = !!endDate && new Date(endDate).getTime() < now
            const noAttemptsLeft = remainingAttempts <= 0 && attemptCount > 0

            return (
              <div 
                key={quiz.id} 
                className={`relative flex flex-col rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  noAttemptsLeft 
                    ? 'border-warning-border bg-warning-bg/30' 
                    : hasInProgress
                      ? 'border-warning-border bg-warning-bg/30'
                      : 'border-border bg-card'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                    {quiz.subject_name ?? 'General'}
                  </span>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                    {quiz.class_name ?? 'All Levels'}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground">{quiz.title}</h3>
                {quiz.description && (
                  <p className="mb-4 line-clamp-2 flex-grow text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                )}

                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><HelpCircle size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.question_count ?? 0} qns</span>
                  <span className="flex items-center gap-1"><Clock size={13} style={{ color: 'var(--brand-accent)' }} /> {quiz.time_limit ?? 30}m</span>
                  <span className="flex items-center gap-1"><Trophy size={13} style={{ color: 'var(--brand-accent)' }} /> {passingScore}% pass</span>
                  <span className="flex items-center gap-1"><RefreshCw size={13} style={{ color: 'var(--brand-accent)' }} /> {attemptCount}/{maxAttempts} attempts</span>
                </div>

                {endDate && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium w-fit"
                       style={{
                         backgroundColor: isExpired ? 'var(--danger-bg)' : 'var(--warning-bg)',
                         color: isExpired ? 'var(--danger-fg)' : 'var(--warning-fg)'
                       }}>
                    <CalendarX size={12} />
                    {isExpired ? 'Expired' : `Due: ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </div>
                )}

                {attemptCount > 0 && (
                  <div className="mb-4 border-y border-border py-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-foreground">Best: <strong>{bestScore}%</strong></span>
                      {remainingAttempts > 0 && !hasInProgress && <span className="text-muted-foreground">{remainingAttempts} left</span>}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(100, bestScore)}%`, 
                          backgroundColor: bestScore >= passingScore ? 'var(--success-border)' : 'var(--brand-accent)' 
                        }} 
                      />
                    </div>
                    {bestScore >= passingScore && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--success-fg)' }}>
                        <CheckCircle2 size={12} /> Passed
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-2">
                  {isExpired ? (
                    <>
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold"
                           style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                        <CalendarX size={15} /> Expired
                      </div>
                      {latestAttemptId && (
                        <Link href={`/learner/quizzes/results/${latestAttemptId}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80" title="View Results">
                          <BarChart2 size={16} />
                        </Link>
                      )}
                    </>
                  ) : hasInProgress ? (
                    <Link href={`/learner/quizzes/${quiz.id}`} className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--warning-border)' }}>
                      <Play size={15} /> Resume Quiz
                    </Link>
                  ) : noAttemptsLeft ? (
                    <>
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold"
                           style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>
                        No Attempts
                      </div>
                      {latestAttemptId && (
                        <Link href={`/learner/quizzes/results/${latestAttemptId}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80" title="View Results">
                          <BarChart2 size={16} />
                        </Link>
                      )}
                    </>
                  ) : remainingAttempts > 0 && hasQuestions ? (
                    <Link href={`/learner/quizzes/${quiz.id}`} className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
                      {attemptCount > 0 ? 'Try Another Attempt' : 'Start Quiz'} <Play size={15} />
                    </Link>
                  ) : (
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold"
                         style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                      <AlertTriangle size={15} /> Unavailable
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}