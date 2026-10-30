import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getQuizServer, getAttemptsServer } from '@/lib/quizzes.server'
import { ResultsView } from './results-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Quiz Results' }

export default async function QuizResultsPage({
  params,
}: {
  params: { id: string }
}) {
  const quizId = Number(params.id)
  if (!Number.isFinite(quizId)) notFound()

  const [quiz, attempts] = await Promise.all([
    getQuizServer(quizId),
    getAttemptsServer(quizId)
  ])

  if (!quiz) notFound()

  return <ResultsView quiz={quiz} initialAttempts={attempts} />
}