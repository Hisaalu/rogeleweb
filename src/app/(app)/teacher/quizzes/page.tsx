import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listAllQuizzesServer } from '@/lib/quizzes.server'
import { listClassesServer } from '@/lib/lessons.server'
import { TeacherQuizzesView } from './teacher-quizzes-view'

export const metadata: Metadata = { title: 'Quizzes' }
export const dynamic = 'force-dynamic'

export default async function TeacherQuizzesPage() {
  const session = await getSessionUser()
  if (!session) return null

  const [quizzes, classes] = await Promise.all([
    listAllQuizzesServer({}),
    listClassesServer(),
  ])

  return <TeacherQuizzesView quizzes={quizzes} classes={classes} />
}