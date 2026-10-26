'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { QuizAttempt } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const AttemptRow = React.memo(function AttemptRow({ attempt }: { attempt: QuizAttempt }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          Quiz #{attempt.quiz_id}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {attempt.completed_at ? dateFormatter.format(new Date(attempt.completed_at)) : `Started ${dateFormatter.format(new Date(attempt.started_at))}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {attempt.status === 'completed' && (
          <span className="text-sm font-semibold text-foreground">{attempt.score ?? 0}%</span>
        )}
        <Badge
          tone={
            attempt.status === 'completed'
              ? 'success'
              : attempt.status === 'expired'
                ? 'danger'
                : 'warning'
          }
        >
          {attempt.status}
        </Badge>
      </div>
    </li>
  )
})

export function UserAttemptsCard({ attempts }: { attempts: QuizAttempt[] }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Recent quiz attempts</h3>
      </header>

      <div className="p-2">
        {attempts.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-6 text-sm text-muted-foreground">
            <HelpCircle size={16} />
            No quiz attempts yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {attempts.slice(0, 5).map((a) => (
              <AttemptRow key={a.id} attempt={a} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}