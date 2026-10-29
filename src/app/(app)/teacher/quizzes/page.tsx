import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listAllQuizzesServer } from '@/lib/quizzes.server'
import { listClassesServer } from '@/lib/lessons.server'
import { TeacherQuizzesView } from './teacher-quizzes-view'

export const metadata: Metadata = { title: 'Quizzes' }
export const dynamic = 'force-dynamic'

export default async function TeacherQuizzesPage({
  searchParams,
}: {
  searchParams: { q?: string; class_id?: string; page?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const q = searchParams.q?.trim() || undefined
  const classIdRaw = searchParams.class_id
  const classId =
    classIdRaw && Number.isFinite(Number(classIdRaw)) ? Number(classIdRaw) : undefined
  const page = searchParams.page ? Number(searchParams.page) : 1

  const [result, classes] = await Promise.all([
    listAllQuizzesServer({ q, class_id: classId, page }),
    listClassesServer(),
  ])

  return (
    <TeacherQuizzesView 
      quizzes={result.quizzes} 
      meta={result.meta} 
      classes={classes} 
    />
  )
}