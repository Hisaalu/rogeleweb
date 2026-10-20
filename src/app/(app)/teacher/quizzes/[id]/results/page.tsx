import { notFound } from 'next/navigation'
import { getQuizServer } from '@/lib/quizzes.server'
import { serverApiRequest } from '@/lib/server-api'
import { ResultsView } from './results-view'
import type { QuizAttempt } from '@/types/quiz'

export default async function QuizResultsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [quiz, attemptsRes] = await Promise.all([
    getQuizServer(id),
    serverApiRequest<unknown>(`/api/v1/quizzes/${id}/attempts`).catch(() => [])
  ])
  if (!quiz) notFound()

  const attempts = (Array.isArray(attemptsRes) ? attemptsRes : []) as QuizAttempt[]

  return <ResultsView quiz={quiz} attempts={attempts} />
}