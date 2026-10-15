'use client'

import { ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { HomeworkSubmission } from '@/types/admin'

export function UserSubmissionsCard({
  submissions,
}: {
  submissions: HomeworkSubmission[]
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Recent homework submissions</h3>
      </header>

      <div className="p-2">
        {submissions.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-4 text-sm text-muted-foreground">
            <ClipboardList size={16} />
            No homework submissions yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {submissions.slice(0, 10).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    Homework #{s.homework_id}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.submitted_at
                      ? `Submitted ${formatDate(s.submitted_at)}`
                      : 'Not submitted'}
                    {s.grade != null && <> · Grade: {s.grade}</>}
                  </p>
                </div>
                <Badge
                  tone={
                    s.status === 'graded'
                      ? 'success'
                      : s.status === 'late'
                        ? 'danger'
                        : s.status === 'submitted'
                          ? 'info'
                          : 'default'
                  }
                >
                  {s.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}