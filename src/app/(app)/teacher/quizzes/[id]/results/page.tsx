import { notFound } from 'next/navigation'
import { getQuizServer } from '@/lib/quizzes.server'
import { ResultsView } from './results-view'

export default async function QuizResultsPage({
  params,
}: {
  params: { id: string }
}) {
  const quizId = Number(params.id)
  if (!Number.isFinite(quizId)) notFound()

  const quiz = await getQuizServer(quizId)
  if (!quiz) notFound()

  return <ResultsView quiz={quiz} />
}