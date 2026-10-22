import { notFound } from 'next/navigation'
import { getHomeworkServer, listAttachmentsServer } from '@/lib/homework.server'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import { getTrialStatusServer, getActiveSubscriptionServer } from '@/lib/dashboard.server'
import { hasAccess } from '@/lib/access'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import type { HomeworkSubmission } from '@/types/homework'
import { LearnerHomeworkDetail } from './learner-homework-detail'

export default async function LearnerHomeworkDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const session = await getSessionUser()
  if (!session) return null

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])
  if (!hasAccess(subscription, trial)) {
    return <UpgradePrompt title="Homework Locked" description="Subscribe to a plan to view and submit your homework assignments." />
  }

  const [hw, attachments] = await Promise.all([
    getHomeworkServer(id),
    listAttachmentsServer(id),
  ])
  if (!hw) notFound()

  let submission: HomeworkSubmission | null = null
  try {
    const res = await serverApiRequest<any>(`/api/v1/homework/${id}/submissions`)
    const allSubmissions = Array.isArray(res) ? res : res.data || []
    submission = allSubmissions.find((s: any) => s.student_id === session.id) || null
  } catch {
    submission = null
  }

  return <LearnerHomeworkDetail homework={hw} attachments={attachments} submission={submission} />
}