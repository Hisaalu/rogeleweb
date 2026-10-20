import { notFound } from 'next/navigation'
import { getAttemptServer } from '@/lib/quizzes.server'
import { ResultView } from './result-view'

export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const id = Number(params.attemptId)
  if (!Number.isFinite(id)) notFound()

  const attempt = await getAttemptServer(id)
  if (!attempt) notFound()

  return <ResultView attempt={attempt} />
}