import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listQuizzesServer } from '@/lib/quizzes.server'
import { listClassesServer } from '@/lib/lessons.server'
import { TeacherQuizzesView } from './teacher-quizzes-view'

export const metadata: Metadata = { title: 'My Quizzes' }
export const dynamic = 'force-dynamic'

export default async function TeacherQuizzesPage({ searchParams }: { searchParams: { q?: string, class_id?: string } }) {
  const session = await getSessionUser()
  if (!session) return null

  const [quizzes, classes] = await Promise.all([
    listQuizzesServer({ q: searchParams.q, class_id: searchParams.class_id ? Number(searchParams.class_id) : undefined }),
    listClassesServer()
  ])

  return <TeacherQuizzesView quizzes={quizzes} classes={classes} />
}