import { notFound, redirect } from 'next/navigation'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'
import {
  getTrialStatusServer,
  getActiveSubscriptionServer,
} from '@/lib/dashboard.server'
import { getAccessReason } from '@/lib/access'
import { TakeQuizView } from './take-quiz-view'

export default async function TakeQuizPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') {
    redirect(`/learner/quizzes?locked=${reason}`)
  }

  const [quiz, questions] = await Promise.all([
    getQuizServer(id),
    listQuestionsServer(id),
  ])
  if (!quiz) notFound()
  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">No Questions Found</h2>
        <p className="text-muted-foreground">
          This quiz doesn&apos;t have any questions yet.
        </p>
      </div>
    )
  }

  return <TakeQuizView quiz={quiz} questions={questions} />
}