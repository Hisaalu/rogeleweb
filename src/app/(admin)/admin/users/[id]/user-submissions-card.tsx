'use client'

import React from 'react'
import { ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { HomeworkSubmission } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const SubmissionRow = React.memo(function SubmissionRow({ submission }: { submission: HomeworkSubmission }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          Homework #{submission.homework_id}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {submission.submitted_at
            ? dateFormatter.format(new Date(submission.submitted_at))
            : 'Not submitted'}
          {submission.grade != null && <> · Grade: {submission.grade}</>}
        </p>
      </div>
      <Badge
        tone={
          submission.status === 'graded'
            ? 'success'
            : submission.status === 'late'
              ? 'danger'
              : submission.status === 'submitted'
                ? 'info'
                : 'default'
        }
      >
        {submission.status}
      </Badge>
    </li>
  )
})

export function UserSubmissionsCard({
  submissions,
}: {
  submissions: HomeworkSubmission[]
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Recent homework submissions</h3>
      </header>

      <div className="p-2">
        {submissions.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-6 text-sm text-muted-foreground">
            <ClipboardList size={16} />
            No homework submissions yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {submissions.slice(0, 5).map((s) => (
              <SubmissionRow key={s.id} submission={s} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}