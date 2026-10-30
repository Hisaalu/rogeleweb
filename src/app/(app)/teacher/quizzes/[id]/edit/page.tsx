import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getQuizServer } from '@/lib/quizzes.server'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { QuizForm } from '../../components/quiz-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Edit Quiz' }

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [quiz, classes, subjects] = await Promise.all([
    getQuizServer(id),
    listClassesServer(),
    listSubjectsServer()
  ])
  if (!quiz) notFound()

  return <QuizForm classes={classes} subjects={subjects} mode="edit" initial={quiz} />
}