import { notFound, redirect } from 'next/navigation'
import { getQuizServer, listQuestionsServer } from '@/lib/quizzes.server'
import { getTrialStatusServer, getActiveSubscriptionServer } from '@/lib/dashboard.server'
import { hasAccess } from '@/lib/access'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { TakeQuizView } from './take-quiz-view'

export default async function TakeQuizPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [trial, subscription] = await Promise.all([
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])
  if (!hasAccess(subscription, trial)) {
    return <UpgradePrompt title="Quiz Locked" description="Subscribe to a plan to take quizzes and test your knowledge." />
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
        <p className="text-muted-foreground">This quiz doesn't have any questions yet.</p>
      </div>
    )
  }

  return <TakeQuizView quiz={quiz} questions={questions} />
}