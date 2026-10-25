import { redirect } from 'next/navigation'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import {
  getTrialStatusServer,
  getActiveSubscriptionServer,
} from '@/lib/dashboard.server'
import { getAccessReason } from '@/lib/access'
import type { HomeworkSubmission } from '@/types/homework'
import { LearnerHomeworkDetail } from './learner-homework-detail'

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

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') {
    redirect(`/learner/homework?locked=${reason}`)
  }

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
      `/api/v1/homework/${id}/submissions`,
    )
    const allSubmissions = Array.isArray(res)
      ? (res as HomeworkSubmission[])
      : ((res as { data?: HomeworkSubmission[] }).data ?? [])
    submission =
      allSubmissions.find((s) => s.student_id === session.id) ?? null
  } catch {
    submission = null
  }

  return (
    <LearnerHomeworkDetail
      homework={hw}
      attachments={attachments}
      submission={submission}
    />
  )
}