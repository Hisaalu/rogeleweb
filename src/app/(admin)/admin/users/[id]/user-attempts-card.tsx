'use client'

import { HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { QuizAttempt } from '@/types/admin'

export function UserAttemptsCard({ attempts }: { attempts: QuizAttempt[] }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Recent quiz attempts</h3>
      </header>

      <div className="p-2">
        {attempts.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-4 text-sm text-muted-foreground">
            <HelpCircle size={16} />
            No quiz attempts yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {attempts.slice(0, 10).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    Quiz #{a.quiz_id}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Started {formatDate(a.started_at)}
                    {a.completed_at && <> · Completed {formatDate(a.completed_at)}</>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {a.status === 'completed' ? (
                    <span className="text-sm font-semibold">{a.score ?? 0}%</span>
                  ) : null}
                  <Badge
                    tone={
                      a.status === 'completed'
                        ? 'success'
                        : a.status === 'expired'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}