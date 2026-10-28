import { redirect } from 'next/navigation'
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
  if (!Number.isFinite(id)) redirect('/learner/quizzes?error=not_found')

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const reason = getAccessReason(subscription, trial)
  if (reason !== 'ok') redirect(`/learner/quizzes?locked=${reason}`)

  const [quiz, questions] = await Promise.all([
    getQuizServer(id),
    listQuestionsServer(id),
  ])

  if (!quiz) redirect('/learner/quizzes?error=not_found')
  if (questions.length === 0) redirect('/learner/quizzes?error=no_questions')

  return <TakeQuizView quiz={quiz} questions={questions} />
}