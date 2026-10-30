import type { Metadata } from 'next'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { QuizForm } from '../components/quiz-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Create Quiz' }

export default async function CreateQuizPage() {
  const [classes, subjects] = await Promise.all([listClassesServer(), listSubjectsServer()])
  return <QuizForm classes={classes} subjects={subjects} mode="create" />
}