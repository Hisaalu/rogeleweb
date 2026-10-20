import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listQuizzesServer, listMyAttemptsServer } from '@/lib/quizzes.server'
import { LearnerQuizzesView } from './learner-quizzes-view'

export const metadata: Metadata = { title: 'Practice Quizzes' }
export const dynamic = 'force-dynamic'

export default async function LearnerQuizzesPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [quizzes, attempts] = await Promise.all([
    listQuizzesServer({ class_id: session.class_id ?? undefined }),
    listMyAttemptsServer()
  ])

  return <LearnerQuizzesView quizzes={quizzes} attempts={attempts} />
}