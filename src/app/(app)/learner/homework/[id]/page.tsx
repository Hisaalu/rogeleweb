import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import {
  getTrialStatusServer,
  getActiveSubscriptionServer,
} from '@/lib/dashboard.server'
import type { HomeworkSubmission } from '@/types/homework'
import { LearnerHomeworkDetail } from './learner-homework-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Homework' }

function extractSubmissions(res: unknown): HomeworkSubmission[] {
  if (!res) return []
  if (Array.isArray(res)) return res as HomeworkSubmission[]
  const obj = res as {
    data?: unknown
    value?: unknown
    submissions?: unknown
  }
  if (Array.isArray(obj.data)) return obj.data as HomeworkSubmission[]
  if (Array.isArray(obj.value)) return obj.value as HomeworkSubmission[]
  if (Array.isArray(obj.submissions)) return obj.submissions as HomeworkSubmission[]
  return []
}

function getSubmissionHomeworkId(sub: any): number | null {
  const raw = sub?.homework_id ?? sub?.homeworkId ?? sub?.assignment_id ?? sub?.assignmentId
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

export default async function LearnerHomeworkDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) {
    redirect('/learner/homework?error=not_found')
  }

  const session = await getSessionUser()
  if (!session) return null

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const [hw, attachments] = await Promise.all([
    getHomeworkServer(id),
    listAttachmentsServer(id),
  ])

  if (!hw) {
    redirect('/learner/homework?error=not_found')
  }

  let submission: HomeworkSubmission | null = null
  try {
    const res = await serverApiRequest<unknown>(
      '/api/v1/homework/my-submissions',
    )
    const all = extractSubmissions(res)
    const matched =
      all.find((s) => getSubmissionHomeworkId(s) === id) ??
      hw.submission ??
      null

    if (matched) {
      const m = matched as HomeworkSubmission & {
        textAnswer?: string | null
        submittedAt?: string
      }
      submission = {
        ...matched,
        homework_id: getSubmissionHomeworkId(matched) ?? id,
        text_answer: matched.text_answer ?? m.textAnswer ?? null,
        submitted_at: matched.submitted_at ?? m.submittedAt ?? '',
        files: Array.isArray(matched.files) ? matched.files : [],
      }
    }
  } catch {
    submission = null
  }

  const hasActiveSubscription = subscription?.status === 'active'
  const inActiveTrial = !!trial?.is_in_trial
  const canSubmit = hasActiveSubscription || inActiveTrial

  const gateReason: 'trial_expired' | 'no_plan' | null = canSubmit
    ? null
    : trial?.end_date && (trial.days_remaining ?? 0) <= 0
      ? 'trial_expired'
      : 'no_plan'

  return (
    <LearnerHomeworkDetail
      homework={hw}
      attachments={attachments}
      submission={submission}
      gateReason={gateReason}
      learnerName={`${session.first_name ?? ''} ${session.last_name ?? ''}`.trim()}
      learnerPhoto={session.profile_photo ?? null}
    />
  )
}