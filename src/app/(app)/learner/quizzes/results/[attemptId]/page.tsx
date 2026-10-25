import { notFound, redirect } from 'next/navigation'
import { getAttemptServer } from '@/lib/quizzes.server'
import { getTrialStatusServer, getActiveSubscriptionServer } from '@/lib/dashboard.server'
import { getAccessReason } from '@/lib/access'
import { ResultView } from './result-view'

export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const id = Number(params.attemptId)
  if (!Number.isFinite(id)) notFound()

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') {
    redirect(`/learner/quizzes?locked=${reason}`)
  }

  const attempt = await getAttemptServer(id)
  if (!attempt) notFound()

  return <ResultView attempt={attempt} />
}