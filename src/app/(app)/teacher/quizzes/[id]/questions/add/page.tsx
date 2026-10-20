import { notFound } from 'next/navigation'
import { getQuizServer } from '@/lib/quizzes.server'
import { AddQuestionsView } from '../add-questions-view'

export default async function AddQuestionsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const quiz = await getQuizServer(id)
  if (!quiz) notFound()

  return <AddQuestionsView quiz={quiz} />
}